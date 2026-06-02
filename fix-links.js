const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\Dr Nimza\\www\\website1';
let navFixed = [], deadFixed = [];

function fixNav(filepath) {
  let html = fs.readFileSync(filepath, 'utf8');

  // Target only the main nav block
  const navStart = html.indexOf('<nav aria-label="Navegación principal">');
  if (navStart === -1) return;
  const navEnd = html.indexOf('</ul></nav>', navStart);
  if (navEnd === -1) return;

  const navSection = html.substring(navStart, navEnd + 11);
  const hasJuegos    = navSection.includes('href="/juegos/"');
  const hasNoticias  = navSection.includes('href="/noticias/"');
  const hasProveedores = navSection.includes('href="/proveedores/"');

  if (!hasJuegos || (hasNoticias && hasProveedores)) return; // nothing to do

  let newNav = navSection;

  if (!hasNoticias && !hasProveedores) {
    newNav = newNav.replace(
      '>Juegos Gratis</a></li>',
      '>Juegos Gratis</a></li><li><a href="/noticias/">Noticias</a></li><li><a href="/proveedores/">Proveedores</a></li>'
    );
  } else if (hasNoticias && !hasProveedores) {
    newNav = newNav.replace(
      '>Noticias</a></li>',
      '>Noticias</a></li><li><a href="/proveedores/">Proveedores</a></li>'
    );
  } else if (!hasNoticias && hasProveedores) {
    newNav = newNav.replace(
      '>Juegos Gratis</a></li>',
      '>Juegos Gratis</a></li><li><a href="/noticias/">Noticias</a></li>'
    );
  }

  if (newNav !== navSection) {
    html = html.substring(0, navStart) + newNav + html.substring(navEnd + 11);
    fs.writeFileSync(filepath, html);
    navFixed.push(path.relative(BASE, filepath));
  }
}

function removeDeadLinks(filepath) {
  let html = fs.readFileSync(filepath, 'utf8');
  const orig = html;

  html = html.replace(/<li><a href="\/casino-en-vivo\/">[^<]*<\/a><\/li>\s*/g, '');
  html = html.replace(/<li><a href="\/bonos\/sin-deposito\/">[^<]*<\/a><\/li>\s*/g, '');
  html = html.replace(/<li><a href="\/slots\/">[^<]*<\/a><\/li>\s*/g, '');

  if (html !== orig) {
    fs.writeFileSync(filepath, html);
    deadFixed.push(path.relative(BASE, filepath));
  }
}

function walk(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'fix-links.js') return;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) {
      fixNav(full);
      removeDeadLinks(full);
    }
  });
}

walk(BASE);

console.log('\n✓ Nav updated on', navFixed.length, 'pages:');
navFixed.forEach(f => console.log(' ', f));
console.log('\n✓ Dead links removed from', deadFixed.length, 'pages:');
deadFixed.forEach(f => console.log(' ', f));
