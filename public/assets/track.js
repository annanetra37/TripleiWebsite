/* Triple I — first-party visitor tracking. Sends to /api/track on this host only. */
(function () {
  if (location.pathname.indexOf('/visitors') === 0) return;
  var KEY = 'tri_vid', SKEY = 'tri_sid';

  function uid() {
    try { return crypto.randomUUID(); }
    catch (_) { return 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }
  }
  var isNew = false, vid, sid;
  try {
    vid = localStorage.getItem(KEY);
    if (!vid) { vid = uid(); localStorage.setItem(KEY, vid); isNew = true; }
    sid = sessionStorage.getItem(SKEY);
    if (!sid) { sid = uid(); sessionStorage.setItem(SKEY, sid); }
  } catch (_) { vid = uid(); sid = uid(); }

  var q = new URLSearchParams(location.search);
  var base = {
    path: location.pathname + location.search,
    title: document.title,
    referrer: document.referrer || '',
    utm_source: q.get('utm_source') || '',
    utm_medium: q.get('utm_medium') || '',
    utm_campaign: q.get('utm_campaign') || '',
    utm_term: q.get('utm_term') || '',
    utm_content: q.get('utm_content') || '',
    gclid: q.get('gclid') || q.get('fbclid') || '',
    visitorId: vid,
    sessionId: sid,
    newVisitor: isNew,
    lang: navigator.language || '',
    tz: (function () { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (_) { return ''; } })(),
    screen: screen.width + 'x' + screen.height,
    viewport: innerWidth + 'x' + innerHeight
  };

  function post(payload, beacon) {
    var body = JSON.stringify(payload);
    if (beacon && navigator.sendBeacon) {
      try { navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' })); return; } catch (_) {}
    }
    try {
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true });
    } catch (_) {}
  }

  post(Object.assign({ type: 'pageview' }, base));

  var start = Date.now(), maxScroll = 0, sent = false;
  addEventListener('scroll', function () {
    var h = document.documentElement.scrollHeight - innerHeight;
    var pct = h > 0 ? Math.round((scrollY / h) * 100) : 100;
    if (pct > maxScroll) maxScroll = Math.min(100, pct);
  }, { passive: true });

  function finish() {
    if (sent) return;
    sent = true;
    post(Object.assign({ type: 'engagement', durationMs: Date.now() - start, scrollPct: maxScroll }, base), true);
  }
  addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') finish(); });
  addEventListener('pagehide', finish);

  /* Outbound + CTA clicks */
  addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var out = /^https?:\/\//.test(href) && href.indexOf(location.host) === -1;
    var mail = href.indexOf('mailto:') === 0;
    if (!out && !mail) return;
    post(Object.assign({ type: mail ? 'email-click' : 'outbound-click', title: (a.textContent || '').trim().slice(0, 80) }, base, { path: location.pathname, referrer: document.referrer || '', targetUrl: href }));
  }, true);
})();
