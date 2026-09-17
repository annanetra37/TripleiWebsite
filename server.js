/**
 * Triple I — zero-dependency static file server.
 * Serves ./public on the port Railway provides ($PORT). No npm install needed.
 *
 *  • Clean URLs:        /pricing            -> public/pricing.html
 *  • Extensionless:     /pricing            (also /pricing/ )
 *  • Long cache for hashed-ish assets, short cache for HTML
 *  • Security headers, gzip-friendly, SPA-free (true MPA)
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.pdf': 'application/pdf',
};

// Media types that browsers fetch with a Range request before playing.
const RANGEABLE = new Set(['.mp4', '.m4v', '.webm', '.mov', '.pdf']);

function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  }, headers));
  res.end(body);
}

// Resolve a request path to a file inside ROOT (prevents traversal).
function resolveFile(urlPath) {
  let p = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  if (p.endsWith('/')) p = p.slice(0, -1);
  if (p === '') p = '/index.html';

  const candidates = [];
  if (path.extname(p)) {
    candidates.push(p);
  } else {
    candidates.push(p + '.html'); // clean URL -> file.html
    candidates.push(p + '/index.html');
    candidates.push(p);
  }

  for (const c of candidates) {
    const abs = path.join(ROOT, path.normalize(c));
    if (!abs.startsWith(ROOT)) continue; // traversal guard
    try {
      const st = fs.statSync(abs);
      if (st.isFile()) return abs;
    } catch (_) { /* keep trying */ }
  }
  return null;
}


/* ---------------------------------------------------------------------------
 * POST /api/submit — every site form (contact, demo, newsletter, CV) lands here
 * and is emailed through Resend. Configure in Railway → Variables:
 *   RESEND_API_KEY  (required)
 *   MAIL_TO         (default meghrikayityan@gmail.com)
 *   MAIL_FROM       (default "Triple I Website <website@zontik.am>")
 * ------------------------------------------------------------------------- */
const MAIL_TO = process.env.MAIL_TO || 'meghrikayityan@gmail.com';
const MAIL_FROM = process.env.MAIL_FROM || 'Triple I Website <website@zontik.am>';
const MAX_BODY = 9 * 1024 * 1024;

function readBody(req, cb) {
  const chunks = [];
  let size = 0;
  let done = false;
  req.on('data', (c) => {
    if (done) return;
    size += c.length;
    if (size > MAX_BODY) { done = true; cb(new Error('too large')); req.destroy(); return; }
    chunks.push(c);
  });
  req.on('end', () => { if (!done) { done = true; cb(null, Buffer.concat(chunks)); } });
  req.on('error', (e) => { if (!done) { done = true; cb(e); } });
}

function parseMultipart(buf, boundary) {
  const fields = {};
  const files = [];
  const sep = Buffer.from('--' + boundary);
  let pos = buf.indexOf(sep);
  while (pos !== -1) {
    const start = pos + sep.length;
    if (buf.slice(start, start + 2).toString() === '--') break;
    const next = buf.indexOf(sep, start);
    if (next === -1) break;
    let part = buf.slice(start + 2, next - 2); // strip leading and trailing CRLF
    const headEnd = part.indexOf('\r\n\r\n');
    if (headEnd === -1) { pos = next; continue; }
    const headers = part.slice(0, headEnd).toString();
    const value = part.slice(headEnd + 4);
    const nameMatch = /name="([^"]*)"/i.exec(headers);
    const fileMatch = /filename="([^"]*)"/i.exec(headers);
    const typeMatch = /content-type:\s*([^\r\n]+)/i.exec(headers);
    const name = nameMatch ? nameMatch[1] : '';
    if (fileMatch && fileMatch[1]) {
      files.push({ field: name, filename: fileMatch[1], type: typeMatch ? typeMatch[1].trim() : 'application/octet-stream', data: value });
    } else if (name) {
      fields[name] = value.toString('utf8');
    }
    pos = next;
  }
  return { fields, files };
}

function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

