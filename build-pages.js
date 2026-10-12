"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const SITE_URL = "https://orderthealbum.com";
const SITE_NAME = "Order the Album";
const SHOW_COVERS = false; // true = show album covers on album pages

const STATIC_PAGES = [
  "/", "/albums/", "/about.html", "/contact.html", "/privacy.html",
  "/guides/album-track-order.html",
  "/guides/standard-vs-deluxe-albums.html",
  "/guides/how-to-remember-tracklists.html"
];

const musicData = vm.runInNewContext(
  fs.readFileSync("music-data.js", "utf8") + "\n;musicData"
);

function esc(v) {
  return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function slugify(t) {
  return String(t).replace(/\$/g,"s").replace(/&/g," and ")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
    .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
}
function paragraphs(notes) {
  const list = Array.isArray(notes) ? notes : String(notes).split(/\n\s*\n/);
  return list.map(p => p.trim()).filter(Boolean)
    .map(p => `<p>${esc(p)}</p>`).join("\n      ");
}
const trackWord = n => (n === 1 ? "track" : "tracks");
function cleanDir(d) {
  fs.rmSync(d, { recursive: true, force: true });
  fs.mkdirSync(d, { recursive: true });
}

function layout({ title, description, urlPath, body }) {
  const canonical = SITE_URL + urlPath;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="google-adsense-account" content="ca-pub-2525057832208317">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="${SITE_NAME}">
  <link rel="icon" type="image/png" sizes="64x64" href="/favicon.png">
  <link rel="stylesheet" href="/site.css">
</head>
<body>
  <header class="site-header">
    <a class="site-title" href="/">${SITE_NAME}</a>
    <nav aria-label="Main navigation">
      <a href="/">Play</a>
      <a href="/albums/">Albums</a>
      <a href="/guides/album-track-order.html">Guides</a>
      <a href="/about.html">About</a>
      <a href="/contact.html">Contact</a>
    </nav>
  </header>

  <main class="page">
${body}
  </main>

  <footer class="site-footer">
    <nav aria-label="Footer navigation">
      <a href="/">Play the Game</a>
      <a href="/albums/">All Albums</a>
      <a href="/about.html">About</a>
      <a href="/contact.html">Contact</a>
      <a href="/privacy.html">Privacy Policy</a>
    </nav>
    <p>&copy; 2026 ${SITE_NAME}</p>
  </footer>
</body>
</html>
`;
}

cleanDir("albums");
cleanDir("artists");

const used = new Set();
const generatedUrls = [];

musicData.forEach(artist => {
  artist.slug = slugify(artist.name);
  artist.albums.forEach(album => {
    let slug = `${artist.slug}-${slugify(album.name)}`;
    if (used.has(slug)) slug += `-${album.year}`;
    used.add(slug);
    album.slug = slug;
    album.hasPage = Boolean(album.notes && String(album.notes).trim());
  });
  artist.hasPage = artist.albums.some(a => a.hasPage);
});

// ---------- Album pages ----------
musicData.forEach(artist => {
  const sorted = [...artist.albums].sort((a, b) => a.year - b.year);

  artist.albums.forEach(album => {
    if (!album.hasPage) return;

    const n = album.tracks.length;
    const first = album.tracks[0];
    const last = album.tracks[n - 1];
    const urlPath = `/albums/${album.slug}.html`;

    const title = `${album.name} (${album.year}) by ${artist.name} — Tracklist & Track Order`;
    const description =
      `${album.name} by ${artist.name}: the full ${n}-track standard tracklist and notes on how the album is sequenced.`;

    const otherAlbums = sorted.filter(a => a !== album)
      .map(a => a.hasPage
        ? `<li><a href="/albums/${a.slug}.html">${esc(a.name)}</a> (${a.year})</li>`
        : `<li>${esc(a.name)} (${a.year})</li>`)
      .join("\n        ");

    const trackItems = album.tracks.map(t => `<li>${esc(t)}</li>`).join("\n        ");

    const cover = SHOW_COVERS
      ? `<img class="cover" src="/${esc(album.cover)}" alt="${esc(album.name)} album cover" width="220" height="220" loading="lazy">`
      : "";

    const playLink =
      `/?artist=${encodeURIComponent(artist.name)}&amp;album=${encodeURIComponent(album.name)}`;

    const body = `    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="/albums/">Albums</a> &rsaquo;
      <a href="/artists/${artist.slug}.html">${esc(artist.name)}</a> &rsaquo;
      ${esc(album.name)}
    </nav>

    <article>
      <h1>${esc(album.name)} <span class="muted">(${album.year})</span></h1>
      <p class="byline">by ${esc(artist.name)}</p>
      ${cover}

      <p>
        <em>${esc(album.name)}</em> is a ${album.year} release by ${esc(artist.name)}.
        The standard edition used on this site has ${n} ${trackWord(n)},
        opening with &ldquo;${esc(first)}&rdquo; and closing with &ldquo;${esc(last)}.&rdquo;
      </p>

      <h2>How the album is sequenced</h2>
      ${paragraphs(album.notes)}

      <h2>Standard tracklist</h2>
      <details>
        <summary>Show all ${n} ${trackWord(n)} in order (spoiler for the game)</summary>
        <ol class="tracklist">
        ${trackItems}
        </ol>
      </details>

      <p><a class="button" href="${playLink}">Play this album in the game</a></p>

      <h2>More by ${esc(artist.name)}</h2>
      <ul>
        ${otherAlbums || "<li>No other albums yet.</li>"}
      </ul>
    </article>`;

    fs.writeFileSync(path.join("albums", `${album.slug}.html`),
      layout({ title, description, urlPath, body }));
    generatedUrls.push(urlPath);
  });
});

// ---------- Artist pages ----------
musicData.forEach(artist => {
  if (!artist.hasPage) return;

  const urlPath = `/artists/${artist.slug}.html`;
  const sorted = [...artist.albums].sort((a, b) => a.year - b.year);
  const count = sorted.length;

  const rows = sorted.map(a => {
    const n = a.tracks.length;
    const label = a.hasPage
      ? `<a href="/albums/${a.slug}.html">${esc(a.name)}</a>` : esc(a.name);
    return `<li>${label} <span class="muted">(${a.year}, ${n} ${trackWord(n)})</span></li>`;
  }).join("\n      ");

  const intro = artist.bio
    ? paragraphs(artist.bio)
    : `<p>${esc(artist.name)} has ${count} ${count === 1 ? "album" : "albums"} in the ${SITE_NAME} collection, listed here from earliest to most recent.</p>`;

  const title = `${artist.name} Albums in Order — ${SITE_NAME}`;
  const description =
    `${artist.name}'s albums in release order, with tracklists and notes on track order. Play the ${artist.name} track-order game.`;

  const body = `    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="/albums/">Albums</a> &rsaquo; ${esc(artist.name)}
    </nav>

    <h1>${esc(artist.name)}</h1>
    ${intro}

    <h2>Albums</h2>
    <ul>
      ${rows}
    </ul>

    <p><a class="button" href="/?artist=${encodeURIComponent(artist.name)}">Play ${esc(artist.name)} albums in the game</a></p>`;

  fs.writeFileSync(path.join("artists", `${artist.slug}.html`),
    layout({ title, description, urlPath, body }));
  generatedUrls.push(urlPath);
});

