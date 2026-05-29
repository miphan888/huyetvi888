/* =====================================================
   HUYỆT VỊ 888 — detail.js
   ===================================================== */

/* ── Auto-link acupoint codes in text ─────────────── */
function linkAcupointCodes(text) {
  if (!text) return '';
  // Build set of all known maHuyet for validation
  const knownCodes = new Set(HUYET_DATA.map(d => d.maHuyet).filter(Boolean));
  // Pattern: 1-3 uppercase letters + 1-3 digits (e.g. ST36, LI4, GV20, CV4)
  const pattern = /\b([A-Z]{1,3}-?EX\d+|[A-Z]{1,3}\d{1,3})\b/g;
  // Escape HTML first, then replace codes
  const escaped = escHtml(text);
  return escaped.replace(pattern, (match) => {
    if (knownCodes.has(match)) {
      return `<a href="detail.html?ma=${encodeURIComponent(match)}" class="acupoint-link" title="Xem huyệt ${match}">${match}</a>`;
    }
    return match;
  });
}

(function () {
  'use strict';

  // ── Lấy URL param ──────────────────────────────────
  const urlParams = new URLSearchParams(location.search);
  const ma        = (urlParams.get('ma') || '').trim();
  const container = document.getElementById('detail-container');
  if (!container) return;

  // ── Tìm huyệt ──────────────────────────────────────
  const item = HUYET_DATA.find(d => d.maHuyet === ma);

  if (!item) {
    container.innerHTML = `
      <div class="not-found">
        <div class="nf-icon">☯</div>
        <h2>Không tìm thấy huyệt vị</h2>
        <p>Mã huyệt "<strong>${escHtml(ma)}</strong>" không tồn tại trong dữ liệu.</p>
        <a href="index.html" class="btn-primary" style="margin-top:1rem;">← Về trang chủ</a>
      </div>`;
    return;
  }

  // ── Cập nhật tiêu đề trang ──────────────────────────
  document.title = `${item.tenViet} (${item.maHuyet}) — Huyệt Vị 888`;

  // ── Huyệt liên quan (cùng đường kinh) ──────────────
  const related = HUYET_DATA
    .filter(d => d.duongKinh === item.duongKinh && d.maHuyet !== item.maHuyet)
    .slice(0, 4);

  // ── Related cards ───────────────────────────────────
  const relatedHTML = related.length > 0
    ? related.map(r => `
        <div class="related-card" onclick="goToDetail('${escHtml(r.maHuyet)}')">
          <div class="related-img">
            ${r.urlHinhAnh
              ? `<img src="${escHtml(r.urlHinhAnh)}" alt="${escHtml(r.tenViet)}" loading="lazy" onerror="this.style.display='none'">`
              : `<span style="font-size:1.4rem;color:var(--jade-light)">☯</span>`
            }
          </div>
          <div>
            <div class="related-name">${escHtml(r.tenViet)}</div>
            <div class="related-code">${escHtml(r.maHuyet)}</div>
          </div>
        </div>`).join('')
    : '<p style="color:var(--text-light);font-size:0.85rem;">Không có huyệt liên quan.</p>';

  // ── Breadcrumb ──────────────────────────────────────
  const breadcrumb = `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">Trang chủ</a>
      <span class="sep">›</span>
      <a href="filter.html?duongKinh=${encodeURIComponent(item.duongKinh)}">${escHtml(item.duongKinh)}</a>
      <span class="sep">›</span>
      <span>${escHtml(item.tenViet)}</span>
    </nav>`;

  // ── formatBulletListLinked: format + auto-link codes ─
  function formatLinked(text) {
    if (!text) return '';
    const lines = text
      .split(/\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);
    if (lines.length <= 1) {
      return `<p>${linkAcupointCodes(text)}</p>`;
    }
    return `<ul class="bullet-list">
      ${lines.map(l => {
        const clean = l.replace(/^[•\-–—]\s*/, '');
        return `<li>${linkAcupointCodes(clean)}</li>`;
      }).join('')}
    </ul>`;
  }

  // ── Render ──────────────────────────────────────────
  container.innerHTML = `
    ${breadcrumb}

    <button class="back-btn"
            onclick="history.length > 1 ? history.back() : location.href='index.html'">
      ← Quay lại
    </button>

    <!-- Tên huyệt -->
    <div class="detail-header">
      <h1 class="detail-title">${escHtml(item.tenViet)}</h1>
      <div class="gold-line"></div>
    </div>

    <!-- Hình ảnh chữ nhật bo góc -->
    <div class="detail-img-rect-wrap">
      <div class="detail-img-rect" id="detail-img-rect"
           title="Bấm để phóng to" role="button" tabindex="0"
           aria-label="Xem lớn ảnh ${escHtml(item.tenViet)}">
        ${item.urlHinhAnh
          ? `<img src="${escHtml(item.urlHinhAnh)}"
                  alt="${escHtml(item.tenViet)}"
                  id="detail-main-img"
                  loading="lazy"
                  onerror="this.closest('.detail-img-rect').innerHTML='<div class=detail-img-fallback>☯</div>'">`
          : `<div class="detail-img-fallback">☯</div>`
        }
        <div class="detail-img-shine"></div>
        <div class="detail-img-zoom-hint">🔍 Phóng to</div>
      </div>

      <!-- Badges -->
      <div class="badge-row">
        <span class="badge badge-code">
          ${escHtml(item.maHuyet)}
          <button class="copy-btn" title="Sao chép mã"
                  onclick="copyToClipboard('${escHtml(item.maHuyet)}')">📋</button>
        </span>
        <span class="badge badge-meridian">⛩ ${escHtml(item.duongKinh)}</span>
      </div>
    </div>

    <!-- Thông tin chi tiết -->
    <div class="detail-info-col">

            ${(item.viTri || item.CachXacDinh) ? `
      <div class="info-card reveal">
        <div class="detail-split-row">
          <div class="detail-split-col">
            <div class="info-card-header">
              <span class="info-card-icon">📌</span>
              <span class="info-card-title">Vị Trí</span>
            </div>
            <div class="info-card-body">
              ${item.viTri ? formatLinked(item.viTri) : '<p style="color:var(--text-light);font-style:italic;">Chưa có dữ liệu.</p>'}
            </div>
          </div>
          <div class="detail-split-col">
            <div class="info-card-header">
              <span class="info-card-icon">🔎</span>
              <span class="info-card-title">Cách Xác Định Huyệt</span>
            </div>
            <div class="info-card-body">
              ${item.CachXacDinh ? formatLinked(item.CachXacDinh) : '<p style="color:var(--text-light);font-style:italic;">Chưa có dữ liệu.</p>'}
            </div>
            <!-- BẮT BUỘC GIỮ NGUYÊN 2 button này -->
            <div class="info-card-footer-links">
              <button class="thon-link-btn" type="button">
                <span>📐</span>
                <span>Cách xác định thốn</span>
                <span class="link-arrow">↗</span>
              </button>
              ${item.videoURL ? `
              <button class="video-link-btn" type="button"
                      data-video="${escHtml(item.videoURL)}">
                <span>▶</span>
                <span>Xem Video Hướng Dẫn Tìm Huyệt</span>
                <span class="link-arrow">↗</span>
              </button>` : ''}
            </div>
          </div>
        </div>
      </div>` : ''}

      ${item.cachCham ? `
      <div class="detail-card info-card reveal">
        <div class="info-card-header">
          <span class="info-card-icon">🪡</span>
          <span class="info-card-title">Cách Châm</span>
        </div>
        <div class="info-card-body">
          ${formatLinked(item.cachCham)}
        </div>
      </div>` : ''}

      ${item.tacDung ? `
      <div class="info-card reveal">
        <div class="info-card-header">
          <span class="info-card-icon">⚡</span>
          <span class="info-card-title">Tác Dụng</span>
        </div>
        <div class="info-card-body">
          ${formatLinked(item.tacDung)}
        </div>
      </div>` : ''}

      ${item.chuTri ? `
      <div class="info-card reveal">
        <div class="info-card-header">
          <span class="info-card-icon">🩺</span>
          <span class="info-card-title">Chủ Trị</span>
        </div>
        <div class="info-card-body">
          ${formatLinked(item.chuTri)}
        </div>
      </div>` : ''}

    </div>

    <!-- Huyệt liên quan -->
    <div class="related-section reveal">
      <h3>🔗 Huyệt Cùng Đường Kinh
        <span style="font-size:0.8rem;font-weight:400;color:var(--text-light);font-family:var(--font-sans);">
          (${escHtml(item.duongKinh)})
        </span>
      </h3>
      <div class="related-grid">
        ${relatedHTML}
      </div>
    </div>`;

  // ── Lightbox ────────────────────────────────────────
  const imgRect  = document.getElementById('detail-img-rect');
  const mainImg  = document.getElementById('detail-main-img');
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lightbox-img');
  const lbClose  = document.getElementById('lightbox-close');

  if (imgRect && mainImg && lightbox && lbImg) {
    function openLightbox() {
      lbImg.src = mainImg.src;
      lbImg.alt = mainImg.alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
    imgRect.addEventListener('click', openLightbox);
    imgRect.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openLightbox();
    });
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
  }

  // ── Reveal animation ────────────────────────────────
  setTimeout(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    container.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }, 100);

})(); // ← đóng IIFE