async function sendMail({ subject, fields, files, replyTo }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  const rows = Object.keys(fields)
    .filter((k) => k[0] !== '_' && fields[k] !== '')
    .map((k) => '<tr><td style="padding:6px 14px 6px 0;color:#5A6A5D;vertical-align:top;white-space:nowrap">' + esc(k) +
      '</td><td style="padding:6px 0;color:#0E1A11">' + esc(fields[k]).replace(/\n/g, '<br>') + '</td></tr>')
    .join('');
  const payload = {
    from: MAIL_FROM,
    to: [MAIL_TO],
    subject: subject,
    html: '<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6">' +
      '<h2 style="margin:0 0 14px;font-size:17px;color:#0E1A11">' + esc(subject) + '</h2>' +
      '<table style="border-collapse:collapse">' + rows + '</table>' +
      '<p style="margin:18px 0 0;font-size:12px;color:#8A968C">Sent from the Triple I website.</p></div>',
  };
  if (replyTo) payload.reply_to = replyTo;
  if (files && files.length) {
    payload.attachments = files.map((f) => ({ filename: f.filename, content: f.data.toString('base64') }));
  }
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('resend ' + r.status + ' ' + (await r.text()));
}

function handleSubmit(req, res) {
  readBody(req, async (err, buf) => {
    if (err) return send(res, 413, JSON.stringify({ ok: false, error: 'Payload too large' }), { 'Content-Type': 'application/json' });
    try {
      const ctype = req.headers['content-type'] || '';
      let fields = {};
      let files = [];
      if (ctype.indexOf('multipart/form-data') === 0) {
        const b = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(ctype);
        const boundary = b ? (b[1] || b[2]).trim() : '';
        if (!boundary) throw new Error('missing boundary');
        const parsed = parseMultipart(buf, boundary);
        fields = parsed.fields;
        files = parsed.files.filter((f) => f.data && f.data.length);
      } else if (ctype.indexOf('application/json') === 0) {
        fields = JSON.parse(buf.toString('utf8') || '{}');
      } else {
        const params = new URLSearchParams(buf.toString('utf8'));
        params.forEach((v, k) => { fields[k] = v; });
      }
      const subject = fields._subject || 'Website submission — triplei.io';
      const replyTo = fields.Email || fields['Work email'] || fields.email || null;
      await sendMail({ subject, fields, files, replyTo });
      send(res, 200, JSON.stringify({ ok: true }), { 'Content-Type': 'application/json' });
    } catch (e) {
      console.error('submit failed:', e.message);
      send(res, 500, JSON.stringify({ ok: false, error: 'Could not send' }), { 'Content-Type': 'application/json' });
    }
  });
}


/* ---------------------------------------------------------------------------
 * VISITOR ANALYTICS
 *  POST /api/track          — beacon from public/assets/track.js
 *  GET  /api/visitors.json  — events for the dashboard (Basic auth)
 *  GET  /api/visitors.csv   — same data as CSV for Excel (Basic auth)
 *  GET  /visitors           — dashboard page (Basic auth)
 * Railway → Variables:
 *   ADMIN_USER (default "admin"), ADMIN_PASS (required to view the dashboard)
 *   DATA_DIR   (default ./.data — set to a mounted volume path to persist)
 * ------------------------------------------------------------------------- */
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '.data');
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || '';
const geoCache = new Map();

