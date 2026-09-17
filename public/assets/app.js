/* Triple I — site interactions (vanilla, ~2KB). No dependencies. */
(function () {
  'use strict';

  // Sticky header shadow on scroll
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Mobile menu toggle
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // FAQ accordions
  document.querySelectorAll('.acc').forEach(function (acc) {
    var items = acc.querySelectorAll('.acc-item');
    items.forEach(function (item) {
      var q = item.querySelector('.acc-q');
      if (!q) return;
      q.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');
        items.forEach(function (i) { i.classList.remove('open'); });
        if (!isOpen) item.classList.add('open');
      });
    });
    // open first by default
    if (items[0]) items[0].classList.add('open');
  });

  // Contact / demo forms — posted to FormSubmit, acknowledged inline
  document.querySelectorAll('form[data-demo-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type=submit]');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (r) { return r.ok ? r.json() : Promise.reject(r); })
        .then(function () {
          var card = form.closest('.form-card') || form.parentNode;
          card.innerHTML =
            '<div class="stack" style="align-items:center;text-align:center;gap:16px;padding:40px 12px">' +
            '<span style="width:64px;height:64px;border-radius:50%;background:var(--green-50);display:inline-flex;align-items:center;justify-content:center">' +
            '<svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4L19 7" stroke="var(--brand)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
            '<h3 class="h2" style="font-size:var(--fs-h3)">Thanks &mdash; we\u2019ll be in touch!</h3>' +
            '<p class="muted">We reply within one business day.</p>' +
            '</div>';
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = 'Try again'; }
          var warn = form.querySelector('[data-form-error]');
          if (!warn) {
            warn = document.createElement('p');
            warn.setAttribute('data-form-error', '');
            warn.style.cssText = 'margin:0;font-size:var(--fs-sm);color:#B3261E;text-align:center';
            form.appendChild(warn);
          }
          warn.textContent = 'Something went wrong. Please email info@triplei.io instead.';
        });
    });
  });
})();


/* Step videos: play only while in view, pause otherwise (saves bandwidth + CPU). */
(function(){
  var vids = document.querySelectorAll('.tl-media video');
  if (!vids.length) return;
  if (!('IntersectionObserver' in window)) {
    vids.forEach(function(v){ v.autoplay = true; v.play().catch(function(){}); });
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      var v = e.target;
      if (e.isIntersecting) { v.play().catch(function(){}); }
      else { v.pause(); }
    });
  }, { threshold: 0.35 });
  vids.forEach(function(v){
    // iOS needs these as properties too before a programmatic play().
    v.muted = true;
    v.playsInline = true;
    // If a clip cannot be decoded or fetched, collapse its frame rather than
    // leaving an empty tinted box on the page. preload starts before this
    // script runs, so check for an error that already happened as well.
    var fail = function(){
      var box = v.closest ? v.closest('.tl-media') : v.parentNode;
      if (box) box.classList.add('is-unavailable');
    };
    v.addEventListener('error', fail);
    if (v.error || v.networkState === 3 /* NETWORK_NO_SOURCE */) fail();
    io.observe(v);
  });
})();


