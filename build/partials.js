// Build script — generates the 6 static HTML pages into site/public/.
// Run via the run_script tool. Pure string assembly; no network.

// ---------- shared data ----------
const CDN = 'https://framerusercontent.com/images/';
const img = {
  ecohubFlow: 'assets/img/ecohub-flow.avif',
  ecohubArch: CDN+'v4sJY80VLROql5LFntmM44t0CBI.png',
  worldMap:   CDN+'N6GPg1ia5J2TCQMLGNw4QxbUdtw.png',
  aboutHero:  CDN+'mDlACZc8MLRuj778A90HuNH6O9g.png',
  m1:CDN+'i0MAoMHOlCcrRNTYcDfTOjPDvYU.jpg', m2:CDN+'RU3qUrWEHHy01fTKSBUYwKOiT0A.jpg',
  m3:CDN+'GeeCNXZEgqixpCCbvGF3ygej4.jpg',   m4:CDN+'ojbFxAK8LV7Nv28RVXntRz8ZLus.jpg',
  pMs:CDN+'k93eugxccVqq3F1JGJ2y6nSeU.png', pNv:CDN+'zHXPwjeRq4rCRV9shEAtol064fA.png', pCam:CDN+'IL2GE5kY77wM8XYdVhFetqJVUg.png',
};
const fic = {
  ai:CDN+'ESzjm9vO3pnfQtCqJjlptWBBZgw.svg', realtime:CDN+'td9jE8h7kGI0Z4R9upbDDqg55E.svg',
  saveMoney:CDN+'ScfzsvJoWshaCdC7YxoqnkCnU.svg', reportGen:CDN+'64Ewk7lqGH72wwD8IcYWFNQTeY.svg',
  dataInt:CDN+'LmcLha8alWsGrs3l1GikfWP804.svg', connect:CDN+'KuFSmd0Z1ScF5KUcc5hR1Q2ci9w.svg',
};
const iic = {
  growth:CDN+'9DbRUaFsPTGop5IkR8ZG2etW240.svg', impact:CDN+'nHJds9zTqMXWolFpEHiBhnq4.svg',
  gov:CDN+'cAxtV6C412jsbWztogq4cg7foM.svg', ngo:CDN+'wBYvcG0bphhXvzi2K2NPExfe6UM.svg', vsme:CDN+'ZNxcFYWjmrdNNwLEktCrOzBGWk.svg',
};
const pic = { small:CDN+'wCHzT6zQtFZT27eNi5ZDTtZj8A0.svg', medium:CDN+'76PJ7bwocW8UiHZWSgmBmRjdsIE.svg', large:CDN+'6gCXuEacAoyaaiHJ55Yj09KcmQ.svg' };
const certs = ['cHm5dLQSp5thDNIWDsMwmDyh3A','3dILdx0WnAeSOWKlvcQwWMp9lAI','ZMaPPDirWA0gJjzhkDaR5HHpccA','sfY9i0Uxs0KAGI287gLOZyMenHE','TZSIFoaQUu0HuqiUODSCEb88PQ','ci5l8uZbtjU7VAV8zQnX5tJBo','Lmmlkh4klTEvS2wJR6QIx7KZxq8']
  .map(h => ({src:CDN+h+'.svg'}));

const NAV = [['Home','/'],['Industries','/industries'],['Pricing','/pricing'],['Blog','/blog'],['About us','/about'],['Contact','/contact']];

// ---------- partials ----------
const MARK = '<span class="mark" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="13" width="4.5" height="8" rx="2.25" fill="currentColor"/><rect x="9.75" y="8" width="4.5" height="13" rx="2.25" fill="currentColor"/><rect x="16.5" y="3" width="4.5" height="18" rx="2.25" fill="currentColor"/></svg></span>';
const logo = (dark) => `<a class="logo${dark?' on-dark':''}" href="index.html" aria-label="Triple I home"><img src="assets/img/logo-${dark?'white':'darkgreen'}.png" alt="" height="${dark?34:36}" style="height:${dark?34:36}px;width:auto;display:block">Triple I</a>`;
const arrow = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const check = (c='var(--brand)') => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="var(--green-50)"/><path d="M7 12.5l3.2 3.2L17 8.5" stroke="${c}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const cross = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="var(--ink-100)"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="var(--ink-400)" stroke-width="2" stroke-linecap="round"/></svg>`;
const ckSmall = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4L19 7" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const planCk = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4L19 7" stroke="var(--brand)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function header(active) {
  return `<header class="site-header">
  <div class="container nav-inner">
    ${logo(false)}
    <nav class="nav-links" aria-label="Primary">
      ${NAV.map(([l,h]) => `<a href="${h}"${h===active?' class="active" aria-current="page"':''}>${l}</a>`).join('\n      ')}
    </nav>
    <div class="nav-cta">
      <a class="login" href="https://app.triplei.io/login">Log in</a>
      <a class="btn btn-primary btn-sm" href="/contact">Request a demo</a>
    </div>
    <button class="nav-toggle" aria-label="Open menu" aria-expanded="false">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="var(--ink-900)" stroke-width="2.2" stroke-linecap="round"/></svg>
    </button>
  </div>
  <div class="mobile-menu">
    ${NAV.map(([l,h]) => `<a href="${h}">${l}</a>`).join('\n    ')}
    <div class="row"><a class="btn btn-outline btn-sm btn-full" href="/contact">Log in</a><a class="btn btn-primary btn-sm btn-full" href="/contact">Request a demo</a></div>
  </div>
</header>`;
}

function ctaSection() {
  return `<section class="bg-mint"><div class="container" style="padding-block:var(--section-y)">
  <div class="cta-card">
    <div class="stack" style="gap:var(--space-5);align-items:flex-start">
      <span class="eyebrow" data-noline>EcoHub&trade;</span>
      <h2 class="h1">Your single source of truth for accurate, actionable ESG insights</h2>
      <p class="lead">EcoHub&rsquo;s AI unifies your sustainability data into a holistic ESG architecture.</p>
      <a class="btn btn-primary btn-lg" href="/contact">Request a demo</a>
    </div>
    <img src="${img.ecohubArch}" alt="EcoHub unified ESG data architecture diagram" loading="lazy" style="width:100%;border-radius:var(--radius-lg)">
  </div>
</div></section>`;
}