/* =====================================================
   POPUP THỐN — ngoài IIFE
   ===================================================== */
(function setupThonPopup() {
  const THON_IMAGES = {
    'thon'     : 'images/cach_xac_dinh_thon.png',
    'dong-than': 'images/thon_dong_than.jpeg',
  };

  function createPopup() {
    if (document.getElementById('thon-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id        = 'thon-overlay';
    overlay.className = 'thon-overlay';
    overlay.innerHTML = `
      <div class="thon-modal" id="thon-modal" role="dialog"
           aria-modal="true" aria-label="Cách xác định thốn">
        <div class="thon-modal-header">
          <h3 class="thon-modal-title">📐 Cách xác định thốn</h3>
          <button class="thon-modal-close" id="thon-close" aria-label="Đóng">✕</button>
        </div>
        <div class="thon-modal-body">
          <div class="thon-img-wrap">
            <img id="thon-img" src="${THON_IMAGES['thon']}"
                 alt="Cách xác định thốn" class="thon-img"/>
          </div>
        </div>
        <div class="thon-modal-footer">
          <button class="thon-tab-btn active" id="btn-thon">📏 Xem thốn</button>
          <button class="thon-tab-btn" id="btn-dong-than">🧍 Thân đồng thân</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    bindThonEvents();
  }

  function bindThonEvents() {
    const overlay  = document.getElementById('thon-overlay');
    const closeBtn = document.getElementById('thon-close');
    const btnThon  = document.getElementById('btn-thon');
    const btnDong  = document.getElementById('btn-dong-than');
    overlay.addEventListener('click', e => { if (e.target === overlay) closeThon(); });
    closeBtn.addEventListener('click', closeThon);
    btnThon.addEventListener('click', () => switchThon('thon'));
    btnDong.addEventListener('click', () => switchThon('dong-than'));
  }

  function openThon() {
    createPopup();
    switchThon('thon');
    document.getElementById('thon-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeThon() {
    const overlay = document.getElementById('thon-overlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function switchThon(type) {
    const img     = document.getElementById('thon-img');
    const btnThon = document.getElementById('btn-thon');
    const btnDong = document.getElementById('btn-dong-than');
    if (!img) return;
    img.classList.add('switching');
    setTimeout(() => {
      img.src = THON_IMAGES[type];
      img.alt = type === 'thon' ? 'Cách xác định thốn' : 'Thân đồng thân';
      img.classList.remove('switching');
    }, 250);
    if (type === 'thon') {
      btnThon?.classList.add('active'); btnDong?.classList.remove('active');
    } else {
      btnDong?.classList.add('active'); btnThon?.classList.remove('active');
    }
  }

  document.addEventListener('keydown', e => {
    const overlay = document.getElementById('thon-overlay');
    if (e.key === 'Escape' && overlay?.classList.contains('open')) closeThon();
  });
  document.addEventListener('click', e => {
    if (e.target.closest('.thon-link-btn')) { e.preventDefault(); openThon(); }
  });
  window.openThonPopup  = openThon;
  window.closeThonPopup = closeThon;
  window.switchThon     = switchThon;
})();


/* =====================================================
   POPUP VIDEO — ngoài IIFE
   ===================================================== */
(function setupVideoPopup() {
  function extractYouTubeId(url) {
    if (!url) return null;
    const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  function createVideoOverlay() {
    if (document.getElementById('video-overlay')) return;
    const el = document.createElement('div');
    el.id        = 'video-overlay';
    el.className = 'video-overlay';
    el.innerHTML = `
      <div class="video-modal" id="video-modal" role="dialog"
           aria-modal="true" aria-label="Video hướng dẫn">
        <div class="video-modal-header">
          <div class="video-modal-title">
            <span>▶</span>
            <span id="video-modal-name">Video Hướng Dẫn Tìm Huyệt</span>
          </div>
          <button class="video-modal-close" id="video-close" aria-label="Đóng">✕</button>
        </div>
        <div class="video-modal-body">
          <iframe id="video-iframe" src=""
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  referrerpolicy="strict-origin-when-cross-origin"
                  allowfullscreen title="Video hướng dẫn tìm huyệt">
          </iframe>
        </div>
        <div class="video-modal-footer">
          Bản quyền video thuộc về kênh YouTube tương ứng
        </div>
      </div>`;
    document.body.appendChild(el);
    bindVideoEvents();
  }

  function bindVideoEvents() {
    const overlay  = document.getElementById('video-overlay');
    const closeBtn = document.getElementById('video-close');
    overlay.addEventListener('click', e => { if (e.target === overlay) closeVideo(); });
    closeBtn.addEventListener('click', closeVideo);
  }

  function openVideo(videoUrl, tenHuyet) {
    createVideoOverlay();
    const ytId = extractYouTubeId(videoUrl);
    if (!ytId) { alert('Không tìm thấy video cho huyệt này.'); return; }
    const overlay = document.getElementById('video-overlay');
    const iframe  = document.getElementById('video-iframe');
    const title   = document.getElementById('video-modal-name');
    if (title && tenHuyet) title.textContent = tenHuyet;
    iframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeVideo() {
    const overlay = document.getElementById('video-overlay');
    const iframe  = document.getElementById('video-iframe');
    if (!overlay) return;
    if (iframe) iframe.src = '';
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', e => {
    const overlay = document.getElementById('video-overlay');
    if (e.key === 'Escape' && overlay?.classList.contains('open')) closeVideo();
  });
  document.addEventListener('click', e => {
    const btn = e.target.closest('.video-link-btn');
    if (!btn) return;
    e.preventDefault();
    const videoUrl = btn.dataset.video;
    const tenHuyet = document.querySelector('.detail-title')?.textContent || '';
    openVideo(videoUrl, tenHuyet);
  });
  window.openVideoPopup  = openVideo;
  window.closeVideoPopup = closeVideo;
})();


/* =====================================================
   HELPER FUNCTIONS — dùng chung
   ===================================================== */
function escHtml(str) {
  return String(str || '')
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

function formatBulletList(text) {
  if (!text) return '';
  const lines = text.split(/\\n|\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length <= 1) return `<p>${escHtml(text)}</p>`;
  return `<ul class="bullet-list">${lines.map(l => {
    const clean = l.replace(/^[•\-–—]\s*/, '');
    return `<li>${escHtml(clean)}</li>`;
  }).join('')}</ul>`;
}

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text)
    .then(() => showToast('Đã sao chép: ' + text))
    .catch(() => {
      const el = document.createElement('textarea');
      el.value = text; el.style.position = 'fixed'; el.style.opacity = '0';
      document.body.appendChild(el); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
      showToast('Đã sao chép: ' + text);
    });
}

function showToast(msg) {
  const old = document.getElementById('detail-toast');
  if (old) old.remove();
  const toast = document.createElement('div');
  toast.id = 'detail-toast'; toast.className = 'detail-toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2200);
}

function goToDetail(maHuyet) {
  location.href = `detail.html?ma=${encodeURIComponent(maHuyet)}`;
}