/* Hero video: single-click inline play, plus an expand button for a larger window. */
(function(){
  var frames = document.querySelectorAll('.video-frame[data-yt]');
  if (!frames.length) return;

  var apiReady = false, apiLoading = false, queue = [];
  function withApi(cb){
    if (apiReady) return cb();
    queue.push(cb);
    if (apiLoading) return;
    apiLoading = true;
    var s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
    window.onYouTubeIframeAPIReady = function(){
      apiReady = true;
      queue.forEach(function(f){ f(); });
      queue = [];
    };
  }

  function mountPlayer(host, id, startAt, onReady){
    var div = document.createElement('div');
    host.appendChild(div);
    var p = null;
    withApi(function(){
      p = new window.YT.Player(div, {
        videoId: id,
        playerVars: { autoplay:1, rel:0, modestbranding:1, playsinline:1, start: Math.max(0, Math.floor(startAt||0)) },
        events: { onReady: function(e){ try { e.target.playVideo(); } catch(_){} if (onReady) onReady(e.target); } }
      });
      host.__player = p;
    });
    return function(){ return host.__player; };
  }

  /* Lightbox, only opened by the expand button. */
  var overlay = null;
  function buildOverlay(){
    overlay = document.createElement('div');
    overlay.className = 'video-modal';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','Video player');
    overlay.innerHTML =
      '<div class="video-modal-box">' +
        '<button class="video-modal-close" type="button" aria-label="Close video">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>' +
        '</button>' +
        '<div class="video-modal-stage"></div>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e){ if (e.target === overlay) closeModal(); });
    overlay.querySelector('.video-modal-close').addEventListener('click', closeModal);
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && overlay && overlay.classList.contains('is-open')) closeModal();
    });
  }
  var modalHost = null, returnTo = null;
  function openModal(id, startAt, restore){
    if (!overlay) buildOverlay();
    modalHost = overlay.querySelector('.video-modal-stage');
    modalHost.innerHTML = '';
    modalHost.__player = null;
    returnTo = restore || null;
    mountPlayer(modalHost, id, startAt);
    overlay.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
    overlay.querySelector('.video-modal-close').focus();
  }
  function closeModal(){
    if (!overlay) return;
    var at = 0;
    var p = modalHost && modalHost.__player;
    if (p && p.getCurrentTime) { try { at = p.getCurrentTime(); } catch(_){} }
    if (p && p.destroy) { try { p.destroy(); } catch(_){} }
    if (modalHost) { modalHost.innerHTML = ''; modalHost.__player = null; }
    overlay.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    var back = returnTo; returnTo = null;
    if (back) back(at);
  }

  frames.forEach(function(frame){
    var id = frame.getAttribute('data-yt');
    var btn = frame.querySelector('.video-play');
    var poster = frame.querySelector('.video-poster');
    var expand = null;

    function addExpand(){
      if (expand) { expand.hidden = false; return; }
      expand = document.createElement('button');
      expand.type = 'button';
      expand.className = 'video-expand';
      expand.setAttribute('aria-label','Expand video');
      expand.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 4H4v5M15 4h5v5M15 20h5v-5M9 20H4v-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      expand.addEventListener('click', function(){
        var at = 0;
        var p = frame.__player;
        if (p && p.getCurrentTime) { try { at = p.getCurrentTime(); } catch(_){} }
        if (p && p.destroy) { try { p.destroy(); } catch(_){} }
        frame.__player = null;
        var mount = frame.querySelector('.video-stage');
        if (mount) mount.innerHTML = '';
        expand.hidden = true;
        openModal(id, at, function(backAt){
          expand.hidden = false;
          playInline(backAt);
        });
      });
      frame.appendChild(expand);
    }

    function playInline(at){
      var mount = frame.querySelector('.video-stage');
      if (!mount) {
        mount = document.createElement('div');
        mount.className = 'video-stage';
        frame.appendChild(mount);
      }
      mount.innerHTML = '';
      frame.classList.add('is-playing');
      if (btn) btn.style.display = 'none';
      mountPlayer(mount, id, at, function(){ frame.__player = mount.__player; });
      var sync = setInterval(function(){
        if (mount.__player) { frame.__player = mount.__player; clearInterval(sync); }
      }, 120);
      addExpand();
    }

    if (btn) btn.addEventListener('click', function(){ playInline(0); });
    if (poster) { poster.style.cursor = 'pointer'; poster.addEventListener('click', function(){ if (!frame.classList.contains('is-playing')) playInline(0); }); }
  });
})();


/* Industries mega menu: hover + keyboard/focus, with a small close delay. */
(function(){
  var header = document.querySelector('.site-header');
  var item = document.querySelector('.nav-has-mega');
  var mega = document.getElementById('mega-industries');
  if (!header || !item || !mega) return;
  var trigger = item.querySelector('a');
  var t;
  function open(){ clearTimeout(t); header.classList.add('mega-open'); trigger.setAttribute('aria-expanded','true'); }
  function close(){ header.classList.remove('mega-open'); trigger.setAttribute('aria-expanded','false'); }
  function closeSoon(){ clearTimeout(t); t = setTimeout(close, 160); }
  [item, mega].forEach(function(el){
    el.addEventListener('mouseenter', open);
    el.addEventListener('mouseleave', closeSoon);
    el.addEventListener('focusin', open);
    el.addEventListener('focusout', closeSoon);
  });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
})();