function ensureDataDir() {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (_) {}
}
function eventFile(d) {
  return path.join(DATA_DIR, 'events-' + d.toISOString().slice(0, 7) + '.jsonl');
}
function clientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (xf) return String(xf).split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || '';
}
function classifySource(ref, utmSource) {
  const host = (function () {
    try { return new URL(ref).hostname.replace(/^www\./, '').toLowerCase(); } catch (_) { return ''; }
  })();
  const s = (utmSource || '').toLowerCase();
  const ai = /(chatgpt|openai|chat\.openai|perplexity|claude|anthropic|gemini|bard|copilot|you\.com|poe\.com|phind|deepseek|grok|mistral)/;
  const search = /(google|bing|duckduckgo|yandex|baidu|ecosia|brave|yahoo|startpage|qwant)/;
  const social = /(linkedin|lnkd\.in|twitter|t\.co|^x\.com|facebook|fb\.com|instagram|reddit|youtube|youtu\.be|tiktok|threads|medium|substack)/;
  const mail = /(mail\.google|outlook|mail\.yahoo|superhuman|hey\.com)/;
  if (ai.test(host) || ai.test(s)) return 'AI assistant';
  if (search.test(host) || ['google','bing','duckduckgo','organic','seo'].indexOf(s) > -1) return 'Search';
  if (social.test(host) || ['linkedin','twitter','x','facebook','instagram','social'].indexOf(s) > -1) return 'Social';
  if (mail.test(host) || s === 'email' || s === 'newsletter') return 'Email';
  if (utmSource) return 'Campaign';
  if (!ref) return 'Direct';
  return 'Referral';
}
function uaBits(ua) {
  ua = ua || '';
  const bot = /(bot|crawler|spider|crawl|slurp|facebookexternalhit|preview|monitor|lighthouse|headless|gptbot|claudebot|ccbot|perplexitybot|bingpreview)/i.test(ua);
  const device = /iPad|Tablet/i.test(ua) ? 'tablet' : (/Mobi|Android|iPhone/i.test(ua) ? 'mobile' : 'desktop');
  let browser = 'Other';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/OPR\//.test(ua)) browser = 'Opera';
  else if (/Chrome\//.test(ua)) browser = 'Chrome';
  else if (/Safari\//.test(ua) && /Version\//.test(ua)) browser = 'Safari';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  let os = 'Other';
  if (/Windows/.test(ua)) os = 'Windows';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iOS/.test(ua)) os = 'iOS';
  else if (/Mac OS X/.test(ua)) os = 'macOS';
  else if (/Linux/.test(ua)) os = 'Linux';
  return { bot: bot, device: device, browser: browser, os: os };
}
async function geoLookup(ip) {
  if (!ip || /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1|fc|fd)/i.test(ip)) return {};
  if (geoCache.has(ip)) return geoCache.get(ip);
  try {
    const r = await fetch('https://ipwho.is/' + encodeURIComponent(ip) +
      '?fields=success,country,country_code,region,city,latitude,longitude,connection,timezone');
    const j = await r.json();
    const geo = j && j.success ? {
      country: j.country || '',
      countryCode: j.country_code || '',
      region: j.region || '',
      city: j.city || '',
      lat: j.latitude || null,
      lon: j.longitude || null,
      org: (j.connection && (j.connection.org || j.connection.isp)) || '',
      tzServer: (j.timezone && j.timezone.id) || '',
    } : {};
    geoCache.set(ip, geo);
    if (geoCache.size > 5000) geoCache.clear();
    return geo;
  } catch (_) { return {}; }
}
function handleTrack(req, res) {
  readBody(req, async (err, buf) => {
    if (err) return send(res, 204, '');
    try {
      const body = JSON.parse(buf.toString('utf8') || '{}');
      const ip = clientIp(req);
      const ua = req.headers['user-agent'] || '';
      const bits = uaBits(ua);
      const geo = await geoLookup(ip);
      const row = Object.assign({
        ts: new Date().toISOString(),
        type: body.type || 'pageview',
        path: String(body.path || '').slice(0, 300),
        title: String(body.title || '').slice(0, 200),
        referrer: String(body.referrer || '').slice(0, 400),
        source: classifySource(body.referrer, body.utm_source),
        utmSource: body.utm_source || '',
        utmMedium: body.utm_medium || '',
        utmCampaign: body.utm_campaign || '',
        utmTerm: body.utm_term || '',
        utmContent: body.utm_content || '',
        gclid: body.gclid || '',
        visitorId: String(body.visitorId || '').slice(0, 40),
        sessionId: String(body.sessionId || '').slice(0, 40),
        newVisitor: !!body.newVisitor,
        lang: body.lang || '',
        tz: body.tz || '',
        screen: body.screen || '',
        viewport: body.viewport || '',
        durationMs: Number(body.durationMs || 0) || 0,
        scrollPct: Number(body.scrollPct || 0) || 0,
        targetUrl: String(body.targetUrl || '').slice(0, 400),
        ip: ip,
        device: bits.device,
        browser: bits.browser,
        os: bits.os,
        bot: bits.bot,
        ua: ua.slice(0, 300),
      }, geo);
      ensureDataDir();
      fs.appendFile(eventFile(new Date()), JSON.stringify(row) + '\n', () => {});
    } catch (_) {}
    send(res, 204, '');
  });
}
function authOk(req) {
  if (!ADMIN_PASS) return false;
  const h = req.headers.authorization || '';
  if (h.indexOf('Basic ') !== 0) return false;
  const [u, p] = Buffer.from(h.slice(6), 'base64').toString('utf8').split(':');
  return u === ADMIN_USER && p === ADMIN_PASS;
}
function authChallenge(res, msg) {
  const headers = { 'Content-Type': 'text/plain; charset=utf-8' };
  if (ADMIN_PASS) headers['WWW-Authenticate'] = 'Basic realm="Triple I analytics"';
  send(res, ADMIN_PASS ? 401 : 503,
    msg || (ADMIN_PASS ? 'Authentication required' : 'Set ADMIN_PASS in the environment to enable the dashboard.'),
    headers);
}
function readEvents(from, to) {
  ensureDataDir();
  let names = [];
  try { names = fs.readdirSync(DATA_DIR).filter((f) => /^events-\d{4}-\d{2}\.jsonl$/.test(f)).sort(); } catch (_) {}
  const out = [];
  for (const name of names) {
    const month = name.slice(7, 14);
    if (from && month < from.slice(0, 7)) continue;
    if (to && month > to.slice(0, 7)) continue;
    let text = '';
    try { text = fs.readFileSync(path.join(DATA_DIR, name), 'utf8'); } catch (_) { continue; }
    for (const line of text.split('\n')) {
      if (!line) continue;
      try {
        const row = JSON.parse(line);
        const day = (row.ts || '').slice(0, 10);
        if (from && day < from) continue;
        if (to && day > to) continue;
        out.push(row);
      } catch (_) {}
    }
  }
  return out.slice(-50000);
}
const CSV_COLS = ['ts','type','path','title','targetUrl','source','referrer','country','city','region','ip','org','device','browser','os','lang','tz','screen','viewport','durationMs','scrollPct','visitorId','sessionId','newVisitor','utmSource','utmMedium','utmCampaign','bot','ua'];
function toCsv(rows) {
  const cell = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [CSV_COLS.join(',')];
  for (const r of rows) lines.push(CSV_COLS.map((c) => cell(r[c])).join(','));
  return '\uFEFF' + lines.join('\r\n');
}
function handleVisitorsApi(req, res, urlObj, asCsv) {
  if (!authOk(req)) return authChallenge(res);
  const from = urlObj.searchParams.get('from') || '';
  const to = urlObj.searchParams.get('to') || '';
  const rows = readEvents(from, to);
  if (asCsv) {
    return send(res, 200, toCsv(rows), {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="triplei-visitors-' + new Date().toISOString().slice(0, 10) + '.csv"',
      'Cache-Control': 'no-store',
    });
  }
  send(res, 200, JSON.stringify({ rows: rows }), { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
}

const server = http.createServer((req, res) => {
  try { return route_(req, res); }
  catch (e) {
    console.error('request failed:', e && e.message);
    try { return send(res, 500, 'Server error', { 'Content-Type': 'text/plain' }); } catch (_) { try { res.end(); } catch (__) {} }
  }
});

process.on('uncaughtException', (e) => console.error('uncaught:', e && e.message));
process.on('unhandledRejection', (e) => console.error('unhandled rejection:', e && (e.message || e)));

function route_(req, res) {
  const urlObj = new URL(req.url, 'http://localhost');
  const route = urlObj.pathname.replace(/\/$/, '') || '/';

  // Pages are served at extensionless paths and reference their assets
  // relatively ("assets/styles.css"). On a trailing-slash URL the browser
  // resolves those against /page/ instead of /, so every asset 404s and the
  // page renders unstyled. Redirect to the canonical path instead.
  if ((req.method === 'GET' || req.method === 'HEAD') &&
      urlObj.pathname.length > 1 && urlObj.pathname.endsWith('/')) {
    return send(res, 301, '', {
      Location: route + urlObj.search,
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    });
  }

  if (req.method === 'POST' && route === '/api/submit') {
    return handleSubmit(req, res);
  }
  if (req.method === 'POST' && route === '/api/track') {
    return handleTrack(req, res);
  }
  if (req.method === 'GET' && route === '/api/visitors.json') {
    return handleVisitorsApi(req, res, urlObj, false);
  }
  if (req.method === 'GET' && route === '/api/visitors.csv') {
    return handleVisitorsApi(req, res, urlObj, true);
  }
  if (req.method === 'GET' && (route === '/visitors' || route === '/visitors.html')) {
    if (!authOk(req)) return authChallenge(res);
    const f = path.join(ROOT, 'visitors.html');
    if (fs.existsSync(f)) {
      return send(res, 200, fs.readFileSync(f), { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' });
    }
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method Not Allowed', { 'Content-Type': 'text/plain' });
  }

  const file = resolveFile(req.url);

  if (!file) {
    // 404 -> serve a friendly page if present, else plain text
    const notFound = path.join(ROOT, '404.html');
    if (fs.existsSync(notFound)) {
      return send(res, 404, fs.readFileSync(notFound), { 'Content-Type': MIME['.html'] });
    }
    return send(res, 404, 'Not Found', { 'Content-Type': 'text/plain' });
  }

  const ext = path.extname(file).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  const isHTML = ext === '.html';
  const cache = isHTML
    ? 'public, max-age=0, must-revalidate'
    : 'public, max-age=604800, stale-while-revalidate=86400';

  // Media needs byte-range support: Safari (and iOS in particular) probes a
  // video with `Range: bytes=0-1` and refuses to play it at all unless the
  // server answers 206 with Content-Range. Serving 200 + the whole file is
  // why the step videos rendered as empty boxes on iPhone.
  if (RANGEABLE.has(ext)) {
    return sendRangeable(req, res, file, type, cache);
  }

  const body = req.method === 'HEAD' ? '' : fs.readFileSync(file);
  send(res, 200, body, { 'Content-Type': type, 'Cache-Control': cache });
}

// Serve a file with HTTP range support, streaming rather than buffering.
function sendRangeable(req, res, file, type, cache) {
  let size;
  try { size = fs.statSync(file).size; }
  catch (_) { return send(res, 404, 'Not Found', { 'Content-Type': 'text/plain' }); }

  const base = {
    'Content-Type': type,
    'Cache-Control': cache,
    'Accept-Ranges': 'bytes',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };

  const range = req.headers.range;
  const m = range ? /^bytes=(\d*)-(\d*)$/.exec(String(range).trim()) : null;

  if (!m) {
    res.writeHead(200, Object.assign({ 'Content-Length': size }, base));
    if (req.method === 'HEAD') return res.end();
    return fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
  }

  // "bytes=-500" means the final 500 bytes; otherwise start[-end], end optional.
  let start, end;
  if (m[1] === '') {
    const suffix = parseInt(m[2], 10);
    if (!suffix) { res.writeHead(416, Object.assign({ 'Content-Range': 'bytes */' + size }, base)); return res.end(); }
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = parseInt(m[1], 10);
    end = m[2] === '' ? size - 1 : Math.min(parseInt(m[2], 10), size - 1);
  }

  if (!(start >= 0 && end >= start && start < size)) {
    res.writeHead(416, Object.assign({ 'Content-Range': 'bytes */' + size }, base));
    return res.end();
  }

  res.writeHead(206, Object.assign({
    'Content-Range': 'bytes ' + start + '-' + end + '/' + size,
    'Content-Length': end - start + 1,
  }, base));
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file, { start: start, end: end }).on('error', () => res.destroy()).pipe(res);
}

server.listen(PORT, () => {
  console.log('Triple I site running on http://0.0.0.0:' + PORT);
});
