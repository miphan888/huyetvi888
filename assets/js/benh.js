/* =====================================================
   HUYỆT VỊ 888 — benh.js  v3
   Module Hội Chứng: benh.html + benh-detail.html
   ===================================================== */

(function () {
  'use strict';

  const LS_KEY = 'huyet888-benh-data';

  function escH(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function toSlug(str) {
    return (str || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/gi, 'd').replace(/[^a-z0-9\s-]/g, '')
      .trim().replace(/\s+/g, '-');
  }
  function normalize(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi,'d');
  }

  /* ── Hàm render card huyệt (dùng buildCardHTML từ main.js) ── */
  function renderHuyetCard(item) {
    if (typeof buildCardHTML === 'function') return buildCardHTML(item);
    var imgSrc = item.urlHinhAnh || '';
    var excerpt = (item.tacDung || item.chuTri || '').substring(0, 85).trim();
    return '<div class="acupoint-card" onclick="window.location.href=\'detail.html?ma='+encodeURIComponent(item.maHuyet)+'\'">'
      + '<div class="card-image-wrap"><div class="card-image-circle">'
      + (imgSrc ? '<img src="'+escH(imgSrc)+'" alt="'+escH(item.tenViet)+'" loading="lazy" onerror="this.style.display=\'none\'">'
               : '<div class="card-image-placeholder">☯</div>')
      + '</div></div>'
      + '<div class="card-body">'
      + '<div class="card-name">'+escH(item.tenViet)+'</div>'
      + '<div class="card-code">'+escH(item.maHuyet)+'</div>'
      + '<div class="card-meridian">⛩ '+escH(item.duongKinh)+'</div>'
      + '<div class="card-excerpt">'+escH(excerpt)+'</div>'
      + '</div></div>';
  }

  /* ── Load BENH data ── */
  function loadBenhData() {
    var fileData = (typeof BENH_DATA !== 'undefined' && Array.isArray(BENH_DATA)) ? BENH_DATA : [];
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) {
        var p = JSON.parse(raw);
        if (Array.isArray(p) && p.length > 0) {
          // If benh-data.js was updated with more data, sync localStorage and use file
          if (fileData.length > p.length) {
            try { localStorage.setItem(LS_KEY, JSON.stringify(fileData)); } catch(e) {}
            return fileData;
          }
          return p;
        }
      }
    } catch(e) {}
    if (fileData.length > 0) return fileData;
    return [];
  }

  /* ══ PAGE: benh.html ══════════════════════════════════ */
  var benhGrid   = document.getElementById('benh-grid');
  var benhSearch = document.getElementById('benh-search');
  var benhCount  = document.getElementById('benh-count');

  if (benhGrid && benhSearch) {
    var ALL_BENH = loadBenhData();

    function renderGrid(query) {
      var q = normalize(query);
      var filtered = q
        ? ALL_BENH.filter(function(b) { return normalize(b.ten).includes(q) || normalize(b.trieuChung||'').includes(q); })
        : ALL_BENH;

      if (benhCount) {
        benhCount.innerHTML = query
          ? 'Tìm thấy <strong>'+filtered.length+'</strong> hội chứng cho "<em>'+escH(query)+'</em>"'
          : '<strong>'+filtered.length+'</strong> hội chứng';
      }

      if (!filtered.length) {
        benhGrid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;text-align:center;padding:4rem 1rem;">'
          + '<div style="font-size:3rem;opacity:.4;margin-bottom:.75rem;">🔍</div>'
          + '<h3 style="color:var(--jade);">Không tìm thấy hội chứng</h3>'
          + '<p>Thử tìm với từ khóa khác</p></div>';
        return;
      }

      benhGrid.innerHTML = filtered.map(function(b) {
        var slug = b.slug || toSlug(b.ten);
        var huyetCount = (b.huyetLienQuan || []).length;
        return '<a class="benh-card" href="benh-detail.html?slug='+encodeURIComponent(slug)+'" style="'
          + 'display:block;background:#fff;border-radius:12px;padding:1.5rem;'
          + 'box-shadow:0 2px 12px rgba(0,0,0,.07);border:1px solid rgba(0,0,0,.06);'
          + 'text-decoration:none;color:inherit;transition:box-shadow .2s,transform .2s;"'
          + ' onmouseover="this.style.boxShadow=\'0 6px 24px rgba(0,0,0,.13)\';this.style.transform=\'translateY(-2px)\'"'
          + ' onmouseout="this.style.boxShadow=\'0 2px 12px rgba(0,0,0,.07)\';this.style.transform=\'\'">'
          + '<div style="font-size:1.5rem;margin-bottom:.6rem;">🩺</div>'
          + '<div style="font-weight:700;font-size:1rem;color:var(--jade,#1a3c34);margin-bottom:.4rem;">'+escH(b.ten)+'</div>'
          + '<div style="font-size:.82rem;color:#666;line-height:1.5;margin-bottom:.75rem;'
          + 'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">'
          + escH((b.trieuChung||'').split('\n')[0]||'')+'</div>'
          + '<div style="display:flex;align-items:center;gap:.4rem;font-size:.75rem;color:var(--gold,#c9a84c);font-weight:600;">'
          + '<span>📍</span><span>'+huyetCount+' huyệt liên quan</span></div>'
          + '</a>';
      }).join('');
    }

    function debounce(fn, ms) {
      var t;
      return function() { var a=arguments,ctx=this; clearTimeout(t); t=setTimeout(function(){ fn.apply(ctx,a); },ms); };
    }
    benhSearch.addEventListener('input', debounce(function() { renderGrid(this.value.trim()); }, 280));
    renderGrid('');
  }

  /* ══ PAGE: benh-detail.html ═══════════════════════════ */
  var detailContainer = document.getElementById('benh-detail-container');
  if (!detailContainer) return;

  var params   = new URLSearchParams(location.search);
  var slug     = params.get('slug') || '';
  var ALL      = loadBenhData();
  var benh     = ALL.find(function(b) { return (b.slug || toSlug(b.ten)) === slug; });

  if (!benh) {
    detailContainer.innerHTML = '<div style="text-align:center;padding:5rem 1rem;">'
      + '<div style="font-size:3rem;opacity:.4;margin-bottom:1rem;">⚠️</div>'
      + '<h2 style="color:var(--jade);">Không tìm thấy hội chứng</h2>'
      + '<p><a href="benh.html" style="color:var(--jade);font-weight:600;">← Quay lại danh sách</a></p>'
      + '</div>';
    return;
  }

  document.title = escH(benh.ten) + ' — Hội Chứng — Huyệt Vị 888';

  /* ── Resolve huyệt objects ── */
  var huyetSource = (typeof HUYET_DATA !== 'undefined') ? HUYET_DATA : [];
  var huyetObjects = (benh.huyetLienQuan || []).map(function(ma) {
    var maNorm = (ma||'').trim().toUpperCase();
    return huyetSource.find(function(h) { return (h.maHuyet||'').trim().toUpperCase() === maNorm; }) || null;
  });
  var foundHuyet  = huyetObjects.filter(Boolean);
  var missingMa   = (benh.huyetLienQuan||[]).filter(function(ma,i) { return !huyetObjects[i]; });

  var hasTC = !!benh.trieuChung;
  var hasTT = !!benh.trongTam;
  var hasHuyet = foundHuyet.length > 0 || missingMa.length > 0;

  /* ── Cột Triệu Chứng (trái) ── */
  var colTC = hasTC
    ? '<div class="bd-col bd-col-text">'
      + '<div class="bd-col-header"><span class="bd-col-icon">🔎</span><span>Triệu Chứng &amp; Nguyên Nhân</span></div>'
      + '<div class="bd-col-body" style="white-space:pre-wrap;">'+escH(benh.trieuChung)+'</div>'
      + '</div>'
    : '';

  /* ── Cột Trọng Tâm (giữa) ── */
  var colTT = hasTT
    ? '<div class="bd-col bd-col-text">'
      + '<div class="bd-col-header"><span class="bd-col-icon">🎯</span><span>Trọng Tâm Trị Liệu</span></div>'
      + '<div class="bd-col-body" style="white-space:pre-wrap;">'+escH(benh.trongTam)+'</div>'
      + '</div>'
    : '';


  /* ── Layout: 2 cột tự động chiều rộng theo nội dung, chiều cao bằng nhau ── */
  var activeCols = [colTC, colTT].filter(Boolean);
  var gridClass  = activeCols.length === 2 ? 'bd-2col-auto'
                 : activeCols.length === 1 ? 'bd-1col'
                 : '';


  var topGrid = activeCols.length
    ? '<div class="bd-top-grid '+gridClass+'">'+activeCols.join('')+'</div>'
    : '';

  /* ── Bottom: toàn bộ cards huyệt (big grid) ── */
  var bottomGrid = '';
  if (foundHuyet.length > 0) {
    var allCards = foundHuyet.map(renderHuyetCard).join('')
      + missingMa.map(function(ma) {
          return '<span style="display:inline-flex;align-items:center;padding:.3rem .7rem;'
            + 'background:rgba(26,60,52,.08);border-radius:20px;font-size:.78rem;'
            + 'font-weight:700;color:var(--jade,#1a3c34);margin:.25rem;">📍 '+escH(ma)+'</span>';
        }).join('');
    bottomGrid = '<div class="bd-huyet-section">'
      + '<h2 class="bd-section-title">📍 Huyệt Vị Liên Quan <span class="bd-count-badge">'+(benh.huyetLienQuan||[]).length+'</span></h2>'
      + '<div class="featured-grid">'+allCards+'</div>'
      + '</div>';
  }

  detailContainer.innerHTML =
    '<div class="page-banner" style="margin-bottom:0;">'
    + '<div style="font-size:.82rem;opacity:.6;margin-bottom:.4rem;">'
    + '<a href="benh.html" style="color:inherit;text-decoration:none;">← Hội Chứng</a></div>'
    + '<h1>🩺 '+escH(benh.ten)+'</h1>'
    + '</div>'
    + '<div class="bd-detail-wrap">'
    + topGrid
    + bottomGrid
    + '</div>';

})();