function footer() {
  const cols = [
    ['Platform',['Features','Assessment Tool','Request Demo']],
    ['Resources',['Blog & ESG Guides','Webinars','Podcast']],
    ['Company',['About Us','Careers','Privacy Policy','Terms of Service','Data Security']],
    ['Solutions',['VSME Reporting','Enterprise ESG','SME Compliance','Public Sector','Industry Solutions']],
  ];
  return `<footer class="site-footer"><div class="container" style="padding:64px 0 36px">
  <div class="footer-grid">
    <div class="stack" style="gap:18px;max-width:280px">
      ${logo(true)}
      <p style="font-size:var(--fs-sm);line-height:var(--lh-relaxed)">100% AI-powered ESG reporting &mdash; zero manual work, ever. Built for compliance, designed for speed.</p>
      <div class="footer-partners">
        <span><img src="${img.pMs}" alt="Microsoft for Startups" loading="lazy"></span>
        <span><img src="${img.pNv}" alt="NVIDIA Inception Program" loading="lazy"></span>
        <span><img src="${img.pCam}" alt="University of Cambridge CISL" loading="lazy"></span>
      </div>
    </div>
    ${cols.map(([h,ls]) => `<div class="footer-col"><h4>${h}</h4>${ls.map(l=>`<a href="#">${l}</a>`).join('')}</div>`).join('\n    ')}
  </div>
  <div class="footer-bottom">
    <span>&copy; 2025 Triple I &mdash; Insight Impact Innovation Inc.</span>
    <span>131 Continental Dr, Suite 305, Newark, DE 19713, USA &middot; info@triplei.io</span>
  </div>
</div></footer>`;
}

const ORG_LD = JSON.stringify({
  "@context":"https://schema.org","@type":"Organization","name":"Triple I",
  "legalName":"Insight Impact Innovation Inc.","url":"https://triplei.io",
  "description":"100% AI-powered ESG reporting platform. Automate CSRD, ESRS, GRI and ISSB disclosures with zero manual work.",
  "email":"info@triplei.io",
  "address":{"@type":"PostalAddress","streetAddress":"131 Continental Dr, Suite 305","addressLocality":"Newark","addressRegion":"DE","postalCode":"19713","addressCountry":"US"}
});

const PAGE_TYPE = { '/': 'WebPage', '/industries': 'CollectionPage', '/pricing': 'WebPage', '/about': 'AboutPage', '/blog': 'Blog', '/contact': 'ContactPage' };
const PAGE_NAME = { '/industries': 'Industries', '/pricing': 'Pricing', '/about': 'About us', '/blog': 'Blog', '/contact': 'Contact' };

const PAGE_LD = ({ title, desc, path }) => JSON.stringify({
  "@context":"https://schema.org","@type":PAGE_TYPE[path] || 'WebPage',
  "@id":'https://triplei.io' + path + '#page',"url":'https://triplei.io' + path,
  "name":title.replace(/&[a-z]+;/g,''),"description":desc,"inLanguage":"en",
  "isPartOf":{"@type":"WebSite","name":"Triple I","url":"https://triplei.io"},
  "about":{"@type":"Thing","name":"ESG reporting automation"},
  "speakable":{"@type":"SpeakableSpecification","cssSelector":["h1",".hero p",".acc-q",".acc-a"]},
  "primaryImageOfPage":{"@type":"ImageObject","url":"https://triplei.io/assets/img/ecohub-architecture.svg"}
});

const BREADCRUMB_LD = (path) => JSON.stringify({
  "@context":"https://schema.org","@type":"BreadcrumbList",
  "itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://triplei.io/"}]
    .concat(path === '/' ? [] : [{"@type":"ListItem","position":2,"name":PAGE_NAME[path],"item":'https://triplei.io' + path}])
});

const SOFTWARE_LD = JSON.stringify({
  "@context":"https://schema.org","@type":"SoftwareApplication","name":"EcoHub","alternateName":"EcoHub™ by Triple I",
  "applicationCategory":"BusinessApplication","applicationSubCategory":"ESG reporting & sustainability data management",
  "operatingSystem":"Web browser","url":"https://triplei.io",
  "description":"EcoHub ingests raw sustainability data from 100+ connectors, automatically maps and standardizes it, and generates audit-ready ESG reports aligned to CSRD, ESRS, GRI, ISSB, EU Taxonomy and the GHG Protocol (Scope 1, 2 & 3).",
  "featureList":["100% AI-powered ESG automation","Real-time compliance and audit trails","Automated data integration from 100+ connectors","One-click reports in 50+ regulatory formats","Continuous regulatory updates"],
  "publisher":{"@type":"Organization","name":"Triple I","url":"https://triplei.io"},
  "offers":{"@type":"Offer","url":"https://triplei.io/pricing","priceCurrency":"USD","price":"0","availability":"https://schema.org/InStock","description":"Tailored pricing after a short ESG needs assessment. Request a demo to get a quote."}
});

