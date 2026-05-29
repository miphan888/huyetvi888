/* =====================================================
   HUYỆT VỊ 888 — filter.js
   Disease / symptom filter page logic
   ===================================================== */

(function () {
  'use strict';

  const filterContainer   = document.getElementById('filter-chips-container');
  const activeFiltersWrap = document.getElementById('active-filters');
  const clearAllBtn       = document.getElementById('clear-all-btn');
  const filterSearch      = document.getElementById('filter-search');
  const resultsGrid       = document.getElementById('filter-results-grid');
  const resultCount       = document.getElementById('filter-result-count');

  if (!filterContainer || !resultsGrid) return;

  // ---- State ----
  let activeFilters = new Set();
  let searchQuery   = '';

  // ---- Category keywords map ----
  const CATEGORIES = {
    'Đau': ['đau', 'nhức', 'thống'],
    'Tiêu hóa': ['dạ dày', 'tiêu hóa', 'nôn', 'buồn nôn', 'táo bón', 'tiêu chảy', 'đại tràng', 'ruột', 'tiêu'],
    'Hô hấp': ['ho', 'hen', 'suyễn', 'phổi', 'hô hấp', 'viêm phế', 'viêm khí', 'ngực', 'khó thở'],
    'Thần kinh': ['thần kinh', 'liệt', 'co giật', 'động kinh', 'hoa mắt', 'chóng mặt', 'đầu', 'mất ngủ', 'ngủ', 'lo', 'trầm cảm', 'tâm thần'],
    'Tim mạch': ['tim', 'huyết áp', 'mạch', 'đánh trống', 'hồi hộp', 'thiếu máu'],
    'Phụ khoa': ['kinh nguyệt', 'phụ khoa', 'bế kinh', 'kinh', 'âm đạo', 'tử cung', 'sinh sản', 'phụ nữ', 'sau sinh'],
    'Xương khớp': ['khớp', 'xương', 'lưng', 'cột sống', 'vai', 'cổ', 'gối', 'tê', 'bại'],
    'Da liễu': ['da', 'ngứa', 'mụn', 'eczema', 'dị ứng', 'nổi mẩn'],
    'Tiết niệu': ['tiểu', 'tiết niệu', 'thận', 'bàng quang', 'di niệu', 'đái dầm'],
    'Mắt - Tai - Mũi': ['mắt', 'tai', 'mũi', 'họng', 'miệng', 'răng', 'tai ù'],
  };

  // ---- Extract and categorize keywords ----
  function buildKeywords() {
    const keywordSet = new Map(); // keyword -> Set of matching indices

    HUYET_DATA.forEach((item, idx) => {
      const text = ((item.tacDung || '') + ' ' + (item.chuTri || '')).toLowerCase();

      // Extract individual disease mentions by splitting on common separators
      const parts = text.split(/[,;.\n*]/);
      parts.forEach(part => {
        const cleaned = part.replace(/[()]/g, '').trim();
        if (cleaned.length > 3 && cleaned.length < 50) {
          if (!keywordSet.has(cleaned)) keywordSet.set(cleaned, new Set());
          keywordSet.get(cleaned).add(idx);
        }
      });
    });

    return keywordSet;
  }

  // Build a curated list per category
  function buildCategoryChips() {
    const result = {};

    Object.entries(CATEGORIES).forEach(([cat, keywords]) => {
      const chips = new Set();
      HUYET_DATA.forEach(item => {
        const text = ((item.tacDung || '') + ' ' + (item.chuTri || '')).toLowerCase();
        keywords.forEach(kw => {
          if (text.includes(kw)) chips.add(kw);
        });
      });
      if (chips.size > 0) result[cat] = [...chips].sort();
    });

    // "Khác" — frequent terms not yet categorized
    const allCatKw = Object.values(CATEGORIES).flat();
    const otherChips = new Set();
    HUYET_DATA.forEach(item => {
      const parts = ((item.chuTri || '')).split(/[,;]/);
      parts.forEach(p => {
        const t = p.trim().toLowerCase();
        if (t.length > 3 && t.length < 30 && !allCatKw.some(k => t.includes(k))) {
          otherChips.add(t);
        }
      });
    });
    // Limit "Khác" to most common
    result['Khác'] = [...otherChips].slice(0, 20).sort();

    return result;
  }

  // ---- Render filter chips ----
  function renderChips() {
    const cats = buildCategoryChips();
    filterContainer.innerHTML = '';

    Object.entries(cats).forEach(([cat, chips]) => {
      if (!chips || chips.length === 0) return;
      const block = document.createElement('div');
      block.className = 'filter-category';

      const title = document.createElement('div');
      title.className = 'filter-cat-title';
      title.textContent = cat;
      block.appendChild(title);

      const row = document.createElement('div');
      row.className = 'chips-wrap';

      chips.forEach(chip => {
        const btn = document.createElement('button');
        btn.className = 'chip' + (activeFilters.has(chip) ? ' active' : '');
        btn.dataset.kw = chip;

        const label = document.createTextNode(capitalizeFirst(chip));
        btn.appendChild(label);

        if (activeFilters.has(chip)) {
          const x = document.createElement('span');
          x.className = 'chip-remove';
          x.textContent = '✕';
          btn.appendChild(x);
        }

        btn.addEventListener('click', () => toggleFilter(chip));
        row.appendChild(btn);
      });

      block.appendChild(row);
      filterContainer.appendChild(block);
    });
  }

  function capitalizeFirst(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // ---- Toggle filter ----
  function toggleFilter(kw) {
    if (activeFilters.has(kw)) {
      activeFilters.delete(kw);
    } else {
      activeFilters.add(kw);
    }
    renderChips();
    renderActiveFilterBadges();
    renderResults();
  }

  // ---- Active filter badges ----
  function renderActiveFilterBadges() {
    activeFiltersWrap.innerHTML = '';

    if (activeFilters.size === 0) {
      const label = document.createElement('span');
      label.className = 'active-filters-label';
      label.textContent = 'Chưa chọn bộ lọc';
      activeFiltersWrap.appendChild(label);
      clearAllBtn.style.display = 'none';
      return;
    }

    clearAllBtn.style.display = 'inline-block';

    activeFilters.forEach(kw => {
      const chip = document.createElement('span');
      chip.className = 'chip active';
      chip.style.cursor = 'pointer';

      const label = document.createTextNode(capitalizeFirst(kw) + ' ');
      chip.appendChild(label);

      const x = document.createElement('span');
      x.className = 'chip-remove';
      x.textContent = '✕';
      chip.appendChild(x);

      chip.addEventListener('click', () => toggleFilter(kw));
      activeFiltersWrap.appendChild(chip);
    });
  }

  // ---- Filter results ----
  function getFilteredResults() {
    let data = [...HUYET_DATA];

    // Text search
    if (searchQuery.trim()) {
      const q = normalizeVietnamese(searchQuery);
      data = data.filter(item =>
        normalizeVietnamese(item.tenViet).includes(q) ||
        normalizeVietnamese(item.maHuyet).includes(q) ||
        normalizeVietnamese(item.chuTri).includes(q) ||
        normalizeVietnamese(item.tacDung).includes(q)
      );
    }

    // Keyword chips
    if (activeFilters.size > 0) {
      data = data.filter(item => {
        const text = ((item.tacDung || '') + ' ' + (item.chuTri || '')).toLowerCase();
        return [...activeFilters].some(kw => text.includes(kw));
      });
    }

    return data;
  }

  function renderResults() {
    const results = getFilteredResults();

    if (resultCount) {
      resultCount.innerHTML = `Tìm thấy <strong>${results.length}</strong> huyệt vị`;
    }

    if (results.length === 0) {
      resultsGrid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="empty-icon">🌿</div>
          <h3>Không có kết quả</h3>
          <p>Thử chọn bộ lọc khác hoặc xóa bộ lọc hiện tại</p>
        </div>`;
      return;
    }

    resultsGrid.innerHTML = results.map(item => buildCardHTML(item)).join('');
  }

  // ---- Clear all ----
  clearAllBtn.addEventListener('click', () => {
    activeFilters.clear();
    searchQuery = '';
    if (filterSearch) filterSearch.value = '';
    renderChips();
    renderActiveFilterBadges();
    renderResults();
  });

  // ---- Text search ----
  if (filterSearch) {
    const debouncedFilter = debounce(() => {
      searchQuery = filterSearch.value;
      renderResults();
    }, 300);
    filterSearch.addEventListener('input', debouncedFilter);
  }

  // ---- Check URL params (from homepage chip click) ----
  const urlParams = new URLSearchParams(location.search);
  const meridianParam = urlParams.get('duongKinh');
  if (meridianParam) {
    // Pre-filter by meridian via text search
    searchQuery = meridianParam;
    if (filterSearch) filterSearch.value = meridianParam;
  }

  // ---- Init ----
  renderChips();
  renderActiveFilterBadges();
  renderResults();

})();
