/* ============================================================
   map-widget.js — Huyệt Vị 888 Image Map Widget  v2 (fixed)
   Bulletproof SVG overlay: pixel-sized SVG, ResizeObserver sync
   ============================================================ */
(function () {
  'use strict';

  /* ── Inject CSS ──────────────────────────────────────── */
  const CSS = `
@keyframes hvmap-pulse {
  0%   { r: 9px;  opacity: 0.8; }
  100% { r: 26px; opacity: 0; }
}
.hvmap-widget {
  position: relative;
  display: block;
  width: 100%;
  line-height: 0;   /* removes gap below img */
}
.hvmap-widget img.hvmap-img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8px;
}
.hvmap-widget svg.hvmap-svg {
  position: absolute;
  top: 0; left: 0;
  overflow: visible;
  pointer-events: all;
  /* width/height set in JS after img loads */
}
.hvmap-widget .hvmap-g { cursor: pointer; }
.hvmap-widget .mp-dot {
  fill: #1a1a1a;
  stroke: white;
  stroke-width: 2;
  cursor: pointer;
  transition: r .15s, fill .15s;
}
.hvmap-widget .mp-dot:hover { fill: #c9a84c; }
.hvmap-widget .mp-pulse {
  fill: none;
  stroke: #1a1a1a;
  stroke-width: 1.5;
  animation: hvmap-pulse 2.5s ease-out infinite;
}
.hvmap-widget .mp-label {
  font-size: 12px; font-weight: 700; fill: #1a1a1a;
  paint-order: stroke; stroke: white; stroke-width: 3px;
  pointer-events: none; user-select: none;
  font-family: 'Segoe UI', system-ui, sans-serif;
}
.hvmap-widget .hvmap-g.hv-highlight .mp-dot   { fill: #e74c3c; }
.hvmap-widget .hvmap-g.hv-highlight .mp-pulse { stroke: #e74c3c; }
#hvmap-tooltip {
  position: fixed; z-index: 99999;
  background: rgba(15,37,32,0.92); color: #f0dea0;
  padding: 7px 12px; border-radius: 7px;
  font-size: 13px; display: none;
  pointer-events: none; white-space: nowrap;
  border: 1px solid rgba(201,168,76,0.3);
  font-family: 'Segoe UI', system-ui, sans-serif;
  line-height: 1.5; box-shadow: 0 4px 20px rgba(0,0,0,0.4);
}
`;

  if (!document.getElementById('hvmap-widget-style')) {
    const style = document.createElement('style');
    style.id = 'hvmap-widget-style';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  /* ── Shared tooltip ──────────────────────────────────── */
  let tooltip = document.getElementById('hvmap-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'hvmap-tooltip';
    document.body.appendChild(tooltip);
  }
  document.addEventListener('mousemove', function(e) {
    if (tooltip.style.display === 'block') {
      tooltip.style.left = (e.clientX + 14) + 'px';
      tooltip.style.top  = (e.clientY - 10) + 'px';
    }
  });

  /* ── Render one widget ───────────────────────────────── */
  function renderWidget(container, map) {
    if (container.dataset.mapInited) return;
    container.dataset.mapInited = 'true';

    if (!map) {
      container.innerHTML = '<p style="color:#999;padding:1rem;">Không tìm thấy bản đồ.</p>';
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;display:block;width:100%;line-height:0;';

    const img = document.createElement('img');
    img.className = 'hvmap-img';
    img.alt = map.title || 'Bản đồ huyệt vị';
    img.style.cssText = 'display:block;width:100%;height:auto;border-radius:8px;';
    wrapper.appendChild(img);

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.classList.add('hvmap-svg');
    svg.style.cssText = 'position:absolute;top:0;left:0;overflow:visible;pointer-events:all;';
    wrapper.appendChild(svg);
    container.appendChild(wrapper);

    function drawPoints(nw, nh) {
      svg.innerHTML = '';
      (map.points || []).forEach(function(pt) {
        const cx = (parseFloat(pt.x) / 100) * nw;
        const cy = (parseFloat(pt.y) / 100) * nh;
        const dotColor = (pt.color && pt.color !== '#1a1a1a') ? pt.color : '#1a1a1a';

        const g = document.createElementNS(svgNS, 'g');
        g.classList.add('hvmap-g');
        g.dataset.id = pt.id;

        const pulse = document.createElementNS(svgNS, 'circle');
        pulse.classList.add('mp-pulse');
        pulse.setAttribute('cx', cx); pulse.setAttribute('cy', cy); pulse.setAttribute('r', '9');
        if (dotColor !== '#1a1a1a') pulse.style.stroke = dotColor;
        g.appendChild(pulse);

        const dot = document.createElementNS(svgNS, 'circle');
        dot.classList.add('mp-dot');
        dot.setAttribute('cx', cx); dot.setAttribute('cy', cy); dot.setAttribute('r', '7');
        if (dotColor !== '#1a1a1a') dot.style.fill = dotColor;
        g.appendChild(dot);

        const label = document.createElementNS(svgNS, 'text');
        label.classList.add('mp-label');
        label.setAttribute('x', cx); label.setAttribute('y', cy);
        label.setAttribute('dy', '-13'); label.setAttribute('text-anchor', 'middle');
        label.textContent = pt.ma || '';
        g.appendChild(label);

        g.addEventListener('mouseenter', function(e) {
          tooltip.innerHTML = '<strong>' + (pt.ma||'') + '</strong><br>' + (pt.ten||'')
            + '<br><small style="opacity:.7">' + (pt.duongKinh||'') + '</small>';
          tooltip.style.left = (e.clientX + 14) + 'px';
          tooltip.style.top  = (e.clientY - 10) + 'px';
          tooltip.style.display = 'block';
        });
        g.addEventListener('mouseleave', function() { tooltip.style.display = 'none'; });
        g.addEventListener('click', function() {
          var url = '';
          if (pt.huyetId) url = 'detail.html?ma=' + encodeURIComponent(pt.huyetId);
          else if (pt.url) url = pt.url;
          else if (pt.ma)  url = 'detail.html?ma=' + encodeURIComponent(pt.ma);
          if (url) window.location.href = url;
        });

        svg.appendChild(g);
      });
    }

    function syncSVGSize() {
      const rw = img.offsetWidth  || img.clientWidth;
      const rh = img.offsetHeight || img.clientHeight;
      if (!rw || !rh) return;
      svg.setAttribute('width',  rw);
      svg.setAttribute('height', rh);
    }

    function doRender() {
      if (svg._rendered) return;
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      if (!nw || !nh) return;
      svg._rendered = true;
      svg.setAttribute('viewBox', '0 0 ' + nw + ' ' + nh);
      svg.setAttribute('preserveAspectRatio', 'none');
      syncSVGSize();
      drawPoints(nw, nh);

      // Keep SVG in sync on resize
      if (window.ResizeObserver) {
        new ResizeObserver(syncSVGSize).observe(img);
      } else {
        window.addEventListener('resize', syncSVGSize);
      }
    }

    img.onload = doRender;
    img.src = map.imageData || '';
    if (img.complete && img.naturalWidth) doRender();
  }

  /* ── Highlight API ───────────────────────────────────── */
  window.hvmapHighlight = function(containerId, pointId, durationMs) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const g = container.querySelector('[data-id="' + pointId + '"]');
    if (!g) return;
    g.classList.add('hv-highlight');
    setTimeout(function() { g.classList.remove('hv-highlight'); }, durationMs || 2000);
  };

  /* ── Get map data ────────────────────────────────────── */
  function getMapData(src) {
    try {
      const raw = localStorage.getItem('huyet888-maps');
      if (raw) {
        const data = JSON.parse(raw);
        if (data && Array.isArray(data.maps) && data.maps.length)
          return Promise.resolve(data);
      }
    } catch(e) {}
    return fetch(src).then(function(r) { return r.json(); });
  }

  /* ── Init all .huyet-map-widget elements ─────────────── */
  function initAll() {
    const widgets = document.querySelectorAll('.huyet-map-widget');
    if (!widgets.length) return;

    const sources = {};
    widgets.forEach(function(w) {
      const src = w.dataset.json || 'assets/js/map-data.json';
      if (!sources[src]) sources[src] = [];
      sources[src].push(w);
    });

    Object.keys(sources).forEach(function(src) {
      getMapData(src)
        .then(function(data) {
          sources[src].forEach(function(w) {
            const mapId = w.dataset.mapId;
            const map = (data.maps || []).find(function(m) { return m.id === mapId; });
            renderWidget(w, map || null);
          });
        })
        .catch(function() {
          sources[src].forEach(function(w) {
            w.innerHTML = '<p style="color:#999;padding:1rem;">Không thể tải bản đồ.</p>';
          });
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