/* Before / after comparison slider */
document.querySelectorAll('[data-compare]').forEach(function (root) {
  var handle = root.querySelector('.compare-handle');
  var dragging = false;
  function set(pct) {
    pct = Math.max(2, Math.min(98, pct));
    root.style.setProperty('--pos', pct + '%');
    if (handle) handle.setAttribute('aria-valuenow', Math.round(pct));
  }
  function fromEvent(e) {
    var r = root.getBoundingClientRect();
    set(((e.clientX - r.left) / r.width) * 100);
  }
  function start(e) { dragging = true; root.setPointerCapture && root.setPointerCapture(e.pointerId); fromEvent(e); }
  root.addEventListener('pointerdown', start);
  root.addEventListener('pointermove', function (e) { if (dragging) fromEvent(e); });
  root.addEventListener('pointerup', function () { dragging = false; });
  root.addEventListener('pointercancel', function () { dragging = false; });
  /* "Move me" hint: pulse the handle until the user interacts. */
  root.classList.add('cmp-hint');
  function stopHint(){ root.classList.remove('cmp-hint'); }
  root.addEventListener('pointerdown', stopHint);
  root.addEventListener('keydown', stopHint);
  if (handle) {
    handle.addEventListener('keydown', function (e) {
      var cur = parseFloat(root.style.getPropertyValue('--pos')) || 50;
      if (e.key === 'ArrowLeft') { set(cur - 4); e.preventDefault(); }
      if (e.key === 'ArrowRight') { set(cur + 4); e.preventDefault(); }
    });
  }
});

/* Blog: Load More */
document.querySelectorAll('[data-load-more]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var grid = document.querySelector('.blog-grid');
    if (!grid) return;
    grid.classList.add('is-expanded');
    btn.parentElement.style.display = 'none';
  });
});

/* Scroll reveal — auto-tags section content on every page, then animates it in. */
(function () {
  var SKIP = /(^|\s)(site-header|site-footer|bg-hero)(\s|$)/;

  function tagged(el){ return el.hasAttribute('data-reveal'); }
  function insideTagged(el){ return !!el.parentElement.closest('[data-reveal]'); }
  function tag(el, delay){
    if (tagged(el) || insideTagged(el)) return;
    el.setAttribute('data-reveal', '');
    if (delay) el.style.setProperty('--reveal-delay', delay + 'ms');
  }

  function autoTag(){
    var sections = document.querySelectorAll('section, footer.site-footer > .container > *');
    Array.prototype.forEach.call(document.querySelectorAll('section'), function(sec){
      if (SKIP.test(sec.className || '')) return;
      if (sec.closest('.site-header')) return;
      var host = sec.querySelector(':scope > .container') || sec;
      var kids = Array.prototype.filter.call(host.children, function(k){
        return k.offsetParent !== null || k.getClientRects().length;
      });
      var step = 0;
      kids.forEach(function(kid){
        var isGrid = /(^|\s)(grid|trust-grid|plan-grid|logo-row|cert-row)(\s|$)/.test(kid.className || '');
        if (isGrid && kid.children.length > 1) {
          Array.prototype.forEach.call(kid.children, function(item, i){
            tag(item, i * 70);
          });
        } else {
          tag(kid, step * 90);
          step++;
        }
      });
    });
    return sections;
  }

  function observe(){
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add('is-revealed'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-revealed'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  autoTag();
  observe();
})();

/* Footer subscribe — posted to FormSubmit, acknowledged inline. */
(function(){
  document.querySelectorAll('form[data-subscribe]').forEach(function(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var input = form.querySelector('input[type=email]');
      if (!input || !input.value) return;
      var btn = form.querySelector('button[type=submit]');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function(r){ return r.ok ? r.json() : Promise.reject(r); })
        .then(function(){
          form.innerHTML = '<p style="margin:0;padding:12px 18px;font-size:var(--fs-sm);color:#fff">Thanks &mdash; you&rsquo;re on the list.</p>';
        })
        .catch(function(){
          if (btn) { btn.disabled = false; btn.textContent = 'Try again'; }
        });
    });
  });
})();

/* Careers CV form — posted to /api/submit with the attachment, acknowledged inline. */
(function(){
  var form = document.querySelector('form[data-cv-form]');
  if (!form) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var btn = form.querySelector('button[type=submit]');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
      .then(function(r){ return r.ok ? r.json() : Promise.reject(r); })
      .then(function(){ location.href = 'thanks.html'; })
      .catch(function(){
        if (btn) { btn.disabled = false; btn.textContent = 'Try again'; }
        var warn = form.querySelector('[data-form-error]');
        if (!warn) {
          warn = document.createElement('p');
          warn.setAttribute('data-form-error', '');
          warn.style.cssText = 'margin:0;font-size:var(--fs-sm);color:#B3261E;text-align:center';
          form.appendChild(warn);
        }
        warn.textContent = 'Upload failed. Please email your CV to info@triplei.io.';
      });
  });
})();
