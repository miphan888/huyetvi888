/* =====================================================
   HUYỆT VỊ 888 — main.js
   Shared utilities, navigation, loader, back-to-top
   ===================================================== */
/* =====================================================
   MAIN.JS — Trang chủ
   ===================================================== */

// ════════════════════════════════════════════════════
// BỘ GÕ TIẾNG VIỆT (TELEX)
// ════════════════════════════════════════════════════
const TELEX_MAP = {
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

function applyTelex(input) {
  const val    = input.value;
  const cursor = input.selectionStart;
  if (cursor < 2) return;

  const two = val.slice(cursor - 2, cursor).toLowerCase();
  if (TELEX_MAP[two]) {
    const rep    = TELEX_MAP[two];
    input.value  = val.slice(0, cursor - 2) + rep + val.slice(cursor);
    const pos    = cursor - 2 + rep.length;
    input.setSelectionRange(pos, pos);
    return;
  }

  if (cursor >= 3) {
    const three = val.slice(cursor - 3, cursor).toLowerCase();
    if (TELEX_MAP[three]) {
      const rep    = TELEX_MAP[three];
      input.value  = val.slice(0, cursor - 3) + rep + val.slice(cursor);
      const pos    = cursor - 3 + rep.length;
      input.setSelectionRange(pos, pos);
    }
  }
}

function enableVietnameseInput(el) {
  if (!el || el._vietEnabled) return;
  el._vietEnabled = true;
  el.addEventListener('keyup', (e) => {
    const skip = [
      'ArrowLeft','ArrowRight','ArrowUp','ArrowDown',
      'Backspace','Delete','Tab','Enter','Escape',
      'Shift','Control','Alt','Meta',
    ];
    if (!skip.includes(e.key)) applyTelex(el);
  });
}

function initVietnameseInputs() {
  const selectors = [
    '#header-search',
    '#disease-input',
    'input[type="search"]',
    'input[type="text"]',
  ];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => enableVietnameseInput(el));
  });

  // Tự động gắn vào input render động
  new MutationObserver(() => {
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => enableVietnameseInput(el));
    });
  }).observe(document.body, { childList: true, subtree: true });
}


