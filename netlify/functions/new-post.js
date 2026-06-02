const https = require('https');
const crypto = require('crypto');

// ── Entry point ──────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method not allowed' });
  }

  // Validate webhook signature from babylovegrowth
  const secret = process.env.WEBHOOK_SECRET;
  if (secret) {
    const sig = event.headers['x-webhook-signature'] || event.headers['x-hub-signature-256'] || '';
    const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(event.body).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return respond(401, { error: 'Invalid webhook signature' });
    }
  }

  let post;
  try {
    post = JSON.parse(event.body);
  } catch {
    return respond(400, { error: 'Invalid JSON body' });
  }

  // Require at minimum a title and content
  if (!post.title || !post.content) {
    return respond(400, { error: 'Missing required fields: title, content' });
  }

  const slug = post.slug || slugify(post.title);
  const filePath = `noticias/${slug}/index.html`;
  const html = buildPostHTML(post, slug);

  try {
    await commitToGitHub(filePath, html, `Auto-publish: ${post.title}`);
    return respond(200, { success: true, url: `https://onlinecasinolatino.com/noticias/${slug}/` });
  } catch (err) {
    console.error('GitHub commit failed:', err.message);
    return respond(500, { error: err.message });
  }
};

// ── HTML generator ────────────────────────────────────────────────────────────
function buildPostHTML(post, slug) {
  const date = new Date(post.date || Date.now());
  const dateDisplay = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const dateISO = date.toISOString().split('T')[0];
  const category = post.category || 'Noticias';
  const excerpt = post.excerpt || post.title;

  const ldJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: excerpt,
    datePublished: dateISO,
    dateModified: dateISO,
    author: { '@type': 'Organization', name: 'Online Casino Latino', url: 'https://onlinecasinolatino.com' },
    publisher: { '@type': 'Organization', name: 'Online Casino Latino', url: 'https://onlinecasinolatino.com' },
    mainEntityOfPage: `https://onlinecasinolatino.com/noticias/${slug}/`
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="index, follow" />
  <title>${esc(post.title)} | Online Casino Latino</title>
  <meta name="description" content="${esc(excerpt)}" />
  <link rel="canonical" href="https://onlinecasinolatino.com/noticias/${slug}/" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${esc(post.title)}" />
  <meta property="og:description" content="${esc(excerpt)}" />
  <meta property="og:url" content="https://onlinecasinolatino.com/noticias/${slug}/" />
  <script type="application/ld+json">${ldJson}</script>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>

<div class="topbar"><div class="container">
  <span>🌎 Noticias de casinos online para América Latina</span>
  <div><span class="age-gate">+18</span><a href="/juego-responsable/">Juego Responsable</a></div>
</div></div>

<header><div class="container"><div class="header-inner">
  <a href="/" class="logo">Online Casino<span> Latino</span></a>
  <nav aria-label="Navegación principal"><ul>
    <li><a href="/">Inicio</a></li>
    <li><a href="/casinos/">Casinos</a></li>
    <li><a href="/bonos/">Bonos</a></li>
    <li class="nav-dropdown"><a href="/#paises">Países</a><ul class="dropdown-menu">
      <li><a href="/argentina/">🇦🇷 Argentina</a></li>
      <li><a href="/mexico/">🇲🇽 México</a></li>
      <li><a href="/colombia/">🇨🇴 Colombia</a></li>
      <li><a href="/chile/">🇨🇱 Chile</a></li>
      <li><a href="/peru/">🇵🇪 Perú</a></li>
      <li><a href="/venezuela/">🇻🇪 Venezuela</a></li>
      <li><a href="/ecuador/">🇪🇨 Ecuador</a></li>
    </ul></li>
    <li><a href="/pagos/">Pagos</a></li>
    <li><a href="/juegos/">Juegos Gratis</a></li>
    <li><a href="/noticias/" class="active">Noticias</a></li>
    <li><a href="/proveedores/">Proveedores</a></li>
  </ul></nav>
  <button class="hamburger" aria-label="Menú" aria-expanded="false"><span></span><span></span><span></span></button>
</div></div></header>

<section class="hero page-hero"><div class="container"><div class="hero-content">
  <nav class="breadcrumb"><a href="/">Inicio</a> › <a href="/noticias/">Noticias</a> › <span>${esc(post.title)}</span></nav>
  <h1>${esc(post.title)}</h1>
  <div style="display:flex;align-items:center;gap:12px;margin-top:16px;flex-wrap:wrap">
    <span style="font-size:.8rem;color:var(--text-muted)">📅 ${dateDisplay}</span>
    <span style="font-size:.75rem;font-weight:700;text-transform:uppercase;padding:2px 10px;border-radius:4px;background:rgba(212,160,23,.15);color:var(--gold)">${esc(category)}</span>
    <span style="font-size:.8rem;color:var(--text-muted)">Por Online Casino Latino</span>
  </div>
</div></div></section>

<section class="content-section"><div class="container">
  <div class="prose">${post.content}</div>
</div></section>

<section class="content-section"><div class="container" style="text-align:center">
  <h2 class="section-title" style="margin-bottom:20px">Más Noticias</h2>
  <a href="/noticias/" style="display:inline-block;padding:12px 32px;border:1px solid var(--gold-dim);border-radius:8px;color:var(--gold);font-weight:700;font-size:.9rem">Ver todas las noticias →</a>
</div></section>

<footer role="contentinfo"><div class="container">
  <div class="footer-grid">
    <div class="footer-brand"><span class="logo">Online Casino<span style="-webkit-text-fill-color:#fff"> Latino</span></span><p>Guía independiente de casinos online para América Latina.</p></div>
    <div class="footer-col"><h4>Casinos</h4><ul><li><a href="/casinos/">Todos los casinos</a></li><li><a href="/bonos/">Mejores bonos</a></li></ul></div>
    <div class="footer-col"><h4>Países</h4><ul><li><a href="/argentina/">Argentina</a></li><li><a href="/mexico/">México</a></li><li><a href="/colombia/">Colombia</a></li><li><a href="/chile/">Chile</a></li><li><a href="/peru/">Perú</a></li><li><a href="/venezuela/">Venezuela</a></li><li><a href="/ecuador/">Ecuador</a></li></ul></div>
    <div class="footer-col"><h4>Información</h4><ul><li><a href="/sobre-nosotros/">Sobre nosotros</a></li><li><a href="/noticias/">Noticias</a></li><li><a href="/juego-responsable/">Juego responsable</a></li><li><a href="/privacidad/">Privacidad</a></li><li><a href="/contacto/">Contacto</a></li></ul></div>
  </div>
  <div class="footer-bottom">
    <span>&copy; 2026 OnlineCasinoLatino.com &mdash; Solo para mayores de 18 años</span>
    <div class="trust-badges"><span class="trust-badge">🔒 SSL Seguro</span><span class="trust-badge">✓ eCOGRA</span><span class="trust-badge">⚠️ +18 Solo</span></div>
  </div>
</div></footer>

<script src="/script.js"></script>
</body>
</html>`;
}

// ── GitHub API ────────────────────────────────────────────────────────────────
async function commitToGitHub(filePath, content, message) {
  const token = process.env.GITHUB_TOKEN;
  const repo  = process.env.GITHUB_REPO || 'MariaDevs/OCL-test';
  const branch = process.env.GITHUB_BRANCH || 'master';

  if (!token) throw new Error('GITHUB_TOKEN env var not set');

  const encoded = Buffer.from(content, 'utf8').toString('base64');

  // Check if file already exists (needed for SHA on updates)
  let sha;
  try {
    const existing = await ghRequest('GET', `/repos/${repo}/contents/${filePath}?ref=${branch}`, null, token);
    sha = existing.sha;
  } catch {
    // New file — no SHA needed
  }

  return ghRequest('PUT', `/repos/${repo}/contents/${filePath}`, {
    message,
    content: encoded,
    branch,
    ...(sha ? { sha } : {})
  }, token);
}

function ghRequest(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path,
      method,
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'OnlineCasinoLatino-Webhook',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(data)); } catch { resolve(data); }
        } else {
          reject(new Error(`GitHub ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[áàäâã]/g, 'a').replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i').replace(/[óòöôõ]/g, 'o')
    .replace(/[úùüû]/g, 'u').replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function respond(statusCode, body) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}