function layout({ title, desc, path, body, active, ld }) {
  const canonical = 'https://triplei.io' + path;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<meta property="og:locale" content="en_US">
<meta name="theme-color" content="#12A02A">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Triple I">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${img.ecohubArch}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${img.ecohubArch.replace('assets','https://triplei.io/assets')}">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/styles.css">
<script type="application/ld+json">${ORG_LD}</script>
<script type="application/ld+json">${PAGE_LD({ title, desc, path })}</script>
<script type="application/ld+json">${BREADCRUMB_LD(path)}</script>
${(path === '/' || path === '/pricing') ? `<script type="application/ld+json">${SOFTWARE_LD}</script>` : ''}
${ld ? `<script type="application/ld+json">${ld}</script>` : ''}
</head>
<body>
${header(active)}
<main>
${body}
</main>
${path === '/contact' ? '' : ctaSection()}
${footer()}
<script src="/assets/app.js" defer></script>
</body>
</html>`;
}

// ---------- page bodies ----------
function homeBody() {
  const features = [
    [fic.ai,'100% AI-Powered ESG Automation','No manual data collection, no consultants &mdash; just AI-driven ESG insights at scale.'],
    [fic.realtime,'Real-Time Compliance & Audits','Automatically align with CSRD, SEC, EU Taxonomy, and more.'],
    [fic.saveMoney,'Save Money & Cut Costs','Eliminate 80% of manual reporting work and reduce compliance staffing needs.'],
    [fic.reportGen,'Automated Report Generation','One-click export of audit-ready reports in 50+ regulatory formats.'],
    [fic.dataInt,'Automated Data Integration','Connects to ADLS, SQL Server, Excel, CSV, invoices-documents & Azure.'],
    [fic.connect,'Guaranteed Data Security','ISO 27001, GDPR & CCPA ready, with regular third-party security audits.'],
  ];
  const steps = [
    ['1','Connect your Data','100+ ready-to-use connectors with ERPs, CRMs, invoices, documents & more &mdash; no coding needed.'],
    ['2','Let the AI do its thing','Our EcoHub automatically organizes your data, detects precise emission factors and aligns with global standards (ESRS, GRI, ISSB & more).'],
    ['3','Generate ESG Reports','Easily generate reports with 80+ sustainability metrics and track your ESG performance.'],
  ];
  const stats = [['1M+','Data Points Processed'],['10K+ hrs','Saved Through Automation'],['450+','Companies Guided'],['95%','Less ESG Workload']];
  const compareRows = ['From Invoices to ESG Report','Automated Data Entry','Auto-Regulatory Updates','One-Click Reporting','Intuitive Self-Service','Instant Deployment'];
  const faq = [
    ['Which ESG frameworks do you support?','CSRD, ESRS, GRI, ISSB, EU Taxonomy, SEC, GHG Protocol (Scope 1, 2 & 3) and more &mdash; with continuous regulatory updates.'],
    ['Do I need ESG or technical expertise to use the platform?','No. Our AI handles data mapping, classification and framework alignment &mdash; no manual data entry, consultants, or custom coding required.'],
    ['Is this suitable for small and mid-sized businesses, or just enterprises?','Both. Triple I scales from early-stage SMEs and NGOs to multinational public companies.'],
    ['Can I export the data or integrate with other tools?','Yes &mdash; export audit-ready reports in 50+ formats, and connect via API, ADLS, SQL Server, Excel, CSV and Azure.'],
    ["What industries does Triple I support?","Our AI adapts to any industry&rsquo;s ESG needs &mdash; from fintech and SaaS to manufacturing, government and NGOs."],
  ];
  const industries = [
    [iic.growth,'Growth-Minded Small & Mid-Sized Firms',['Pre-IPO ESG framework development','Investor-ready sustainability disclosures']],
    [iic.impact,'High-Impact Industries',['CSRD/ESRS compliance automation','Multinational ESG data consolidation']],
    [iic.gov,'Government & Cities',['Smart city sustainability dashboards','Managing complex ESG data']],
    [iic.ngo,'ESG for NGOs',['NGO impact measurement & reporting','Sustainable supply chain certification']],
    [iic.vsme,'VSME Ready',['Pre-IPO ESG framework development','Investor-ready sustainability disclosures']],
  ];
  return `
<section class="bg-hero"><div class="container hero">
  <span class="badge"><span class="dot"></span>Zero Manual Work. Ever.</span>
  <h1 class="display">100% AI-Powered ESG Reporting &mdash;<br><span class="accent">Zero Manual Work.</span> Ever.</h1>
  <p class="lead">An all-in-one AI platform built to simplify sustainability, empower teams, and turn compliance into competitive advantage.</p>
  <div class="hero-actions">
    <a class="btn btn-primary btn-lg" href="/contact">Request a demo</a>
    <a class="btn btn-outline btn-lg" href="/pricing">See pricing</a>
  </div>
  <div class="hero-media">
    <img src="${img.ecohubFlow}" alt="EcoHub data flow: connectors to AI to ESG reports" width="2948" height="1228" fetchpriority="high" style="width:100%;height:auto;display:block">
  </div>
</div></section>

<div class="container" style="padding-top:var(--section-y)">
  <div class="card ink stack-md cta-band">
    <div class="stack" style="gap:14px;align-items:flex-start">
      <span class="eyebrow" style="color:var(--green-300)">Don&rsquo;t Know Where to Start?</span>
      <h2 class="h1 cta-band-title" style="color:#fff">Read Triple I&rsquo;s Method to create tailored roadmap for your organization</h2>
    </div>
    <div class="stack" style="gap:12px">
      <a class="btn btn-primary btn-lg" href="/contact">Download ESG White Paper</a>
    </div>
  </div>
</div>

<section class="container section">
  <div class="section-head center"><span class="eyebrow center">The Platform</span><h2 class="h1" style="margin-top:12px">Simplified data management. Smarter, faster, better.</h2></div>
  <img src="${img.worldMap}" alt="Triple I — trusted worldwide, ESG data points across the globe" loading="lazy" style="width:100%;border-radius:var(--radius-xl);box-shadow:var(--shadow-md)">
</section>

<section class="bg-subtle"><div class="container section">
  <div class="section-head center"><span class="eyebrow center">How it Works</span><h2 class="h1" style="margin-top:12px">From raw data to audit-ready report</h2></div>
  <div class="grid grid-3">
    ${steps.map(([n,t,b]) => `<div class="card" style="padding:var(--space-8);border-radius:var(--radius-xl)"><span class="step-num">${n}</span><h3>${t}</h3><p>${b}</p></div>`).join('\n    ')}
  </div>
</div></section>

<section class="container" style="padding-block:var(--section-y)">
  <div class="stats-panel">
    <img class="bgmap" src="${img.worldMap}" alt="" aria-hidden="true" loading="lazy">
    <div class="inner">
      <h2 class="h1">Built for Compliance. Designed for Speed. Trusted Worldwide.</h2>
      <div class="grid grid-4">
        ${stats.map(([n,l]) => `<div class="stat"><div class="num">${n}</div><div class="lbl">${l}</div></div>`).join('\n        ')}
      </div>
    </div>
  </div>
</section>

<section class="container section">
  <div class="stack-md split-2">
    <div class="stack" style="gap:var(--space-5);align-items:flex-start">
      <span class="eyebrow">Why Choose Us?</span>
      <h2 class="h1">A paradigm shift in sustainability management</h2>
      <p class="lead">Our AI-powered platform automates your entire ESG workflow &mdash; from data collection to reporting &mdash; with zero manual work. No complex setups: connect your systems and get instant, accurate insights.</p>
      <a class="btn btn-primary btn-lg" href="/contact">Request a demo</a>
    </div>
    <div class="compare" style="border-radius:var(--radius-xl)">
      <div class="cmp-row">
        <div></div>
        <div style="padding:18px 12px;text-align:center;font-size:var(--fs-sm);font-weight:700;color:var(--text-muted);border-left:1px solid var(--border-subtle)">Other Companies</div>
        <div style="padding:18px 12px;text-align:center;font-size:var(--fs-sm);font-weight:800;color:var(--brand-press);background:var(--green-50)">Triple I</div>
      </div>
      ${compareRows.map(r => `<div class="cmp-row bordered"><div style="padding:15px 22px;font-size:var(--fs-sm);font-weight:600">${r}</div><div style="padding:15px 12px;display:flex;justify-content:center;border-left:1px solid var(--border-subtle)">${cross}</div><div style="padding:15px 12px;display:flex;justify-content:center;background:var(--green-50)">${check()}</div></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="bg-subtle"><div class="container section" id="benefits">
  <div class="section-head center"><span class="eyebrow center">The Benefits</span><h2 class="h1" style="margin-top:12px">Why Triple I Stands Out</h2></div>
  <div class="grid grid-3">
    ${features.map(([ic,t,b],i) => `<div class="card hover${i===0?' mint':''}"><span class="icon-tile"><img src="${ic}" alt="" loading="lazy"></span><h3>${t}</h3><p>${b}</p></div>`).join('\n    ')}
  </div>
</div></section>

<section class="container section">
  <div class="section-head center"><span class="eyebrow center">Industries</span><h2 class="h1" style="margin-top:12px">Powering compliance & sustainability across every sector</h2></div>
  <div class="grid grid-3">
    ${industries.map(([ic,t,pts]) => `<div class="card hover"><span class="icon-tile"><img src="${ic}" alt="" loading="lazy"></span><h3 style="font-size:var(--fs-h4)">${t}</h3><ul style="display:flex;flex-direction:column;gap:8px;flex:1">${pts.map(p=>`<li style="display:flex;gap:8px;font-size:var(--fs-sm);color:var(--text-muted)"><span class="accent">&bull;</span>${p}</li>`).join('')}</ul><a href="/industries" style="font-size:var(--fs-sm);font-weight:700;color:var(--text-link)">Learn More &rarr;</a></div>`).join('\n    ')}
    <div class="card ink" style="justify-content:center"><h3 style="font-size:var(--fs-h4)">Don&rsquo;t See your Sector?</h3><p>Our AI adapts to any industry&rsquo;s ESG needs.</p><a href="/industries" style="font-size:var(--fs-sm);font-weight:700;color:var(--green-300)">Learn More &rarr;</a></div>
  </div>
</section>

<section class="container" style="padding-block:var(--space-16);padding-top:var(--space-16);padding-bottom:var(--space-16);text-align:center">
  <h3 style="font-size:var(--fs-h3);margin-bottom:var(--space-8)">Triple I is Certified</h3>
  <div class="cert-strip">${certs.map(c=>`<img src="${c.src}" alt="ESG certification" loading="lazy">`).join('')}</div>
</section>

<section class="bg-subtle"><div class="container section faq-split" data-faq-wrap>
  <div class="stack" style="gap:var(--space-5);align-items:flex-start;position:sticky;top:100px">
    <span class="eyebrow">FAQ</span>
    <h2 class="h1">Any Questions? We&rsquo;ve Got you Covered</h2>
    <p class="muted" style="line-height:var(--lh-relaxed)">Our platform automates every step of the ESG journey &mdash; from data ingestion and classification to framework alignment, reporting, and insight generation.</p>
    <a class="btn btn-primary" href="/contact">Request a demo</a>
  </div>
  <div class="acc">
    ${faq.map(([q,a]) => `<div class="acc-item"><button class="acc-q"><span>${q}</span><span class="acc-icon">+</span></button><div class="acc-a">${a}</div></div>`).join('\n    ')}
  </div>
</div></section>`;
}

const FAQ_LD = (items) => JSON.stringify({
  "@context":"https://schema.org","@type":"FAQPage",
  "mainEntity": items.map(([q,a]) => ({"@type":"Question","name":q.replace(/&[a-z]+;/g,''),"acceptedAnswer":{"@type":"Answer","text":a.replace(/&[a-z]+;/g,'')}}))
});

const HOME_FAQ = [
  ['Which ESG frameworks do you support?','CSRD, ESRS, GRI, ISSB, EU Taxonomy, SEC, GHG Protocol (Scope 1, 2 & 3) and more — with continuous regulatory updates.'],
  ['Do I need ESG or technical expertise to use the platform?','No. Our AI handles data mapping, classification and framework alignment — no manual data entry, consultants, or custom coding required.'],
  ['Is this suitable for small and mid-sized businesses, or just enterprises?','Both. Triple I scales from early-stage SMEs and NGOs to multinational public companies.'],
  ['Can I export the data or integrate with other tools?','Yes — export audit-ready reports in 50+ formats, and connect via API, ADLS, SQL Server, Excel, CSV and Azure.'],
  ['What industries does Triple I support?','Our AI adapts to any industry ESG needs — from fintech and SaaS to manufacturing, government and NGOs.'],
];

// ---------- Industries ----------
function industriesBody() {
  const sectors = [
    [iic.growth,'Growth-Minded Small & Mid-Sized Firms','Pre-IPO ESG framework development and investor-ready sustainability disclosures &mdash; built for teams that need to move fast without a consultant.',['Pre-IPO','VSME','Investor-ready']],
    [iic.impact,'High-Impact Industries','CSRD/ESRS compliance automation for public companies, plus multinational ESG data consolidation and reporting across regions.',['CSRD','ESRS','Multinational']],
    [iic.gov,'Government & Cities','Smart-city sustainability dashboards and tooling for managing complex, multi-source ESG data at the public-sector scale.',['Public sector','Dashboards']],
    [iic.ngo,'ESG for NGOs','NGO impact measurement and reporting, plus sustainable supply-chain certification &mdash; tailored pricing for mission-driven organizations.',['Impact','Supply chain']],
    [iic.vsme,'VSME Ready','The voluntary SME standard, automated. Get disclosure-ready with framework support designed for smaller reporters.',['VSME','SME']],
  ];
  return `
<section class="bg-hero"><div class="container page-hero">
  <span class="eyebrow">Industries we serve</span>
  <h1 class="display">Powering compliance & sustainability across every sector</h1>
  <p class="lead" style="max-width:720px">From startups to multinationals, governments to NGOs &mdash; our AI adapts to any industry&rsquo;s ESG needs.</p>
  <a class="btn btn-primary btn-lg" href="/contact" style="margin-top:8px">Request a demo</a>
</div></section>

<section class="container section">
  <div class="grid grid-2">
    ${sectors.map(([ic,t,b,tags]) => `<div class="sector"><span class="icon-tile" style="width:64px;height:64px;border-radius:var(--radius-lg)"><img src="${ic}" alt="" loading="lazy" style="width:36px;height:36px"></span><div class="stack" style="gap:12px"><h3>${t}</h3><p class="muted" style="line-height:var(--lh-relaxed)">${b}</p><div class="flex wrap gap-3">${tags.map(x=>`<span class="chip">${x}</span>`).join('')}</div></div></div>`).join('\n    ')}
    <div class="card ink" style="justify-content:center;padding:var(--space-8);border-radius:var(--radius-xl)"><h3>Don&rsquo;t See your Sector?</h3><p style="line-height:var(--lh-relaxed)">Our AI adapts to any industry&rsquo;s ESG needs. Tell us about your data and we&rsquo;ll map a path.</p><a class="btn btn-primary" href="/contact">Talk to an ESG Expert</a></div>
  </div>
</section>

<section class="bg-subtle"><div class="container" style="padding-block:var(--space-16);text-align:center">
  <span class="eyebrow center">Compliance, covered</span>
  <h2 class="h2" style="margin-top:12px;margin-bottom:var(--space-10)">Aligned with every major framework</h2>
  <div class="cert-strip">${certs.map(c=>`<img src="${c.src}" alt="ESG certification" loading="lazy">`).join('')}</div>
</div></section>`;
}

// ---------- Pricing ----------
function pricingBody() {
  const C = {
    cols:['Small','Medium','Large'],
    rows:[
      ['AI-powered reporting automation',1,1,1],['Standard frameworks (CSRD, GRI, ESRS)',1,1,1],
      ['Real-time dashboards',1,1,1],['Scope 1 & 2 Emissions',1,1,1],['Scope 3 Emissions',0,1,1],
      ['Up to 10 data sources',0,1,1],['Custom framework support',0,1,1],['Dedicated onboarding manager',0,1,1],
      ['Role-based access controls',0,1,1],['Unlimited data sources',0,0,1],['API access + custom modules',0,0,1],
      ['Advanced analytics & dashboards',0,0,1],['Priority SLA & ISO27001, GDPR',0,0,1],['White-label options (optional)',0,0,1],
    ],
  };
  const plans = [
    [pic.small,'Small Organizations','&lt; 250 employees or limited ESG scope',['Startups and small companies','NGOs or nonprofits','Early-stage ESG reporters'],['AI-powered reporting automation','Standard frameworks (CSRD, GRI, ESRS)','Real-time dashboards','Up to 3 data sources','Email-based support'],false],
    [pic.medium,'Medium-Sized Organizations','250&ndash;999 employees or moderate data complexity',['Growth-stage companies','Pre-IPO firms preparing disclosures','Multi-department ESG teams'],['Everything in Small Org','Scope 3 emissions','Up to 10 data sources','Custom framework support','Dedicated onboarding manager','Role-based access controls'],true],
    [pic.large,'Large Organizations','1000+ employees or high-volume ESG operations',['Public & listed enterprises','Multinational groups or holdings','Municipalities & regulated entities'],['Unlimited data sources','Full Scope 1, 2, 3 coverage','API access + custom modules','Advanced analytics and dashboards','Priority enterprise SLA & ISO27001','White-label options (optional)'],false],
  ];
  const faq = [
    ['How is pricing determined?','Pricing reflects the complexity, data volume, and compliance needs of your organization &mdash; the number of data sources, frameworks, and emission scopes you need.'],
    ['Why don&rsquo;t you list exact prices?','Every ESG program is different. We tailor scope and support to your organization, so we quote after a short needs assessment rather than listing a one-size-fits-all price.'],
    ['Is there a free trial?','Yes &mdash; small organizations can start with a free trial to explore AI-powered reporting before committing.'],
    ['Can we switch between plans later?','Absolutely. Plans scale with you as your data sources, teams, and disclosure requirements grow.'],
    ['Do you offer public sector or NGO pricing?','Yes. We offer tailored pricing for governments, municipalities, public agencies, and NGOs.'],
    ['Do you offer white-label or API integrations?','API access and white-label options are available on the Large Organizations plan.'],
  ];
  return `
<section class="bg-hero"><div class="container page-hero">
  <span class="eyebrow">Pricing</span>
  <h1 class="display">Choose the ESG Plan Built for Your Organization&rsquo;s Scale</h1>
  <p class="lead" style="max-width:720px">Our pricing reflects the complexity, data volume, and compliance needs of your organization. Whether you&rsquo;re just getting started or managing disclosures across regions, Triple I grows with you.</p>
</div></section>

<section class="container" style="padding-bottom:var(--section-y);margin-top:calc(-1 * var(--space-8))">
  <div class="grid grid-3" style="align-items:stretch">
    ${plans.map(([ic,name,scope,ideal,inc,feat]) => `<div class="plan${feat?' featured':''}">${feat?'<span class="tag">Most popular</span>':''}<span class="picon"><img src="${ic}" alt="" loading="lazy"></span><div><h3 style="font-weight:800">${name}</h3><p class="scope">${scope}</p></div><div><p class="label">Ideal for</p><ul style="display:flex;flex-direction:column;gap:4px;padding-left:18px;list-style:disc">${ideal.map(x=>`<li style="font-size:var(--fs-sm)">${x}</li>`).join('')}</ul></div><ul class="feat"><li style="display:block"><p class="label" style="margin-bottom:0">Included</p></li>${inc.map(x=>`<li>${planCk}<span>${x}</span></li>`).join('')}</ul><a class="btn ${feat?'btn-primary':'btn-outline'} btn-full" href="/contact" style="margin-top:auto">Let&rsquo;s Talk</a></div>`).join('\n    ')}
  </div>
</section>

<section class="bg-subtle"><div class="container section">
  <div class="section-head center"><span class="eyebrow center">Compare</span><h2 class="h1" style="margin-top:12px">Compare Plans & Features</h2></div>
  <div class="compare">
    <div class="thead"><div>The Benefits</div><div>Small</div><div class="hl">Medium</div><div>Large</div></div>
    ${C.rows.map(r => `<div class="trow"><div class="lbl">${r[0]}</div><div class="cell">${r[1]?check():cross}</div><div class="cell hl">${r[2]?check():cross}</div><div class="cell">${r[3]?check():cross}</div></div>`).join('\n    ')}
  </div>
</div></section>

<section class="container section center">
  <div class="card ink" style="border-radius:var(--radius-2xl);padding:clamp(36px,5vw,64px);align-items:center;gap:var(--space-5)">
    <h2 class="h1" style="color:#fff;max-width:640px">Still unsure which plan fits your organization best?</h2>
    <p style="color:rgba(255,255,255,.7);font-size:var(--fs-lg);max-width:560px">Let us assess your ESG needs and recommend the right path forward.</p>
    <div class="hero-actions"><a class="btn btn-primary btn-lg" href="/contact">Download ESG White Paper</a><a class="btn btn-ghost-light btn-lg" href="/contact">Talk to an ESG Expert</a></div>
  </div>
</section>

<section class="container section" style="padding-top:0">
  <div class="section-head center"><span class="eyebrow center">FAQ</span><h2 class="h1" style="margin-top:12px">Frequently Asked Questions</h2></div>
  <div class="acc" style="max-width:860px;margin:0 auto">
    ${faq.map(([q,a]) => `<div class="acc-item"><button class="acc-q"><span>${q}</span><span class="acc-icon">+</span></button><div class="acc-a">${a}</div></div>`).join('\n    ')}
  </div>
</section>`;
}

// ---------- About ----------
function aboutBody() {
  const steps = [
    [img.m1,'Upload or connect your ESG-related data in any format.'],
    [img.m2,'Let our AI map and standardize it using our sustainability core technology, EcoHub.'],
    [img.m3,'Instantly generate compliance-ready ESG reports tailored to your organization&rsquo;s needs.'],
  ];
  const mission = [
    [img.m1,'Sustainability is a Competitive Advantage','We believe being sustainable isn&rsquo;t just the right thing to do, it&rsquo;s smart business. We give companies the tools to turn ESG performance into a strategic edge &mdash; building trust with investors, regulators, and customers.'],
    [img.m2,'Build for What&rsquo;s Next','We design for evolving regulation, so your reporting stays compliant as standards change &mdash; without re-tooling every year.'],
    [img.m3,'Clarity Over Complexity','ESG data can be messy. We make it make sense. From carbon emissions to HR metrics, we bring structure and simplicity to sustainability reporting.'],
    [img.m4,'Time is Impact','Manual ESG reporting takes time you can&rsquo;t afford to lose. Our AI automates the heavy lifting, so your team can focus on driving real impact.'],
  ];
  const trust = [
    ['Proven Track Record','We&rsquo;ve successfully guided over 450 companies &mdash; from startups to large enterprises &mdash; in streamlining their ESG reporting.'],
    ['AI-Driven Accuracy','Our platform leverages cutting-edge AI, ensuring data integrity and regulatory compliance with the latest ESG standards.'],
    ['Global Standards Alignment','Stay current with the EU CSRD and other major frameworks, thanks to our continuous updates.'],
    ['Dedicated Support','Our sustainability experts provide hands-on guidance at every step, maximizing both compliance and impact.'],
  ];
  const tests = [
    ['We used to spend weeks pulling together ESG data from different departments. With Triple I, it&rsquo;s now just a few clicks. The platform makes everything clearer, faster, and actually kind of enjoyable.','Alan K.','CFO, Xapture Inc.'],
    ['We didn&rsquo;t have time to learn every ESG standard. Triple I handled it for us &mdash; mapping the data, aligning it, and saving us weeks of work.','Jessie R.','Co-founder, CupPap'],
  ];
  return `
<section class="bg-hero"><div class="container page-hero">
  <span class="eyebrow">About us</span>
  <h1 class="display">Helping the World Measure What Matters</h1>
  <p class="lead" style="max-width:720px">We&rsquo;re a global team of sustainability experts, data engineers, and AI innovators on a mission to make ESG reporting simple, reliable, and impactful.</p>
  <a class="btn btn-primary btn-lg" href="/contact" style="margin-top:8px">Request a demo</a>
  <img src="${img.aboutHero}" alt="The Triple I team and platform" loading="lazy" style="width:100%;max-width:900px;margin-top:var(--space-8);border-radius:var(--radius-xl);box-shadow:var(--shadow-lg)">
</div></section>

<section class="container section">
  <div class="stack-md split-2 gap-12">
    <h2 class="h2">Powered by our core platform, EcoHub&trade;, Triple I automates the transformation of raw ESG data into compliance-ready reports.</h2>
    <p class="lead">We&rsquo;re not just building ESG software. We&rsquo;re helping organizations lead with clarity, meet regulatory expectations, and build a competitive edge through responsible reporting &mdash; across emissions, HR, and governance.</p>
  </div>
</section>

<section class="bg-subtle"><div class="container section">
  <div class="section-head center"><span class="eyebrow center">How Triple I Works</span><h2 class="h1" style="margin-top:12px">Three steps to full alignment with global standards</h2></div>
  <div class="grid grid-3">
    ${steps.map(([im,t],i) => `<div class="card" style="padding:0;overflow:hidden;border-radius:var(--radius-xl)"><img src="${im}" alt="" loading="lazy" style="width:100%;height:200px;object-fit:cover"><div style="padding:var(--space-6);display:flex;gap:12px;align-items:flex-start"><span style="flex:0 0 auto;width:30px;height:30px;border-radius:50%;background:var(--green-100);color:var(--brand-press);display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:var(--fs-sm)">${i+1}</span><p style="color:var(--text-body);line-height:var(--lh-relaxed)">${t}</p></div></div>`).join('\n    ')}
  </div>
</div></section>

<section class="container" style="padding-block:var(--space-16);text-align:center">
  <h3 style="font-size:var(--fs-h3);margin-bottom:var(--space-8)">Triple I is Certified</h3>
  <div class="cert-strip">${certs.map(c=>`<img src="${c.src}" alt="ESG certification" loading="lazy">`).join('')}</div>
</section>

<section class="bg-subtle"><div class="container section">
  <div class="section-head center"><span class="eyebrow center">Our Mission</span><h2 class="h1" style="margin-top:12px">What drives us every day</h2></div>
  <div class="stack" style="gap:var(--space-8)">
    ${mission.map(([im,t,b],i) => `<div class="stack-md mission-row split-2 gap-12"><img src="${im}" alt="" loading="lazy" style="width:100%;border-radius:var(--radius-xl);box-shadow:var(--shadow-md);order:${i%2?2:1}"><div class="stack" style="gap:var(--space-4);order:${i%2?1:2}"><h3 class="h2">${t}</h3><p class="lead">${b}</p></div></div>`).join('\n    ')}
  </div>
</div></section>

<section class="container section">
  <div class="section-head center"><span class="eyebrow center">Why Trust Us?</span><h2 class="h1" style="margin-top:12px">Proven, accurate, and always aligned</h2></div>
  <div class="grid grid-4">
    ${trust.map(([t,b],i) => `<div class="card"><span style="font-family:var(--font-display);font-weight:800;font-size:var(--fs-h2);color:var(--brand)">${String(i+1).padStart(2,'0')}</span><h3 style="font-size:var(--fs-h4)">${t}</h3><p style="font-size:var(--fs-sm);color:var(--text-muted);line-height:var(--lh-relaxed)">${b}</p></div>`).join('\n    ')}
  </div>
</section>

<section class="bg-subtle"><div class="container section">
  <div class="section-head center"><span class="eyebrow center">Testimonials</span><h2 class="h1" style="margin-top:12px">Things we help you with every day</h2><p class="muted" style="margin-top:12px">Triple I helps businesses reduce ESG workload by 95% and stay ahead of compliance without the chaos.</p></div>
  <div class="grid grid-2">
    ${tests.map(([q,n,r]) => `<figure class="card" style="margin:0;gap:var(--space-5)"><span aria-hidden="true" style="font-family:var(--font-display);font-weight:800;font-size:48px;line-height:.6;color:var(--green-300);height:26px">&ldquo;</span><blockquote style="margin:0;font-size:var(--fs-lg);line-height:var(--lh-relaxed);color:var(--text-body)">${q}</blockquote><figcaption class="flex items-center gap-3" style="margin-top:auto"><span style="width:44px;height:44px;border-radius:50%;background:var(--green-100);color:var(--green-700);display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-family:var(--font-display)">${n[0]}</span><span class="stack"><span style="font-weight:700;color:var(--text-strong)">${n}</span><span style="font-size:var(--fs-sm);color:var(--text-muted)">${r}</span></span></figcaption></figure>`).join('\n    ')}
  </div>
</div></section>

<section class="container section">
  <div class="bg-hero" style="border:1px solid var(--border-subtle);border-radius:var(--radius-2xl);padding:clamp(36px,5vw,72px);text-align:center;display:flex;flex-direction:column;align-items:center;gap:var(--space-5)">
    <span class="eyebrow center">We&rsquo;re Hiring!</span>
    <h2 class="h1" style="max-width:640px">Join Our Global Team</h2>
    <p class="lead" style="max-width:560px">Want to build the future of ESG with us? We&rsquo;re always open to passionate minds.</p>
    <a class="btn btn-primary btn-lg" href="/contact">Apply</a>
  </div>
</section>`;
}

// ---------- Blog ----------
function blogBody() {
  const posts = [
    ['CSRD','CSRD in 2025: What every reporting team needs to know','6 min read','Jun 2, 2025'],
    ['Emissions','Scope 3 made simple: turning invoices into emission factors','8 min read','May 21, 2025'],
    ['VSME','The VSME standard explained for small & mid-sized firms','5 min read','May 9, 2025'],
    ['AI','How AI cuts ESG reporting workload by 95%','7 min read','Apr 28, 2025'],
    ['Frameworks','GRI vs ESRS vs ISSB: choosing the right disclosure path','9 min read','Apr 14, 2025'],
    ['Guides','From data chaos to audit-ready: the EcoHub workflow','6 min read','Apr 1, 2025'],
  ];
  const tone = {CSRD:'',Emissions:'badge-amber',VSME:'badge-neutral',AI:'',Frameworks:'badge-amber',Guides:'badge-neutral'};
  const f = posts[0], rest = posts.slice(1);
  return `
<section class="bg-hero"><div class="container page-hero">
  <span class="eyebrow">Blog & ESG Guides</span>
  <h1 class="display">Insight. Impact. Innovation.</h1>
  <p class="lead" style="max-width:720px">Practical guidance on CSRD, ESRS, emissions and the frameworks shaping sustainability reporting.</p>
</div></section>

<section class="container section" style="padding-top:var(--space-12)">
  <a href="#" style="display:block;margin-bottom:var(--space-12)">
    <div class="stack-md" style="display:grid;grid-template-columns:1.1fr .9fr;gap:var(--space-10);align-items:center;background:#fff;border:1px solid var(--border-subtle);border-radius:var(--radius-2xl);padding:clamp(20px,3vw,32px);box-shadow:var(--shadow-sm)">
      <div class="bg-hero" style="aspect-ratio:16/10;border-radius:var(--radius-xl);border:1px solid var(--border-subtle);display:flex;align-items:flex-end;padding:22px"><span class="badge ${tone[f[0]]}">${f[0]}</span></div>
      <div class="stack" style="gap:16px;align-items:flex-start"><span class="eyebrow">Featured</span><h2 class="h2">${f[1]}</h2><p class="muted" style="line-height:var(--lh-relaxed)">A practical breakdown of what&rsquo;s changing, who&rsquo;s in scope, and how to prepare your reporting team for the next disclosure cycle.</p><span style="font-size:var(--fs-sm);color:var(--text-faint)">${f[3]} &middot; ${f[2]}</span><span class="btn btn-outline">Read article</span></div>
    </div>
  </a>
  <div class="grid grid-3">
    ${rest.map((p,i) => `<a href="#" class="post"><div class="thumb ${i%2?'bg-mint':'bg-hero'}"><span class="badge ${tone[p[0]]}">${p[0]}</span></div><div class="body"><h3>${p[1]}</h3><span class="meta">${p[3]} &middot; ${p[2]}</span></div></a>`).join('\n    ')}
  </div>
  <div class="stack-md" style="margin-top:var(--space-16);display:grid;grid-template-columns:1.2fr .8fr;gap:var(--space-8);align-items:center;background:var(--ink-900);color:#fff;border-radius:var(--radius-2xl);padding:clamp(28px,4vw,48px)">
    <div class="stack" style="gap:12px;align-items:flex-start"><h2 class="h2" style="color:#fff">Get ESG insights in your inbox</h2><p style="color:rgba(255,255,255,.7)">Monthly guidance on frameworks, deadlines, and automation &mdash; no spam.</p></div>
    <form class="flex gap-3" onsubmit="return false"><input placeholder="you@company.com" aria-label="Email address" style="flex:1;padding:13px 16px;border-radius:var(--radius-pill);border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font-size:var(--fs-md);outline:none"><button class="btn btn-primary" type="submit">Subscribe</button></form>
  </div>
</section>`;
}

// ---------- Contact ----------
function contactBody() {
  const points = ['A 30-minute personalized walkthrough of EcoHub','A tailored ESG needs assessment for your organization','Answers on frameworks, data sources & pricing'];
  return `
<section class="bg-hero"><div class="container" style="padding-top:clamp(48px,5vw,80px);padding-bottom:var(--space-12)">
  <div class="stack-md split-2 align-start">
    <div class="stack" style="gap:var(--space-5);align-items:flex-start;padding-top:var(--space-6)">
      <span class="eyebrow">Contact us</span>
      <h1 class="display">Request a demo</h1>
      <p class="lead">See how Triple I turns your raw data into audit-ready ESG reports &mdash; with zero manual work. Book a session with our team.</p>
      <ul class="list-check">${points.map(p=>`<li><span class="ck">${ckSmall}</span>${p}</li>`).join('')}</ul>
      <div class="stack" style="gap:6px;margin-top:var(--space-6);font-size:var(--fs-sm);color:var(--text-muted)"><strong style="color:var(--text-strong)">info@triplei.io</strong><span>131 Continental Dr, Suite 305, Newark, DE 19713, USA</span></div>
    </div>
    <div class="form-card" style="background:#fff;border:1px solid var(--border-subtle);border-radius:var(--radius-2xl);box-shadow:var(--shadow-lg);padding:clamp(24px,3vw,40px)">
      <form data-demo-form class="stack" style="gap:var(--space-5)">
        <div class="grid grid-2" style="gap:var(--space-4)"><div class="field"><label for="fn">First name</label><input id="fn" required placeholder="Jane"></div><div class="field"><label for="ln">Last name</label><input id="ln" required placeholder="Cooper"></div></div>
        <div class="field"><label for="em">Work email</label><input id="em" type="email" required placeholder="you@company.com"></div>
        <div class="grid grid-2" style="gap:var(--space-4)"><div class="field"><label for="co">Company</label><input id="co" placeholder="Acme Inc."></div><div class="field"><label for="sz">Company size</label><input id="sz" placeholder="250–999"></div></div>
        <div class="field"><label for="msg">What are you hoping to achieve?</label><textarea id="msg" rows="4" placeholder="Tell us about your ESG reporting needs…"></textarea></div>
        <button class="btn btn-primary btn-lg btn-full" type="submit">Request a demo</button>
        <p style="font-size:var(--fs-xs);color:var(--text-faint);text-align:center">By submitting, you agree to our Privacy Policy. We reply within one business day.</p>
      </form>
    </div>
  </div>
</div></section>`;
}

const PAGES = [
  { path:'/', file:'index.html', active:'/', title:'Triple I — 100% AI-Powered ESG Reporting, Zero Manual Work',
    desc:'Triple I is an all-in-one AI platform that automates ESG reporting end to end — zero manual work. CSRD, ESRS, GRI & ISSB aligned. Powered by EcoHub.',
    body:homeBody(), ld:FAQ_LD(HOME_FAQ) },
  { path:'/industries', file:'industries.html', active:'/industries', title:'Industries We Serve — ESG for Every Sector | Triple I',
    desc:'AI-powered ESG compliance for SMEs, high-impact industries, governments, NGOs and VSME reporters. Triple I adapts to any sector’s sustainability needs.',
    body:industriesBody() },
  { path:'/pricing', file:'pricing.html', active:'/pricing', title:'Pricing — ESG Plans That Scale With You | Triple I',
    desc:'Plans for Small, Medium and Large organizations. Compare AI-powered ESG reporting features and find the right fit. Tailored pricing — talk to an ESG expert.',
    body:pricingBody() },
  { path:'/about', file:'about.html', active:'/about', title:'About Triple I — Helping the World Measure What Matters',
    desc:'Triple I is a global team of sustainability, data and AI experts making ESG reporting simple, reliable and impactful — powered by our EcoHub platform.',
    body:aboutBody() },
  { path:'/blog', file:'blog.html', active:'/blog', title:'Blog & ESG Guides — Insight. Impact. Innovation. | Triple I',
    desc:'Practical guidance on CSRD, ESRS, Scope 3 emissions, VSME and the frameworks shaping sustainability reporting. ESG insights from the Triple I team.',
    body:blogBody() },
  { path:'/contact', file:'contact.html', active:'/contact', title:'Request a Demo — Talk to an ESG Expert | Triple I',
    desc:'Book a 30-minute walkthrough of EcoHub and get a tailored ESG needs assessment. See how Triple I automates audit-ready reporting with zero manual work.',
    body:contactBody() },
];

globalThis.__TI_BUILD = { PAGES, layout };

