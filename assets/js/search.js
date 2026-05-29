/* =====================================================
   HUYỆT VỊ 888 — search.js
   Search page logic
   ===================================================== */

(function () {
  'use strict';

  const searchInput  = document.getElementById('search-input');
  const clearBtn     = document.getElementById('search-clear');
  const sortSelect   = document.getElementById('sort-select');
  const resultsGrid  = document.getElementById('results-grid');
  const resultCount  = document.getElementById('result-count');

  if (!searchInput || !resultsGrid) return;

  let currentQuery = '';
  let currentSort  = 'default';


// ── Bộ gõ tiếng Việt (Telex) ───────────────────────
  // Gọi enableVietnameseInput từ main.js nếu đã load
  // Nếu chưa có thì tự xử lý tại đây
  if (typeof enableVietnameseInput === 'function') {
    enableVietnameseInput(searchInput);
  } else {
    // Fallback tự xử lý nếu main.js chưa load
    const TELEX = {
      aa:'â', ee:'ê', oo:'ô', ow:'ơ', uw:'ư', aw:'ă', dd:'đ',
      as:'á', af:'à', ar:'ả', ax:'ã', aj:'ạ',
      'âs':'ấ','âf':'ầ','âr':'ẩ','âx':'ẫ','âj':'ậ',
      'ăs':'ắ','ăf':'ằ','ăr':'ẳ','ăx':'ẵ','ăj':'ặ',
      es:'é', ef:'è', er:'ẻ', ex:'ẽ', ej:'ẹ',
      'ês':'ế','êf':'ề','êr':'ể','êx':'ễ','êj':'ệ',
      is:'í', if:'ì', ir:'ỉ', ix:'ĩ', ij:'ị',
      os:'ó', of:'ò', or:'ỏ', ox:'õ', oj:'ọ',
      'ôs':'ố','ôf':'ồ','ôr':'ổ','ôx':'ỗ','ôj':'ộ',
      'ơs':'ớ','ơf':'ờ','ơr':'ở','ơx':'ỡ','ơj':'ợ',
      us:'ú', uf:'ù', ur:'ủ', ux:'ũ', uj:'ụ',
      'ưs':'ứ','ưf':'ừ','ưr':'ử','ưx':'ữ','ưj':'ự',
      ys:'ý', yf:'ỳ', yr:'ỷ', yx:'ỹ', yj:'ỵ',
    };

    searchInput.addEventListener('keyup', (e) => {
      const skip = [
        'ArrowLeft','ArrowRight','ArrowUp','ArrowDown',
        'Backspace','Delete','Tab','Enter','Escape',
        'Shift','Control','Alt','Meta',
      ];
      if (skip.includes(e.key)) return;

      const val    = searchInput.value;
      const cursor = searchInput.selectionStart;

      // Thử 2 ký tự
      if (cursor >= 2) {
        const two = val.slice(cursor - 2, cursor).toLowerCase();
        if (TELEX[two]) {
          const rep   = TELEX[two];
          searchInput.value = val.slice(0, cursor - 2) + rep + val.slice(cursor);
          const pos   = cursor - 2 + rep.length;
          searchInput.setSelectionRange(pos, pos);
          // Trigger input event để cập nhật search
          searchInput.dispatchEvent(new Event('input'));
          return;
        }
      }

      // Thử 3 ký tự
      if (cursor >= 3) {
        const three = val.slice(cursor - 3, cursor).toLowerCase();
        if (TELEX[three]) {
          const rep   = TELEX[three];
          searchInput.value = val.slice(0, cursor - 3) + rep + val.slice(cursor);
          const pos   = cursor - 3 + rep.length;
          searchInput.setSelectionRange(pos, pos);
          searchInput.dispatchEvent(new Event('input'));
        }
      }
    });
  }
  
  // Check URL params for pre-filled search
  const urlParams = new URLSearchParams(location.search);
  const qParam = urlParams.get('q') || '';
  if (qParam) {
    searchInput.value = qParam;
    currentQuery = qParam;
  }

  // Render initial state
  renderResults();

  // ---- Events ----
  const debouncedSearch = debounce(() => {
    currentQuery = searchInput.value;
    clearBtn.classList.toggle('visible', currentQuery.length > 0);
    renderResults();
  }, 300);

  searchInput.addEventListener('input', debouncedSearch);

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    currentQuery = '';
    clearBtn.classList.remove('visible');
    renderResults();
    searchInput.focus();
  });

  sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    renderResults();
  });

  // ---- Search logic ----
  function getFilteredData() {
    if (!currentQuery.trim()) {
      return [...HUYET_DATA];
    }

    const q = normalizeVietnamese(currentQuery);

    return HUYET_DATA.filter(item => {
      return (
        normalizeVietnamese(item.tenViet).includes(q) ||
        normalizeVietnamese(item.maHuyet).includes(q) ||
        normalizeVietnamese(item.viTri).includes(q) ||
        normalizeVietnamese(item.duongKinh).includes(q) ||
        normalizeVietnamese(item.tacDung).includes(q) ||
        normalizeVietnamese(item.chuTri).includes(q)
      );
    });
  }

  function sortData(data) {
    const d = [...data];
    switch (currentSort) {
      case 'az':
        return d.sort((a, b) => a.tenViet.localeCompare(b.tenViet, 'vi'));
      case 'za':
        return d.sort((a, b) => b.tenViet.localeCompare(a.tenViet, 'vi'));
      case 'meridian':
        return d.sort((a, b) => a.duongKinh.localeCompare(b.duongKinh, 'vi'));
      case 'code':
        return d.sort((a, b) => a.maHuyet.localeCompare(b.maHuyet));
      default:
        return d;
    }
  }

  function renderResults() {
    const filtered = getFilteredData();
    const sorted   = sortData(filtered);

    // Update count
    if (resultCount) {
      if (currentQuery.trim()) {
        resultCount.innerHTML = `Tìm thấy <strong>${sorted.length}</strong> huyệt vị cho "<em>${escHtml(currentQuery)}</em>"`;
      } else {
        resultCount.innerHTML = `Hiển thị <strong>${sorted.length}</strong> huyệt vị`;
      }
    }

    if (sorted.length === 0) {
      resultsGrid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="empty-icon">🔍</div>
          <h3>Không tìm thấy kết quả</h3>
          <p>Thử tìm bằng tên khác hoặc mã huyệt (ví dụ: ST36, LI4, PC6)</p>
          <p style="margin-top:0.5rem;font-size:0.8rem;">Gợi ý: "Túc Tam Lý", "hop coc", "phong tri"</p>
        </div>`;
      return;
    }

    resultsGrid.innerHTML = sorted.map(item => buildCardHTML(item)).join('');
  }

})();
