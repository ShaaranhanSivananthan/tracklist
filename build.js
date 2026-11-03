#!/usr/bin/env node
"use strict";

/*
 * ORDER THE ALBUM - STATIC PAGE GENERATOR
 *
 * Reads music-data.js and writes real HTML pages that Google can crawl:
 *
 *   /artists/index.html           list of every artist
 *   /artists/<artist>.html        one page per artist
 *   /albums/<artist>-<album>.html one page per album (full tracklist)
 *   /articles/<guide>.html        guides written in content/articles/*.md
 *   /articles/index.html          list of all guides
 *   /sitemap.xml                  rebuilt to include everything
 *   /index.html                   (optional) gets a crawlable list of artists
 *
 * Your own writing goes in two places:
 *   content/articles/*.md           one Markdown file per guide
 *   content/album-descriptions.json short write-ups for individual albums
 *
 * How to run (from the folder that contains music-data.js):
 *
 *   node build.js
 *
 * Run it again every time you edit music-data.js.
 * Each run replaces the .html files in the top-level /artists and /albums
 * folders, so don't put hand-written .html files there. Your /images
 * folder is never touched.
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");


// ============================================================
// SETTINGS - edit these if you need to
// ============================================================

const SITE_URL = "https://orderthealbum.com";
const SITE_NAME = "Order the Album";
// Your name as you want it shown in the page footer and on guide bylines.
// Leave it as "" to show no name at all.
const OWNER_NAME = "Shaaroo Games";

// true  = album pages (and artist pages) that have no written description
//         yet are hidden from Google (noindex) and left out of the sitemap.
//         They switch on automatically once you write a description.
// false = every generated page is open to Google.
const NOINDEX_UNDESCRIBED = true;

// Your AdSense publisher ID (same one as in index.html).
const ADSENSE_CLIENT = "ca-pub-2525057832208317";

// Leave false until AdSense approves you. The meta tag is always added.
// When approved, change to true and run the script again to add the
// AdSense script to every generated page.
const INCLUDE_ADSENSE_SCRIPT = false;

// Set to false to hide album covers on the generated pages.
const SHOW_ALBUM_COVERS = true;

// Folder that contains music-data.js (the folder this file sits in).
const ROOT = process.env.SITE_ROOT
    ? path.resolve(process.env.SITE_ROOT)
    : __dirname;

// Pages that already exist and should stay in the sitemap.
const STATIC_PAGES = [
    { url: "/", lastmod: "2026-10-12" },
    { url: "/about.html", lastmod: "2026-10-13" },
    { url: "/contact.html", lastmod: "2026-10-13" },
    { url: "/privacy.html", lastmod: "2026-10-13" }
];

// Guides shown in the footer of generated pages (filled from content/articles).
let GUIDES = [];

// Markers that tell the script where to put the artist list in index.html.
const HOME_START = "<!-- ARTISTS-LINKS-START -->";
const HOME_END = "<!-- ARTISTS-LINKS-END -->";


// ============================================================
// SMALL HELPERS
// ============================================================

// IMPORTANT: this function must stay identical to slugify() in script.js.
function slugify(text) {
    return String(text)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\$/g, "s")
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function esc(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function jsonLd(object) {
    return JSON.stringify(object).replace(/</g, "\\u003c");
}

function plural(count, one, many) {
    return `${count} ${count === 1 ? one : (many || one + "s")}`;
}

function truncate(text, max) {
    if (text.length <= max) {
        return text;
    }
    return text.slice(0, max - 1).replace(/\s+\S*$/, "") + "\u2026";
}

function quoteList(items) {
    return items.map(item => `\u201C${item}\u201D`).join(", ");
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

function write(relativePath, content) {
    const full = path.join(ROOT, relativePath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, "utf8");
}


// ============================================================
// YOUR WRITING: guides (Markdown) and album descriptions (JSON)
// ============================================================

const usedDescriptionKeys = new Set();

function inlineMarkdown(text) {
    let out = esc(text);

    out = out.replace(/\[([^\]]+)\]\((\/[^)\s]*|https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>');
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\*)/g, "$1<em>$2</em>");

    return out;
}

function markdownToHtml(markdown) {
    const lines = markdown.replace(/\r\n/g, "\n").split("\n");
    const html = [];
    let paragraph = [];
    let list = null;

    const flushParagraph = () => {
        if (paragraph.length) {
            html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
            paragraph = [];
        }
    };

    const flushList = () => {
        if (list) {
            const items = list.items.map(item => `<li>${inlineMarkdown(item)}</li>`).join("\n");
            html.push(`<${list.type}>\n${items}\n</${list.type}>`);
            list = null;
        }
    };

    lines.forEach(line => {
        const text = line.trim();
        let match;

        if (text === "") {
            flushParagraph();
            flushList();
            return;
        }

        if ((match = text.match(/^(#{2,3})\s+(.*)$/))) {
            flushParagraph();
            flushList();
            const level = match[1].length;
            html.push(`<h${level}>${inlineMarkdown(match[2])}</h${level}>`);
            return;
        }

        if ((match = text.match(/^[-*]\s+(.*)$/))) {
            flushParagraph();
            if (!list || list.type !== "ul") {
                flushList();
                list = { type: "ul", items: [] };
            }
            list.items.push(match[1]);
            return;
        }

        if ((match = text.match(/^\d+\.\s+(.*)$/))) {
            flushParagraph();
            if (!list || list.type !== "ol") {
                flushList();
                list = { type: "ol", items: [] };
            }
            list.items.push(match[1]);
            return;
        }

        flushList();
        paragraph.push(text);
    });

    flushParagraph();
    flushList();

    return html.join("\n");
}

function parseFrontMatter(text) {
    const match = text.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

    if (!match) {
        return { meta: {}, body: text };
    }

    const meta = {};

    match[1].split("\n").forEach(line => {
        const index = line.indexOf(":");

        if (index > 0) {
            meta[line.slice(0, index).trim()] = line.slice(index + 1).trim();
        }
    });

    return { meta, body: match[2] };
}

function loadArticles() {
    const dir = path.join(ROOT, "content", "articles");

    if (!fs.existsSync(dir)) {
        return [];
    }

    return fs.readdirSync(dir)
        .filter(file => file.endsWith(".md"))
        .map(file => {
            const raw = fs.readFileSync(path.join(dir, file), "utf8");
            const { meta, body } = parseFrontMatter(raw);
            const words = body.split(/\s+/).filter(Boolean).length;

            if (!meta.title || !meta.description) {
                console.warn(`${file}: add "title:" and "description:" lines at the top.`);
            }

            if (words < 900) {
                console.warn(`${file}: only ${words} words. Aim for 1,000 or more.`);
            }

            return {
                slug: file.replace(/\.md$/, ""),
                title: meta.title || file,
                description: meta.description || "",
                order: Number(meta.order) || 99,
                date: meta.date || today(),
                updated: meta.updated || meta.date || today(),
                html: markdownToHtml(body),
                words
            };
        })
        .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

function loadDescriptions() {
    const file = path.join(ROOT, "content", "album-descriptions.json");

    if (!fs.existsSync(file)) {
        return {};
    }

    let list;

    try {
        list = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (error) {
        console.error("content/album-descriptions.json is not valid JSON:", error.message);
        process.exit(1);
    }

    const map = {};

    list.forEach(item => {
        if (item && item.artist && item.album && item.text) {
            map[`${slugify(item.artist)}/${slugify(item.album)}`] = item.text;
        }
    });

    return map;
}

function formatDate(isoDate) {
    return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC"
    });
}


// ============================================================
// LOAD AND CHECK THE DATA
// ============================================================

function loadMusicData() {
    const file = path.join(ROOT, "music-data.js");

    if (!fs.existsSync(file)) {
        console.error(`Could not find music-data.js in ${ROOT}`);
        process.exit(1);
    }

    const code = fs.readFileSync(file, "utf8");

    let data;

    try {
        // music-data.js declares "const musicData = [...]".
        // Running it and asking for musicData returns the array.
        data = vm.runInNewContext(code + "\n;musicData;");
    } catch (error) {
        console.error("Could not read music-data.js:", error.message);
        process.exit(1);
    }

    if (!Array.isArray(data)) {
        console.error("music-data.js does not contain a musicData array.");
        process.exit(1);
    }

    return data;
}

function prepareArtists(rawData, descriptions) {
    const usedArtistSlugs = new Set();
    const artists = [];

    rawData.forEach(raw => {
        if (!raw || !raw.name || !Array.isArray(raw.albums)) {
            console.warn("Skipping an artist entry that is missing a name or albums.");
            return;
        }

        let artistSlug = slugify(raw.name);

        if (usedArtistSlugs.has(artistSlug)) {
            console.warn(`Duplicate artist slug "${artistSlug}" (${raw.name}). Skipping the duplicate.`);
            return;
        }

        usedArtistSlugs.add(artistSlug);

        const usedAlbumSlugs = new Set();
        const albums = [];

        raw.albums.forEach(rawAlbum => {
            if (!rawAlbum || !rawAlbum.name || !Array.isArray(rawAlbum.tracks) || rawAlbum.tracks.length === 0) {
                console.warn(`Skipping an album of ${raw.name} that is missing a name or tracks.`);
                return;
            }

            let albumSlug = slugify(rawAlbum.name);

            // Same album name twice for one artist: add the year.
            if (usedAlbumSlugs.has(albumSlug)) {
                albumSlug = `${albumSlug}-${rawAlbum.year}`;
            }

            usedAlbumSlugs.add(albumSlug);

            const descriptionKey = `${artistSlug}/${slugify(rawAlbum.name)}`;
            const description = rawAlbum.description || descriptions[descriptionKey] || "";

            if (descriptions[descriptionKey]) {
                usedDescriptionKeys.add(descriptionKey);
            }

            albums.push({
                name: rawAlbum.name,
                year: rawAlbum.year,
                cover: rawAlbum.cover,
                description,
                indexable: !NOINDEX_UNDESCRIBED || Boolean(description),
                tracks: rawAlbum.tracks,
                slug: albumSlug,
                pageUrl: `/albums/${artistSlug}-${albumSlug}.html`
            });
        });

        if (albums.length === 0) {
            return;
        }

        artists.push({
            name: raw.name,
            image: raw.image,
            bio: raw.bio || "",
            indexable: !NOINDEX_UNDESCRIBED || Boolean(raw.bio) || albums.some(album => album.indexable),
            slug: artistSlug,
            pageUrl: `/artists/${artistSlug}.html`,
            albums
        });
    });

    return artists;
}


// ============================================================
// WORDS DERIVED FROM THE DATA
// (everything here is calculated, nothing is invented)
// ============================================================

const SPECIAL_TRACK = /\b(intro|outro|interlude|skit|reprise|prelude)\b/i;

function playUrl(artist, album) {
    const query = album
        ? `artist=${artist.slug}&amp;album=${album.slug}`
        : `artist=${artist.slug}`;

    return `/?${query}`;
}

function yearSpan(artist) {
    const years = artist.albums
        .map(album => Number(album.year))
        .filter(year => Number.isFinite(year));

    if (years.length === 0) {
        return "";
    }

    const first = Math.min(...years);
    const last = Math.max(...years);

    return first === last ? `${first}` : `${first}\u2013${last}`;
}

function albumParagraphs(artist, album, index) {
    const paragraphs = [];
    const tracks = album.tracks;
    const count = tracks.length;

    if (album.description) {
        album.description
            .split(/\n\s*\n/)
            .forEach(text => paragraphs.push(text.trim()));
    }

    // Opening and closing tracks
    let intro =
        `\u201C${album.name}\u201D is a ${album.year} release by ${artist.name}. ` +
        `On the version used in ${SITE_NAME} it has ${plural(count, "track")}, ` +
        `starting with \u201C${tracks[0]}\u201D`;

    if (count > 1) {
        intro += ` and ending with \u201C${tracks[count - 1]}\u201D.`;
    } else {
        intro += ".";
    }

    paragraphs.push(intro);

    // Place in the discography
    const previous = artist.albums[index - 1];
    const next = artist.albums[index + 1];

    if (previous || next) {
        let place = `In our collection of ${plural(artist.albums.length, "album")} by ${artist.name}, `;

        if (previous && next) {
            place +=
                `it comes after \u201C${previous.name}\u201D (${previous.year}) ` +
                `and before \u201C${next.name}\u201D (${next.year}).`;
        } else if (previous) {
            place += `it is the most recent, following \u201C${previous.name}\u201D (${previous.year}).`;
        } else {
            place += `it is the earliest, followed by \u201C${next.name}\u201D (${next.year}).`;
        }

        paragraphs.push(place);
    }

    // Length compared with the artist's other albums
    if (artist.albums.length > 1) {
        const total = artist.albums.reduce((sum, a) => sum + a.tracks.length, 0);
        const average = Math.round(total / artist.albums.length);

        let comparison;

        if (count > average) {
            comparison = `longer than`;
        } else if (count < average) {
            comparison = `shorter than`;
        } else {
            comparison = `exactly`;
        }

        paragraphs.push(
            `With ${plural(count, "track")}, it is ${comparison} the average of ` +
            `${average} tracks across ${artist.name}'s albums here.`
        );
    }

    // Intros, interludes and skits
    const specials = tracks.filter(track => SPECIAL_TRACK.test(track));

    if (specials.length > 0) {
        paragraphs.push(
            `The tracklist includes ${plural(specials.length, "intro, interlude or skit-style track")}: ` +
            `${quoteList(specials)}. Short tracks like these are easy to forget, ` +
            `which makes the order harder to remember.`
        );
    }

    return paragraphs;
}

function artistParagraphs(artist) {
    const paragraphs = [];
    const albums = artist.albums;

    if (artist.bio) {
        paragraphs.push(artist.bio);
    }

    const span = yearSpan(artist);
    const totalTracks = albums.reduce((sum, album) => sum + album.tracks.length, 0);

    let overview =
        `${SITE_NAME} has ${plural(albums.length, "album")} by ${artist.name}` +
        (span ? `, covering ${span}` : "") +
        `, with ${plural(totalTracks, "track")} in total.`;

    paragraphs.push(overview);

    if (albums.length > 1) {
        const longest = albums.reduce((a, b) => (b.tracks.length > a.tracks.length ? b : a));
        const shortest = albums.reduce((a, b) => (b.tracks.length < a.tracks.length ? b : a));

        if (longest.tracks.length !== shortest.tracks.length) {
            paragraphs.push(
                `The longest tracklist is \u201C${longest.name}\u201D (${longest.year}) with ` +
                `${plural(longest.tracks.length, "track")}, and the shortest is ` +
                `\u201C${shortest.name}\u201D (${shortest.year}) with ${shortest.tracks.length}.`
            );
        }
    }

    paragraphs.push(
        `Pick an album below to read its full tracklist, or play it right away and try ` +
        `to put every track back in the original order.`
    );

    return paragraphs;
}


// ============================================================
// PAGE LAYOUT
// ============================================================

function layout({ title, description, urlPath, body, structuredData = [], image, noindex = false }) {
    const canonical = SITE_URL + urlPath;
    const fullTitle = `${title} | ${SITE_NAME}`;
    const metaDescription = truncate(description, 158);

    const imageTags = image
        ? `<meta property="og:image" content="${esc(SITE_URL + image)}">\n    <meta name="twitter:image" content="${esc(SITE_URL + image)}">`
        : "";

    const adsenseScript = INCLUDE_ADSENSE_SCRIPT
        ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>`
        : "";

    const structured = structuredData
        .map(data => `<script type="application/ld+json">${jsonLd(data)}</script>`)
        .join("\n    ");

    const guideLinks = GUIDES
        .map(guide => `<a href="${guide.url}">${esc(guide.title)}</a>`)
        .join("\n                ");

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="google-adsense-account" content="${ADSENSE_CLIENT}">
    <title>${esc(fullTitle)}</title>
    <meta name="description" content="${esc(metaDescription)}">
    <meta name="robots" content="${noindex ? "noindex, follow" : "index, follow"}">
    <link rel="canonical" href="${esc(canonical)}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${esc(SITE_NAME)}">
    <meta property="og:title" content="${esc(fullTitle)}">
    <meta property="og:description" content="${esc(metaDescription)}">
    <meta property="og:url" content="${esc(canonical)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(fullTitle)}">
    <meta name="twitter:description" content="${esc(metaDescription)}">
    ${imageTags}
    <link rel="icon" type="image/png" sizes="64x64" href="/favicon.png">
    <link rel="stylesheet" href="/pages.css">
    ${structured}
    ${adsenseScript}
</head>
<body class="seo-page">
    <header class="site-header">
        <a class="brand" href="/">${esc(SITE_NAME)}</a>
        <nav aria-label="Main">
            <a href="/">Play</a>
            <a href="/artists/">Artists</a>
            <a href="/articles/">Guides</a>
            <a href="/about.html">About</a>
            <a href="/contact.html">Contact</a>
        </nav>
    </header>

    <main>
${body}
    </main>

    <footer class="site-footer">
        <nav aria-label="Site pages">
            <a href="/">Play the game</a>
            <a href="/artists/">All artists</a>
            <a href="/about.html">About Us</a>
            <a href="/contact.html">Contact Us</a>
            <a href="/privacy.html">Privacy Policy</a>
        </nav>
        ${guideLinks ? `<nav aria-label="Music guides" class="footer-guides">
            <strong><a href="/articles/">Music Guides</a></strong>
            ${guideLinks}
        </nav>` : ""}
        <p>&copy; ${new Date().getFullYear()} ${esc(SITE_NAME)}${OWNER_NAME ? ` by ${esc(OWNER_NAME)}` : ""}</p>
    </footer>
</body>
</html>
`;
}

function breadcrumbs(items) {
    const html = items
        .map((item, index) => {
            const last = index === items.length - 1;
            return last
                ? `<li aria-current="page">${esc(item.name)}</li>`
                : `<li><a href="${item.url}">${esc(item.name)}</a></li>`;
        })
        .join("\n            ");

    const data = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": SITE_URL + item.url
        }))
    };

    return {
        html: `<nav class="breadcrumbs" aria-label="Breadcrumb">
        <ol>
            ${html}
        </ol>
    </nav>`,
        data
    };
}

function coverImage(album, className) {
    if (!SHOW_ALBUM_COVERS || !album.cover) {
        return "";
    }

    return `<img class="${className}" src="/${esc(album.cover)}" alt="${esc(album.name)} album cover" loading="lazy" width="300" height="300">`;
}


// ============================================================
// ALBUM PAGE
// ============================================================

function buildAlbumPage(artist, album, index) {
    const tracks = album.tracks;
    const count = tracks.length;

    const crumbs = breadcrumbs([
        { name: "Home", url: "/" },
        { name: "Artists", url: "/artists/" },
        { name: artist.name, url: artist.pageUrl },
        { name: album.name, url: album.pageUrl }
    ]);

    const paragraphs = albumParagraphs(artist, album, index)
        .map(text => `<p>${esc(text)}</p>`)
        .join("\n        ");

    const trackItems = tracks
        .map(track => `<li>${esc(track)}</li>`)
        .join("\n            ");

    const previous = artist.albums[index - 1];
    const next = artist.albums[index + 1];

    const siblingLinks = [];

    if (previous) {
        siblingLinks.push(`<a href="${previous.pageUrl}">Previous: ${esc(previous.name)} (${esc(previous.year)})</a>`);
    }

    if (next) {
        siblingLinks.push(`<a href="${next.pageUrl}">Next: ${esc(next.name)} (${esc(next.year)})</a>`);
    }

    const otherAlbums = artist.albums
        .filter(other => other !== album)
        .map(other => `<li><a href="${other.pageUrl}">${esc(other.name)}</a> (${esc(other.year)})</li>`)
        .join("\n            ");

    const faq = [
        [
            `How many tracks are on ${album.name}?`,
            `${album.name} by ${artist.name} has ${plural(count, "track")} on the version used in ${SITE_NAME}.`
        ],
        [
            `What is the first track on ${album.name}?`,
            `The first track is \u201C${tracks[0]}\u201D.`
        ]
    ];

    if (count > 1) {
        faq.push([
            `What is the last track on ${album.name}?`,
            `The last track is \u201C${tracks[count - 1]}\u201D.`
        ]);
    }

    faq.push([
        `When was ${album.name} released?`,
        `${album.name} was released in ${album.year}.`
    ]);

    const faqHtml = faq
        .map(([question, answer]) => `<dt>${esc(question)}</dt>\n            <dd>${esc(answer)}</dd>`)
        .join("\n            ");

    const body = `        ${crumbs.html}

        <article>
            <div class="album-hero">
                ${coverImage(album, "album-hero-cover")}
                <div>
                    <h1>${esc(album.name)} Tracklist</h1>
                    <p class="subtitle">${esc(artist.name)}, ${esc(album.year)}, ${plural(count, "track")}</p>
                    <p><a class="button" href="${playUrl(artist, album)}">Play: put the tracks in order</a></p>
                </div>
            </div>

            <section>
                <h2>About ${esc(album.name)}</h2>
        ${paragraphs}
            </section>

            <section>
                <h2>${esc(album.name)} full tracklist</h2>
                <ol class="tracklist">
            ${trackItems}
                </ol>
            </section>

            <section>
                <h2>Can you remember the order?</h2>
                <p>${esc(`In ${SITE_NAME} you see all ${count} tracks from ${album.name} in a shuffled list. Drag them back into the original order, then check your answer to see how many tracks you placed correctly. You can download or share your result as an image.`)}</p>
                <p><a class="button" href="${playUrl(artist, album)}">Play ${esc(album.name)}</a></p>
            </section>

            <section>
                <h2>Quick answers</h2>
                <dl class="faq">
            ${faqHtml}
                </dl>
            </section>

            <section>
                <h2>More ${esc(artist.name)} albums</h2>
                ${siblingLinks.length ? `<p class="sibling-links">${siblingLinks.join("\n                ")}</p>` : ""}
                ${otherAlbums ? `<ul class="link-list">\n            ${otherAlbums}\n                </ul>` : ""}
                <p><a href="${artist.pageUrl}">All ${esc(artist.name)} albums and tracklists</a></p>
            </section>
        </article>`;

    const musicAlbum = {
        "@context": "https://schema.org",
        "@type": "MusicAlbum",
        "name": album.name,
        "url": SITE_URL + album.pageUrl,
        "datePublished": String(album.year),
        "numTracks": count,
        ...(album.description ? { "description": album.description.split(/\n\s*\n/)[0] } : {}),
        "byArtist": { "@type": "MusicGroup", "name": artist.name },
        "track": tracks.map((track, position) => ({
            "@type": "MusicRecording",
            "name": track,
            "position": position + 1
        }))
    };

    if (SHOW_ALBUM_COVERS && album.cover) {
        musicAlbum.image = `${SITE_URL}/${album.cover}`;
    }

    return layout({
        title: `${album.name} Tracklist by ${artist.name} (${album.year})`,
        description:
            `Full ${album.name} tracklist by ${artist.name} (${album.year}): all ${count} tracks in order. ` +
            `Then test your memory in the Order the Album trivia game.`,
        urlPath: album.pageUrl,
        body,
        structuredData: [crumbs.data, musicAlbum],
        image: SHOW_ALBUM_COVERS && album.cover ? `/${album.cover}` : undefined,
        noindex: !album.indexable
    });
}


// ============================================================
// ARTIST PAGE
// ============================================================

function buildArtistPage(artist) {
    const crumbs = breadcrumbs([
        { name: "Home", url: "/" },
        { name: "Artists", url: "/artists/" },
        { name: artist.name, url: artist.pageUrl }
    ]);

    const paragraphs = artistParagraphs(artist)
        .map(text => `<p>${esc(text)}</p>`)
        .join("\n            ");

    const cards = artist.albums
        .map(album => {
            const count = album.tracks.length;

            return `<li class="album-card">
                    ${coverImage(album, "album-card-cover")}
                    <div>
                        <h3><a href="${album.pageUrl}">${esc(album.name)}</a></h3>
                        <p>${esc(album.year)}, ${plural(count, "track")}</p>
                        <p class="opens">Opens with \u201C${esc(album.tracks[0])}\u201D</p>
                        <p><a href="${playUrl(artist, album)}">Play this album</a></p>
                    </div>
                </li>`;
        })
        .join("\n                ");

    const body = `        ${crumbs.html}

        <article>
            <h1>${esc(artist.name)} Albums and Tracklists</h1>
            ${paragraphs}
            <p><a class="button" href="${playUrl(artist)}">Play ${esc(artist.name)} albums</a></p>

            <h2>${esc(artist.name)} albums</h2>
            <ul class="album-grid">
                ${cards}
            </ul>
        </article>`;

    return layout({
        title: `${artist.name} Albums and Tracklists`,
        description:
            `Browse ${plural(artist.albums.length, "album")} by ${artist.name} with full tracklists, ` +
            `then play Order the Album and put the tracks back in the right order.`,
        urlPath: artist.pageUrl,
        body,
        structuredData: [crumbs.data],
        image: SHOW_ALBUM_COVERS && artist.image ? `/${artist.image}` : undefined,
        noindex: !artist.indexable
    });
}


// ============================================================
// ARTIST DIRECTORY PAGE
// ============================================================

function buildArtistsIndex(artists) {
    const sorted = [...artists].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

    const totalAlbums = artists.reduce((sum, artist) => sum + artist.albums.length, 0);
    const totalTracks = artists.reduce(
        (sum, artist) => sum + artist.albums.reduce((s, album) => s + album.tracks.length, 0),
        0
    );

    const crumbs = breadcrumbs([
        { name: "Home", url: "/" },
        { name: "Artists", url: "/artists/" }
    ]);

    const items = sorted
        .map(artist => {
            const span = yearSpan(artist);

            return `<li><a href="${artist.pageUrl}">${esc(artist.name)}</a>` +
                `<span>${plural(artist.albums.length, "album")}${span ? `, ${span}` : ""}</span></li>`;
        })
        .join("\n                ");

    const body = `        ${crumbs.html}

        <article>
            <h1>All Artists</h1>
            <p>${esc(`${SITE_NAME} currently has ${plural(artists.length, "artist")}, ${plural(totalAlbums, "album")} and ${totalTracks.toLocaleString("en-US")} tracks. Choose an artist to see every album and its full tracklist, or head to the game and test how well you know the order.`)}</p>
            <p><a class="button" href="/">Play the game</a></p>
            <ul class="artist-directory">
                ${items}
            </ul>
        </article>`;

    return layout({
        title: "All Artists and Albums",
        description:
            `Browse ${plural(artists.length, "artist")} and ${plural(totalAlbums, "album")} with full tracklists. ` +
            `Pick one and try to put the tracks in the right order.`,
        urlPath: "/artists/",
        body,
        structuredData: [crumbs.data]
    });
}


// ============================================================
// GUIDE (ARTICLE) PAGES
// ============================================================

function buildArticlePage(article) {
    const urlPath = `/articles/${article.slug}.html`;

    const crumbs = breadcrumbs([
        { name: "Home", url: "/" },
        { name: "Guides", url: "/articles/" },
        { name: article.title, url: urlPath }
    ]);

    const byline = OWNER_NAME ? ` by ${esc(OWNER_NAME)}` : "";

    const body = `        ${crumbs.html}

        <article class="article">
            <h1>${esc(article.title)}</h1>
            <p class="subtitle">Published <time datetime="${article.date}">${formatDate(article.date)}</time>${byline}</p>
${article.html}
            <p class="article-cta"><a class="button" href="/">Play Order the Album</a></p>
            <p><a href="/artists/">Browse every artist and tracklist</a> or <a href="/articles/">read more guides</a>.</p>
        </article>`;

    const articleData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "description": article.description,
        "datePublished": article.date,
        "dateModified": article.updated,
        "mainEntityOfPage": SITE_URL + urlPath,
        "author": OWNER_NAME
            ? { "@type": "Person", "name": OWNER_NAME }
            : { "@type": "Organization", "name": SITE_NAME },
        "publisher": { "@type": "Organization", "name": SITE_NAME }
    };

    return layout({
        title: article.title,
        description: article.description,
        urlPath,
        body,
        structuredData: [crumbs.data, articleData]
    });
}

function buildArticlesIndex(articles) {
    const crumbs = breadcrumbs([
        { name: "Home", url: "/" },
        { name: "Guides", url: "/articles/" }
    ]);

    const items = articles
        .map(article => `<li class="guide-card">
                    <h2><a href="/articles/${article.slug}.html">${esc(article.title)}</a></h2>
                    <p>${esc(article.description)}</p>
                </li>`)
        .join("\n                ");

    const body = `        ${crumbs.html}

        <article>
            <h1>Music Guides</h1>
            <p>Guides on how albums are put together, how to remember them, and what to listen for. Each one uses real albums from the game as examples.</p>
            <ul class="guide-list">
                ${items}
            </ul>
        </article>`;

    return layout({
        title: "Music Guides",
        description: "Guides on album sequencing, tracklists, memory and music trivia, with examples from The Beatles, Beyonce, Kanye West and more.",
        urlPath: "/articles/",
        body,
        structuredData: [crumbs.data]
    });
}


// ============================================================
// HOMEPAGE LINKS (so Google can follow links from the homepage)
// ============================================================

function updateHomepage(artists) {
    const file = path.join(ROOT, "index.html");

    if (!fs.existsSync(file)) {
        console.warn("index.html not found, skipping homepage links.");
        return;
    }

    const html = fs.readFileSync(file, "utf8");
    const start = html.indexOf(HOME_START);
    const end = html.indexOf(HOME_END);

    if (start === -1 || end === -1 || end < start) {
        console.warn(
            `\nHomepage links NOT added: index.html is missing the markers\n` +
            `  ${HOME_START}\n  ${HOME_END}\n` +
            `Add them once (see the setup steps) and run this script again.\n`
        );
        return;
    }

    const sorted = [...artists].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

    const links = sorted
        .map(artist => `<li><a href="${artist.pageUrl}">${esc(artist.name)}</a></li>`)
        .join("\n                ");

    const totalAlbums = artists.reduce((sum, artist) => sum + artist.albums.length, 0);

    const block = `${HOME_START}
            <section class="browse-artists" aria-labelledby="browse-title">
                <h2 id="browse-title">Browse artists and tracklists</h2>
                <p>${esc(`${SITE_NAME} is a free music trivia game. Pick an artist, choose an album, and drag the shuffled tracks back into their original order. There are ${plural(totalAlbums, "album")} from ${plural(artists.length, "artist")} to try, and every album also has its own page with the full tracklist.`)}</p>
                <ul class="browse-artists-list">
                ${links}
                </ul>
                <p><a href="/artists/">See all artists and albums</a></p>
            </section>
            ${HOME_END}`;

    const updated = html.slice(0, start) + block + html.slice(end + HOME_END.length);

    fs.writeFileSync(file, updated, "utf8");
}


// ============================================================
// SITEMAP
// ============================================================

function buildSitemap(artists, articles) {
    const date = today();

    const entries = [...STATIC_PAGES];

    entries.push({ url: "/artists/", lastmod: date });

    if (articles.length > 0) {
        entries.push({ url: "/articles/", lastmod: date });
    }

    articles.forEach(article => {
        entries.push({ url: `/articles/${article.slug}.html`, lastmod: article.updated });
    });

    // Pages marked noindex are left out of the sitemap on purpose.
    artists.forEach(artist => {
        if (artist.indexable) {
            entries.push({ url: artist.pageUrl, lastmod: date });
        }

        artist.albums.forEach(album => {
            if (album.indexable) {
                entries.push({ url: album.pageUrl, lastmod: date });
            }
        });
    });

    const urls = entries
        .map(entry => `  <url>
    <loc>${SITE_URL}${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
  </url>`)
        .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}


// ============================================================
// MAIN
// ============================================================

function main() {
    const articles = loadArticles();
    GUIDES = articles.map(article => ({ url: `/articles/${article.slug}.html`, title: article.title }));

    const descriptions = loadDescriptions();
    const artists = prepareArtists(loadMusicData(), descriptions);

    Object.keys(descriptions)
        .filter(key => !usedDescriptionKeys.has(key))
        .forEach(key => console.warn(`No album found for description "${key}". Check the artist and album names.`));

    // Remove old generated pages (only .html files in /artists and /albums
    // at the top level of the site). Your /images folder is never touched.
    ["artists", "albums"].forEach(folder => {
        const dir = path.join(ROOT, folder);

        if (!fs.existsSync(dir)) {
            return;
        }

        fs.readdirSync(dir)
            .filter(file => file.endsWith(".html"))
            .forEach(file => fs.unlinkSync(path.join(dir, file)));
    });

    let albumCount = 0;
    let albumsIndexed = 0;

    artists.forEach(artist => {
        write(`artists/${artist.slug}.html`, buildArtistPage(artist));

        artist.albums.forEach((album, index) => {
            write(`albums/${artist.slug}-${album.slug}.html`, buildAlbumPage(artist, album, index));
            albumCount++;

            if (album.indexable) {
                albumsIndexed++;
            }
        });
    });

    write("artists/index.html", buildArtistsIndex(artists));

    articles.forEach(article => {
        write(`articles/${article.slug}.html`, buildArticlePage(article));
    });

    if (articles.length > 0) {
        write("articles/index.html", buildArticlesIndex(articles));
    }

    const sitemap = buildSitemap(artists, articles);
    write("sitemap.xml", sitemap);

    updateHomepage(artists);

    const listed = (sitemap.match(/<loc>/g) || []).length;

    console.log("Done.");
    console.log(`  ${artists.length} artist pages`);
    console.log(`  ${albumCount} album pages (${albumsIndexed} open to Google, ${albumCount - albumsIndexed} hidden until they have a description)`);
    console.log(`  ${articles.length} guides`);
    console.log(`  sitemap.xml lists ${listed} pages`);
}

main();