// ════════════════════════════════════════════════════
// DANH Y SLIDER
// ════════════════════════════════════════════════════
const DANH_Y_DATA = [
  {
    alias    : 'Hải Thượng Lãn Ông',
    realname : 'Lê Hữu Trác · 1720–1791',
    role     : 'Tổ ngành Y học cổ truyền Việt Nam',
    photo    : 'danh_y/hai_thuong_lan_ong.jpg',
    gradStart: '#8B0000',
    gradEnd  : '#4a2000',
    quotes   : [
      {
        title: '"Tám chữ vàng nghề y"',
        body : 'Nhân – Minh – Đức – Trí – Lượng – Thành – Khiêm – Cần. Tám đức tính người làm thuốc phải tu dưỡng suốt đời. Thầy thuốc giỏi phải có cả tài lẫn đức, xem bệnh nhân như người thân.',
      },
      {
        title: '"Thầy thuốc như mẹ hiền"',
        body : 'Người thầy thuốc phải yêu thương bệnh nhân như yêu thương bản thân mình. Khi ngồi trước người bệnh, phải tập trung toàn tâm, không được xao lãng bởi bất kỳ điều gì khác.',
      },
      {
        title: '"Thuốc Nam — kho báu của đất Việt"',
        body : 'Trên dải đất này, trời đã ban cho muôn loài cỏ cây chứa đựng sức mạnh chữa lành. Người thầy thuốc Việt nếu không biết dùng thuốc Nam thì chưa xứng gọi là thầy thuốc Việt.',
      },
    ],
  },
  {
    alias    : 'Tuệ Tĩnh',
    realname : 'Nguyễn Bá Tĩnh · Thế kỷ XIV',
    role     : 'Ông tổ ngành thuốc Nam Việt Nam',
    photo    : 'danh_y/tue_tinh.jpg',
    gradStart: '#1a4a2e',
    gradEnd  : '#0a1a0e',
    quotes   : [
      {
        title: '"Nam dược trị Nam nhân"',
        body : 'Thuốc Nam chữa bệnh cho người Nam. Đất nước ta có sẵn cỏ cây, không cần lệ thuộc thuốc ngoại. Hãy tin vào những gì thiên nhiên ban tặng trên chính mảnh đất mình sống.',
      },
      {
        title: '"Ăn uống là gốc của sức khỏe"',
        body : 'Bổ bằng thức ăn hơn bổ bằng thuốc. Người biết ăn uống đúng cách thì ít bệnh. Ngũ cốc, rau quả hàng ngày chính là vị thuốc trường sinh mà trời đất đã sắp sẵn.',
      },
      {
        title: '"Vị thuốc quý ngay trước cửa"',
        body : 'Sài đất chữa ho, gừng chữa lạnh, tía tô giải cảm, nghệ lành vết thương. Kho thuốc quý nhất chính là vườn rau trước sân nhà — hãy biết dùng trước khi tìm đến nơi xa.',
      },
    ],
  },
  {
    alias    : 'Hippocrates',
    realname : 'Hippocrates · 460–370 TCN',
    role     : 'Cha đẻ của Y học phương Tây',
    photo    : 'danh_y/Hippocrates.jpg',
    gradStart: '#1a2a5e',
    gradEnd  : '#0a0a2e',
    quotes   : [
      {
        title: '"Primum non nocere"',
        body : 'Trước hết, đừng gây hại. Bổn phận đầu tiên của người thầy thuốc không phải chữa bệnh, mà là không làm tình trạng người bệnh trở nên tệ hơn.',
      },
      {
        title: '"Thức ăn là thuốc của bạn"',
        body : 'Hãy để thức ăn là thuốc của bạn và thuốc là thức ăn của bạn. Thiên nhiên chữa lành, thầy thuốc chỉ là người dẫn đường. Cơ thể con người vốn dĩ có khả năng tự hồi phục kỳ diệu.',
      },
      {
        title: '"Đi bộ là thuốc tốt nhất"',
        body : 'Vận động điều độ, hít thở không khí trong lành và ngủ đủ giấc — ba điều này còn quý hơn mọi thứ thuốc trên đời.',
      },
    ],
  },
  {
    alias    : 'Hoa Đà',
    realname : 'Hoa Đà · 140–208',
    role     : 'Thần y Trung Hoa, người phát minh gây mê',
    photo    : 'danh_y/Hoa_Da.jpg',
    gradStart: '#3a1a5e',
    gradEnd  : '#1a0a2e',
    quotes   : [
      {
        title: '"Thượng y trị quốc"',
        body : 'Thượng y trị quốc, trung y trị nhân, hạ y trị bệnh. Thầy thuốc giỏi nhất không chữa bệnh có sẵn mà ngăn bệnh chưa sinh ra — đó mới là đỉnh cao của y thuật.',
      },
      {
        title: '"Vận động — bí quyết trường thọ"',
        body : 'Cây cối nhờ có gió lay mà không mục ruỗng, người nhờ có vận động mà khí huyết lưu thông. Ngũ cầm hí chính là liều thuốc trường sinh ta trao lại hậu thế.',
      },
    ],
  },
  {
    alias    : 'Biển Thước',
    realname : 'Tần Việt Nhân · 407–310 TCN',
    role     : 'Thần y huyền thoại thời Chiến Quốc',
    photo    : 'danh_y/bien_thuoc.jpg',
    gradStart: '#5e4a1a',
    gradEnd  : '#2e1a0a',
    quotes   : [
      {
        title: '"Phòng bệnh hơn chữa bệnh"',
        body : 'Bệnh chưa sinh mà đã trị được mới là thầy thuốc giỏi nhất. Anh ta của ta chữa bệnh trước khi có triệu chứng, nên không ai biết tài năng — đó mới là bậc thần y.',
      },
      {
        title: '"Vọng – Văn – Vấn – Thiết"',
        body : 'Nhìn sắc mặt, nghe âm thanh, hỏi bệnh sử, bắt mạch — bốn phép chẩn đoán này là nền tảng của y thuật. Thầy thuốc dùng đủ bốn phép sẽ không bao giờ đi sai đường.',
      },
    ],
  },
];

// Flatten: mỗi quote = 1 slide
const DY_SLIDES = [];
DANH_Y_DATA.forEach(p => {
  p.quotes.forEach(q => {
    DY_SLIDES.push({ ...p, quoteTitle: q.title, quoteBody: q.body });
  });
});

const DY_DURATION = 7500;
let   dyIndex     = 0;
let   dyTimer     = null;
let   dyPaused    = false;

