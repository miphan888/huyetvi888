/* =====================================================
   HUYỆT VỊ 888 — smart-search.js
   SmartSearch component — tái sử dụng toàn bộ trang
   ===================================================== */

(function (global) {
  'use strict';

  /**
   * SmartSearch — khởi tạo search có autocomplete
   * @param {HTMLElement|string} container - element hoặc selector chứa component
   * @param {object} options
   *   - placeholder {string}
   *   - onSearch {function(query)}  — gọi khi submit/Enter
   *   - onSuggest {function(query)} — (optional) custom suggest, return Promise<array>
   *   - recentKey {string}          — localStorage key cho lịch sử
   *   - navigateTo {string}         — URL để redirect khi search (ví dụ: 'search.html')
   */
  function SmartSearch(container, options) {
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) return;

    options = Object.assign({
      placeholder: 'Tìm huyệt vị...',
      onSearch: null,
      onSuggest: null,
      recentKey: 'huyet888-recent-searches',
      navigateTo: null,
    }, options);

    // ── Build HTML ──────────────────────────────────
    container.classList.add('smart-search-wrap');
    container.innerHTML = `
      <div class="smart-search-inner">
        <span class="smart-search-icon" aria-hidden="true">🔍</span>
        <input
          type="text"
          class="smart-search-input"
          placeholder="${escHtml(options.placeholder)}"
          autocomplete="off"
          spellcheck="false"
          aria-label="${escHtml(options.placeholder)}"
          aria-haspopup="listbox"
          aria-autocomplete="list"
        >
        <button class="smart-search-clear" aria-label="Xóa" tabindex="-1">✕</button>
      </div>
      <div class="smart-search-dropdown" role="listbox" aria-label="Gợi ý tìm kiếm"></div>
    `;

    const input    = container.querySelector('.smart-search-input');
    const clearBtn = container.querySelector('.smart-search-clear');
    const dropdown = container.querySelector('.smart-search-dropdown');

    let debounceTimer = null;
    let activeIndex   = -1;
    let currentItems  = [];

    // ── localStorage helpers ─────────────────────
    function getRecent() {
      try { return JSON.parse(localStorage.getItem(options.recentKey) || '[]'); }
      catch (e) { return []; }
    }
    function saveRecent(query) {
      if (!query.trim()) return;
      let recent = getRecent().filter(r => r !== query);
      recent.unshift(query);
      recent = recent.slice(0, 8);
      try { localStorage.setItem(options.recentKey, JSON.stringify(recent)); }
      catch (e) {}
    }
    function removeRecent(query) {
      const recent = getRecent().filter(r => r !== query);
      try { localStorage.setItem(options.recentKey, JSON.stringify(recent)); }
      catch (e) {}
    }

    // ── Normalize helper ─────────────────────────
    function norm(s) {
      if (typeof normalizeVietnamese === 'function') return normalizeVietnamese(s);
      return (s || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/gi, 'd');
    }

    // ── Highlight match ──────────────────────────
    function highlight(text, query) {
      if (!query) return escHtml(text);
      const nText  = norm(text);
      const nQuery = norm(query);
      const idx    = nText.indexOf(nQuery);
      if (idx === -1) return escHtml(text);
      return escHtml(text.slice(0, idx))
        + '<mark>' + escHtml(text.slice(idx, idx + query.length)) + '</mark>'
        + escHtml(text.slice(idx + query.length));
    }

    function escHtml(s) {
      return String(s || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ── Default suggest từ HUYET_DATA ───────────
    function defaultSuggest(query) {
      if (!query || query.length < 2) return Promise.resolve([]);
      const q = norm(query);
      const data = (typeof HUYET_DATA !== 'undefined') ? HUYET_DATA : [];
      const results = [];
      for (let i = 0; i < data.length && results.length < 8; i++) {
        const item = data[i];
        if (
          norm(item.tenViet).includes(q) ||
          norm(item.maHuyet).includes(q) ||
          norm(item.duongKinh).includes(q)
        ) {
          results.push({
            label: item.tenViet,
            sub:   item.maHuyet + ' · ' + item.duongKinh,
            icon:  '☯',
            query: item.tenViet,
          });
        }
      }
      return Promise.resolve(results);
    }

    // ── Render dropdown ──────────────────────────
    function renderDropdown(query) {
      const q = query.trim();

      // Khi rỗng: hiện recent searches
      if (!q) {
        const recent = getRecent();
        if (!recent.length) { closeDropdown(); return; }
        let html = '<div class="ss-section-label">🕐 Tìm kiếm gần đây</div>';
        html += recent.map((r, i) => `
          <div class="ss-item" data-index="${i}" data-query="${escHtml(r)}" data-type="recent">
            <span class="ss-item-icon">🕐</span>
            <span class="ss-item-text">${escHtml(r)}</span>
            <button class="ss-item-del" aria-label="Xóa" style="
              background:none;border:none;cursor:pointer;color:#aaa;
              font-size:0.8rem;padding:2px 4px;border-radius:3px;
            " onclick="event.stopPropagation();">✕</button>
          </div>
        `).join('');
        currentItems = recent.map(r => ({ query: r, type: 'recent' }));
        dropdown.innerHTML = html;
        openDropdown();
        attachItemHandlers();
        return;
      }

      // Shimmer loading
      dropdown.innerHTML = '<div class="ss-shimmer"></div><div class="ss-shimmer" style="opacity:0.5;margin-top:4px;"></div>';
      openDropdown();

      const suggestFn = (typeof options.onSuggest === 'function')
        ? options.onSuggest
        : defaultSuggest;

      suggestFn(q).then(function (items) {
        if (input.value.trim() !== q) return; // stale
        if (!items || !items.length) {
          dropdown.innerHTML = `<div class="ss-empty">😔 Không tìm thấy gợi ý cho "<strong>${escHtml(q)}</strong>"</div>`;
          currentItems = [];
          attachItemHandlers();
          return;
        }

        let html = '<div class="ss-section-label">💡 Gợi ý</div>';
        html += items.slice(0, 8).map((it, i) => `
          <div class="ss-item" data-index="${i}" data-query="${escHtml(it.query || it.label)}" role="option">
            <span class="ss-item-icon">${it.icon || '🔍'}</span>
            <div style="flex:1;min-width:0;">
              <div class="ss-item-text">${highlight(it.label, q)}</div>
              ${it.sub ? `<div class="ss-item-sub">${escHtml(it.sub)}</div>` : ''}
            </div>
          </div>
        `).join('');

        html += `<div class="ss-view-all" data-view-all="1">Xem tất cả kết quả cho "<strong>${escHtml(q)}</strong>" →</div>`;
        currentItems = items.slice(0, 8);
        dropdown.innerHTML = html;
        attachItemHandlers();
      }).catch(function () {
        dropdown.innerHTML = '<div class="ss-empty">⚠️ Lỗi tải gợi ý</div>';
      });
    }

    function attachItemHandlers() {
      // Item click
      dropdown.querySelectorAll('.ss-item').forEach(function (el) {
        el.addEventListener('click', function () {
          const q = el.getAttribute('data-query');
          selectQuery(q);
        });
      });
      // Delete recent
      dropdown.querySelectorAll('.ss-item-del').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          const q = btn.closest('.ss-item').getAttribute('data-query');
          removeRecent(q);
          renderDropdown('');
        });
      });
      // View all
      const viewAll = dropdown.querySelector('[data-view-all]');
      if (viewAll) {
        viewAll.addEventListener('click', function () {
          doSearch(input.value.trim());
        });
      }
    }

    function openDropdown()  { dropdown.classList.add('open'); activeIndex = -1; }
    function closeDropdown() { dropdown.classList.remove('open'); activeIndex = -1; }

    function selectQuery(q) {
      input.value = q;
      clearBtn.classList.add('visible');
      closeDropdown();
      doSearch(q);
    }

    function doSearch(q) {
      if (!q.trim()) return;
      saveRecent(q.trim());
      if (typeof options.onSearch === 'function') {
        options.onSearch(q);
      } else if (options.navigateTo) {
        window.location.href = options.navigateTo + '?q=' + encodeURIComponent(q);
      }
    }

    // ── Keyboard navigation ──────────────────────
    input.addEventListener('keydown', function (e) {
      const items = dropdown.querySelectorAll('.ss-item');
      if (!dropdown.classList.contains('open')) {
        if (e.key === 'ArrowDown') { renderDropdown(input.value); return; }
        return;
      }
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          activeIndex = Math.min(activeIndex + 1, items.length - 1);
          updateActive(items);
          break;
        case 'ArrowUp':
          e.preventDefault();
          activeIndex = Math.max(activeIndex - 1, -1);
          updateActive(items);
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && items[activeIndex]) {
            items[activeIndex].click();
          } else {
            doSearch(input.value.trim());
            closeDropdown();
          }
          break;
        case 'Escape':
          closeDropdown();
          input.blur();
          break;
      }
    });

    function updateActive(items) {
      items.forEach(function (el, i) {
        el.classList.toggle('active', i === activeIndex);
      });
      if (activeIndex >= 0 && items[activeIndex]) {
        input.value = items[activeIndex].getAttribute('data-query') || input.value;
      }
    }

    // ── Input events ─────────────────────────────
    input.addEventListener('input', function () {
      const q = input.value;
      clearBtn.classList.toggle('visible', q.length > 0);
      clearTimeout(debounceTimer);
      if (q.length === 0) {
        renderDropdown('');
        return;
      }
      if (q.length < 2) { closeDropdown(); return; }
      debounceTimer = setTimeout(function () {
        renderDropdown(q.trim());
      }, 300);
    });

    input.addEventListener('focus', function () {
      if (input.value.length === 0) renderDropdown('');
    });

    clearBtn.addEventListener('click', function () {
      input.value = '';
      clearBtn.classList.remove('visible');
      closeDropdown();
      input.focus();
    });

    // Click ngoài → đóng
    document.addEventListener('click', function (e) {
      if (!container.contains(e.target)) closeDropdown();
    });

    // ── Public API ───────────────────────────────
    return {
      focus: function () { input.focus(); },
      setValue: function (v) { input.value = v; clearBtn.classList.toggle('visible', v.length > 0); },
      getValue: function () { return input.value; },
      clear: function () { input.value = ''; clearBtn.classList.remove('visible'); closeDropdown(); },
    };
  }

  // Export ra global
  global.SmartSearch = SmartSearch;

})(window);