// ---------- Albums index ----------
(function () {
  const sections = musicData.map(artist => {
    const sorted = [...artist.albums].sort((a, b) => a.year - b.year);
    const items = sorted.map(a => a.hasPage
      ? `<li><a href="/albums/${a.slug}.html">${esc(a.name)}</a> <span class="muted">(${a.year})</span></li>`
      : `<li>${esc(a.name)} <span class="muted">(${a.year})</span></li>`)
      .join("\n        ");
    const heading = artist.hasPage
      ? `<a href="/artists/${artist.slug}.html">${esc(artist.name)}</a>` : esc(artist.name);
    return `      <section class="artist-block">
        <h2>${heading}</h2>
        <ul>
        ${items}
        </ul>
      </section>`;
  }).join("\n");

  const total = musicData.reduce((s, a) => s + a.albums.length, 0);
  const body = `    <h1>All Artists and Albums</h1>
    <p>
      ${SITE_NAME} currently includes ${total} albums from ${musicData.length} artists.
      Albums with a link have a full page with the tracklist and notes on how the album is sequenced.
    </p>
${sections}`;

  fs.writeFileSync(path.join("albums", "index.html"), layout({
    title: `All Artists and Albums — ${SITE_NAME}`,
    description: `Browse every artist and album in ${SITE_NAME}, with tracklists and track-order notes.`,
    urlPath: "/albums/",
    body
  }));
})();

// ---------- Sitemap ----------
(function () {
  const today = new Date().toISOString().slice(0, 10);
  const entries = [...STATIC_PAGES, ...generatedUrls]
    .map(u => `  <url><loc>${SITE_URL}${u}</loc><lastmod>${today}</lastmod></url>`)
    .join("\n");
  fs.writeFileSync("sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`);
})();

console.log(`Built ${generatedUrls.length} pages.`);