function renderDanhYSlider() {
  const section = document.getElementById('danh-y-section');
  if (!section) return;

  const dotsHtml = DY_SLIDES.map((_, i) =>
    `<button class="dy-dot ${i === 0 ? 'active' : ''}"
             data-dy-i="\${i}" aria-label="Slide \${i+1}"></button>`
  ).join('');

  section.innerHTML = `
    <div class="dy-wrapper">
      <div class="dy-quote-box" id="dy-quote-box">

        <div class="dy-quote-mark-open">"</div>

        <div class="dy-slide-inner" id="dy-slide-inner">
          <div class="dy-avatar-col">
            <div class="dy-avatar-ring" id="dy-avatar-ring">
              <div class="dy-avatar-inner" id="dy-avatar-inner"></div>
            </div>
            <div class="dy-person-info">
              <div class="dy-alias"    id="dy-alias"></div>
              <div class="dy-realname" id="dy-realname"></div>
              <div class="dy-role"     id="dy-role"></div>
            </div>
          </div>
          <div class="dy-content-col">
            <div class="dy-quote-title" id="dy-quote-title"></div>
            <p   class="dy-quote-body"  id="dy-quote-body"></p>
          </div>
        </div>

        <div class="dy-quote-mark-close">"</div>

        <div class="dy-controls">
          <button class="dy-nav-btn" id="dy-prev">‹</button>
          <div class="dy-dots" id="dy-dots">${dotsHtml}</div>
          <button class="dy-nav-btn" id="dy-next">›</button>
        </div>

        <div class="dy-progress-wrap">
          <div class="dy-progress-bar" id="dy-progress-bar"></div>
        </div>

      </div>
    </div>`;

  // Events
  document.getElementById('dy-prev')
    .addEventListener('click', () =>
      dyGoTo((dyIndex - 1 + DY_SLIDES.length) % DY_SLIDES.length));

  document.getElementById('dy-next')
    .addEventListener('click', () =>
      dyGoTo((dyIndex + 1) % DY_SLIDES.length));

  document.getElementById('dy-dots')
    .addEventListener('click', (e) => {
      const btn = e.target.closest('.dy-dot');
      if (btn) dyGoTo(+btn.dataset.dyI);
    });

  const box = document.getElementById('dy-quote-box');
  box.addEventListener('mouseenter', () => { dyPaused = true;  });
  box.addEventListener('mouseleave', () => { dyPaused = false; });

  // Swipe
  let tx = 0;
  box.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50)
      dyGoTo(dx < 0
        ? (dyIndex + 1) % DY_SLIDES.length
        : (dyIndex - 1 + DY_SLIDES.length) % DY_SLIDES.length);
  }, { passive: true });

  dyFillSlide(DY_SLIDES[0]);
  dyResetProgress();
  dyStartTimer();
}

function dyFillSlide(slide) {
  // ── Avatar ────────────────────────────────────────
  const ring  = document.getElementById('dy-avatar-ring');
  const inner = document.getElementById('dy-avatar-inner');

  if (ring) {
    ring.style.background = `conic-gradient(
      ${slide.gradStart},
      ${slide.gradEnd},
      ${slide.gradStart}
    )`;
  }

  if (inner) {
    // Xóa nội dung cũ
    inner.innerHTML = '';

    if (slide.photo) {
      const img          = document.createElement('img');
      img.className      = 'dy-avatar-img';
      img.alt            = slide.alias;
      img.style.opacity  = '0';
      img.style.transition = 'opacity 0.4s ease';

      img.onload = () => {
        img.style.opacity = '1';
      };

      img.onerror = () => {
        // Fallback: hiện chữ cái đầu
        inner.innerHTML = `
          <div class="dy-avatar-fallback"
               style="background:linear-gradient(135deg,
                 $${slide.gradStart}, $${slide.gradEnd})">
            ${slide.alias[0]}
          </div>`;
      };

      inner.appendChild(img);
      // Gán src SAU khi append để onload/onerror hoạt động đúng
      img.src = slide.photo;

    } else {
      inner.innerHTML = `
        <div class="dy-avatar-fallback"
             style="background:linear-gradient(135deg,
               $${slide.gradStart}, $${slide.gradEnd})">
          ${slide.alias[0]}
        </div>`;
    }
  }

  // ── Text ──────────────────────────────────────────
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  set('dy-alias',       slide.alias);
  set('dy-realname',    slide.realname);
  set('dy-role',        slide.role);
  set('dy-quote-title', slide.quoteTitle);
  set('dy-quote-body',  slide.quoteBody);

  // ── Dots ──────────────────────────────────────────
  document.querySelectorAll('.dy-dot').forEach((d, i) =>
    d.classList.toggle('active', i === dyIndex));
}

function dyUpdateSlide() {
  const inner = document.getElementById('dy-slide-inner');
  if (!inner) return;
  inner.classList.add('dy-fade-out');
  setTimeout(() => {
    dyFillSlide(DY_SLIDES[dyIndex]);
    inner.classList.remove('dy-fade-out');
  }, 350);
  dyResetProgress();
}

function dyGoTo(idx) {
  dyIndex = idx;
  dyUpdateSlide();
  dyStartTimer();
}

function dyStartTimer() {
  clearInterval(dyTimer);
  dyTimer = setInterval(() => {
    if (!dyPaused) {
      dyIndex = (dyIndex + 1) % DY_SLIDES.length
	        dyUpdateSlide();
    }
  }, DY_DURATION);
}

function dyResetProgress() {
  const bar = document.getElementById('dy-progress-bar');
  if (!bar) return;
  bar.style.transition = 'none';
  bar.style.width      = '0%';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    bar.style.transition = `width ${DY_DURATION}ms linear`;
    bar.style.width      = '100%';
  }));
}


// ════════════════════════════════════════════════════
// KHỞI ĐỘNG
// ════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initVietnameseInputs();
  renderDanhYSlider();

  // ... giữ nguyên phần init cũ của bạn bên dưới ...
});
/* ===== PAGE LOADER ===== */
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 400);
  }
});

/* ===== ACTIVE NAV LINK ===== */
(function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#navbar a, #mobile-nav a').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

/* ===== HAMBURGER MENU ===== */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });

  // Close on link click
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
    }
  });
}

/* ===== SCROLL EFFECTS ===== */
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (navbar) navbar.classList.toggle('scrolled', y > 20);
  if (backToTop) backToTop.classList.toggle('visible', y > 300);
});

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ===== TOAST NOTIFICATION ===== */
function showToast(msg, duration = 2200) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), duration);
}
window.showToast = showToast;

/* ===== VIETNAMESE NORMALIZER ===== */
function normalizeVietnamese(str) {
  if (!str) return '';
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // remove diacritics
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}
window.normalizeVietnamese = normalizeVietnamese;

/* ===== YOUTUBE ID EXTRACTOR ===== */
function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /embed\/([A-Za-z0-9_-]{11})/,
    /shorts\/([A-Za-z0-9_-]{11})/
  ];
  for (const pat of patterns) {
    const m = url.match(pat);
    if (m) return m[1];
  }
  return null;
}
window.extractYouTubeId = extractYouTubeId;

/* ===== COPY TO CLIPBOARD ===== */
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .then(() => showToast('✓ Đã sao chép: ' + text))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}
function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0;';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); showToast('✓ Đã sao chép: ' + text); }
  catch (e) { showToast('Không thể sao chép'); }
  document.body.removeChild(ta);
}
window.copyToClipboard = copyToClipboard;

/* ===== IMAGE FALLBACK ===== */
function setupImageFallback(img) {
  img.addEventListener('error', function () {
    this.style.display = 'none';
    const parent = this.closest('.card-image-circle, .detail-img-circle, .related-img');
    if (parent) {
      const placeholder = document.createElement('div');
      placeholder.className = 'card-image-placeholder';
      placeholder.style.cssText = 'display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:2rem;color:var(--jade-light);';
      placeholder.textContent = '☯';
      parent.appendChild(placeholder);
    }
  });
}
window.setupImageFallback = setupImageFallback;

/* ===== NAVIGATE TO DETAIL ===== */
function goToDetail(ma) {
  window.location.href = 'detail.html?ma=' + encodeURIComponent(ma);
}
window.goToDetail = goToDetail;

/* ===== BUILD CARD HTML ===== */
function buildCardHTML(item) {
  const imgSrc = item.urlHinhAnh || '';
  const excerpt = (item.tacDung || item.chuTri || '').substring(0, 90).trim();
  const displayExcerpt = excerpt.length > 85 ? excerpt.substring(0, 85) + '…' : excerpt;

  return `
    <div class="acupoint-card" onclick="goToDetail('${escHtml(item.maHuyet)}')">
      <div class="card-image-wrap">
        <div class="card-image-circle">
          ${imgSrc
            ? `<img src="${escHtml(imgSrc)}" alt="${escHtml(item.tenViet)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
               <div class="card-image-placeholder" style="display:none;align-items:center;justify-content:center;width:100%;height:100%;font-size:2rem;color:var(--jade-light);">☯</div>`
            : `<div class="card-image-placeholder">☯</div>`
          }
        </div>
      </div>
      <div class="card-body">
        <div class="card-name">${escHtml(item.tenViet)}</div>
        <div class="card-code">${escHtml(item.maHuyet)}</div>
        <div class="card-meridian">⛩ ${escHtml(item.duongKinh)}</div>
        <div class="card-excerpt">${escHtml(displayExcerpt)}</div>
      </div>
    </div>`;
}
window.buildCardHTML = buildCardHTML;

/* ===== ESCAPE HTML ===== */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
window.escHtml = escHtml;

/* ===== DEBOUNCE ===== */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
window.debounce = debounce;

/* ===== SCROLL REVEAL ===== */
(function setupReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ===== FORMAT BULLET LIST ===== */
function formatBulletList(text) {
  if (!text) return '';
  // Split on semicolons, asterisks, newlines, or common separators
  const items = text
    .split(/[;\n]|(?:\s*\*\s*)|(?:\d+\.\s*)/)
    .map(s => s.replace(/^\*\s*ChủTrị:\s*/i, '').trim())
    .filter(s => s.length > 2);

  if (items.length <= 1) {
    return `<p>${escHtml(text)}</p>`;
  }
  return '<ul>' + items.map(i => `<li>${escHtml(i)}</li>`).join('') + '</ul>';
}
window.formatBulletList = formatBulletList;


// ════════════════════════════════════════════════════
// THEME SYSTEM — Á Đông themes
// ════════════════════════════════════════════════════
const THEMES = {
  jade: {
    name: 'Ngọc Bích',
    '--jade':       '#1a3c34',
    '--jade-dark':  '#0f2520',
    '--jade-mid':   '#245044',
    '--jade-light': '#2e6b5a',
    '--gold':       '#c9a84c',
    '--gold-light': '#e8c96d',
    '--gold-pale':  '#f0dea0',
    '--cream':      '#f5f0e8',
    '--cream-dark': '#ede5d5',
    '--lacquer':    '#8b4513',
    '--bg-card':    '#fdf8f2',
    '--text-body':  '#4a3728',
  },
  brown: {
    name: 'Nâu Trầm',
    '--jade':       '#5c2e0a',
    '--jade-dark':  '#3a1a04',
    '--jade-mid':   '#7a3e14',
    '--jade-light': '#9b5220',
    '--gold':       '#d4a853',
    '--gold-light': '#e8c470',
    '--gold-pale':  '#f2dba8',
    '--cream':      '#faf3e8',
    '--cream-dark': '#f0e6d0',
    '--lacquer':    '#c46e28',
    '--bg-card':    '#fffbf4',
    '--text-body':  '#3d2010',
  },
  red: {
    name: 'Đỏ Son',
    '--jade':       '#7a1515',
    '--jade-dark':  '#4d0a0a',
    '--jade-mid':   '#9e2020',
    '--jade-light': '#c03030',
    '--gold':       '#d4a030',
    '--gold-light': '#e8bc50',
    '--gold-pale':  '#f5d980',
    '--cream':      '#fdf5f0',
    '--cream-dark': '#f5e8e0',
    '--lacquer':    '#a82020',
    '--bg-card':    '#fff8f5',
    '--text-body':  '#3d1010',
  },
  ink: {
    name: 'Mực Tàu',
    '--jade':       '#1a1a2e',
    '--jade-dark':  '#0d0d1a',
    '--jade-mid':   '#252540',
    '--jade-light': '#333355',
    '--gold':       '#c9a84c',
    '--gold-light': '#e0c060',
    '--gold-pale':  '#eedfa0',
    '--cream':      '#f2f0ec',
    '--cream-dark': '#e5e2da',
    '--lacquer':    '#8b7040',
    '--bg-card':    '#faf9f6',
    '--text-body':  '#2a2820',
  },
};

function applyTheme(themeKey) {
  const theme = THEMES[themeKey] || THEMES.jade;
  const root  = document.documentElement;
  Object.entries(theme).forEach(([k, v]) => {
    if (k !== 'name') root.style.setProperty(k, v);
  });
  // Update active state on buttons
  document.querySelectorAll('.theme-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === themeKey);
  });
  localStorage.setItem('hv888-theme', themeKey);
}

function initTheme() {
  const saved = localStorage.getItem('hv888-theme') || 'jade';
  applyTheme(saved);
}

// Expose globally so other pages can call
window.applyTheme = applyTheme;
window.initTheme  = initTheme;

// Theme switcher toggle
document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  const toggleBtn  = document.getElementById('theme-toggle-btn');
  const dropdown   = document.getElementById('theme-dropdown');

  if (toggleBtn && dropdown) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => dropdown.classList.remove('open'));
    dropdown.addEventListener('click', e => e.stopPropagation());
    dropdown.querySelectorAll('.theme-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        applyTheme(btn.dataset.theme);
        dropdown.classList.remove('open');
      });
    });
  }
});
