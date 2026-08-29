import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const SITE = "https://www.yes.vbss.io";

const occasions = JSON.parse(
  readFileSync(join(root, "src/presentation/assets/occasions.json"), "utf8")
);
const template = readFileSync(join(dist, "index.html"), "utf8");

if (template.includes("seo-shell")) {
  throw new Error("prerender: dist/index.html ja foi processado — rode `vite build` antes");
}

const slugs = new Set();
for (const occasion of occasions) {
  for (const lang of ["pt", "en"]) {
    const slug = occasion.slug?.[lang] ?? "";
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error(`prerender: slug ${lang} invalido em "${occasion.slug?.pt}"`);
    }
    if (slugs.has(slug)) {
      throw new Error(`prerender: slug duplicado "${slug}"`);
    }
    slugs.add(slug);
  }
}

const escapeHtml = (text) =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const jsonLd = (data) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;

const replaceOne = (html, regex, replacement, label) => {
  if (!regex.test(html)) {
    throw new Error(`prerender: marker "${label}" nao encontrado no template`);
  }
  return html.replace(regex, () => replacement);
};

const injectBeforeHeadEnd = (html, fragment) =>
  replaceOne(html, /<\/head>/, `${fragment}\n  </head>`, "</head>");

const injectRootContent = (html, content) =>
  replaceOne(html, /<div id="root"><\/div>/, `<div id="root">${content}</div>`, "#root");

const applyHead = (html, { title, description, url }) => {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeUrl = escapeHtml(url);
  html = replaceOne(html, /<title>[\s\S]*?<\/title>/, `<title>${safeTitle}</title>`, "title");
  html = replaceOne(html, /<meta name="title" content="[^"]*" \/>/, `<meta name="title" content="${safeTitle}" />`, "meta title");
  html = replaceOne(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${safeDescription}" />`, "meta description");
  html = replaceOne(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${safeUrl}" />`, "canonical");
  html = replaceOne(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${safeUrl}" />`, "og:url");
  html = replaceOne(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${safeTitle}" />`, "og:title");
  html = replaceOne(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${safeDescription}" />`, "og:description");
  html = replaceOne(html, /<meta name="twitter:url" content="[^"]*" \/>/, `<meta name="twitter:url" content="${safeUrl}" />`, "twitter:url");
  html = replaceOne(html, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${safeTitle}" />`, "twitter:title");
  html = replaceOne(html, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${safeDescription}" />`, "twitter:description");
  return html;
};

const hreflang = (ptUrl, enUrl) =>
  [
    `<link rel="alternate" hreflang="pt-BR" href="${escapeHtml(ptUrl)}" />`,
    `<link rel="alternate" hreflang="en" href="${escapeHtml(enUrl)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${escapeHtml(ptUrl)}" />`,
  ].join("\n  ");

const SHELL_STYLE = `<style>
.seo-shell{font-family:Arial,sans-serif;background:#fff;color:#1f2937;min-height:100vh;padding:2rem 1.25rem}
.seo-shell .wrap{max-width:760px;margin:0 auto}
.seo-shell h1{font-size:1.7rem;line-height:1.25;margin:0 0 1rem}
.seo-shell h2{color:#a855f7;font-size:1.15rem;margin:2rem 0 .75rem}
.seo-shell h3{font-size:1rem;margin:1rem 0 .25rem}
.seo-shell p{line-height:1.65;color:#4b5563;margin:.6rem 0}
.seo-shell a{color:#a855f7}
.seo-shell .cta{display:inline-block;margin:1rem 0;padding:.75rem 1.75rem;border-radius:999px;background:linear-gradient(to right,#ec4899,#a855f7);color:#fff;text-decoration:none;font-weight:600}
.seo-shell .related a{margin-right:1rem}
</style>`;

const galleryCopy = {
  pt: {
    title: "Modelos prontos por ocasião — Only Yes",
    description:
      "Pedido de namoro, casamento, desculpas, convite de festa e mais: modelos prontos da pergunta onde dizer Não é impossível.",
    h1: "Modelos prontos por ocasião",
    subtitle:
      "Escolha uma ocasião, personalize em segundos e mande o link onde dizer Não é impossível.",
    use: "Usar este modelo",
    path: "/modelos",
  },
  en: {
    title: "Ready-made templates for every occasion — Only Yes",
    description:
      "Ask someone out, propose, apologize, invite to a party and more: ready-made templates of the question where saying No is impossible.",
    h1: "Ready-made templates for every occasion",
    subtitle:
      "Pick an occasion, personalize it in seconds and send the link where saying No is impossible.",
    use: "Use this template",
    path: "/templates",
  },
};

const occasionPath = (occasion, lang) =>
  lang === "pt" ? `/modelos/${occasion.slug.pt}` : `/templates/${occasion.slug.en}`;

const occasionShell = (occasion, lang) => {
  const copy = occasion[lang];
  const gallery = galleryCopy[lang];
  const related = occasions
    .filter((candidate) => candidate.slug.pt !== occasion.slug.pt)
    .slice(0, 3)
    .map(
      (candidate) =>
        `<a href="${occasionPath(candidate, lang)}">${escapeHtml(candidate[lang].label)}</a>`
    )
    .join(" ");
  return `<div class="seo-shell"><div class="wrap">
<p><a href="${gallery.path}">← ${escapeHtml(gallery.h1)}</a></p>
<h1>${escapeHtml(copy.h1)}</h1>
${copy.intro.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n")}
<p><a class="cta" href="/create?template=${occasion.slug[lang]}">${escapeHtml(gallery.use)}</a></p>
<h2>${lang === "pt" ? "Perguntas frequentes" : "Frequently asked questions"}</h2>
${copy.faq.map((item) => `<h3>${escapeHtml(item.q)}</h3>\n<p>${escapeHtml(item.a)}</p>`).join("\n")}
<h2>${lang === "pt" ? "Outras ocasiões" : "Other occasions"}</h2>
<p class="related">${related}</p>
</div></div>`;
};

const galleryShell = (lang) => {
  const gallery = galleryCopy[lang];
  const cards = occasions
    .map(
      (occasion) => `<h3><a href="${occasionPath(occasion, lang)}">${escapeHtml(
        occasion[lang].label
      )}</a></h3>
<p>${escapeHtml(occasion[lang].question)} — ${escapeHtml(occasion[lang].metaDescription)}</p>`
    )
    .join("\n");
  return `<div class="seo-shell"><div class="wrap">
<h1>${escapeHtml(gallery.h1)}</h1>
<p>${escapeHtml(gallery.subtitle)}</p>
${cards}
</div></div>`;
};

const faqJsonLd = (copy) =>
  jsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: copy.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  });

const writePage = (path, html) => {
  const dir = join(dist, ...path.split("/").filter(Boolean));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
};

let pages = 0;
for (const occasion of occasions) {
  for (const lang of ["pt", "en"]) {
    const copy = occasion[lang];
    const path = occasionPath(occasion, lang);
    const ptUrl = `${SITE}${occasionPath(occasion, "pt")}`;
    const enUrl = `${SITE}${occasionPath(occasion, "en")}`;
    let page = applyHead(template, {
      title: `${copy.title} — Only Yes`,
      description: copy.metaDescription,
      url: `${SITE}${path}`,
    });
    page = injectBeforeHeadEnd(
      page,
      `${SHELL_STYLE}\n  ${hreflang(ptUrl, enUrl)}\n  ${faqJsonLd(copy)}`
    );
    page = injectRootContent(page, occasionShell(occasion, lang));
    writePage(path, page);
    pages++;
  }
}

for (const lang of ["pt", "en"]) {
  const gallery = galleryCopy[lang];
  let page = applyHead(template, {
    title: gallery.title,
    description: gallery.description,
    url: `${SITE}${gallery.path}`,
  });
  page = injectBeforeHeadEnd(
    page,
    `${SHELL_STYLE}\n  ${hreflang(`${SITE}/modelos`, `${SITE}/templates`)}`
  );
  page = injectRootContent(page, galleryShell(lang));
  writePage(gallery.path, page);
  pages++;
}

const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: `${SITE}/`, priority: "1.0" },
  { loc: `${SITE}/create`, priority: "0.8" },
  { loc: `${SITE}/modelos`, priority: "0.8" },
  { loc: `${SITE}/templates`, priority: "0.8" },
  ...occasions.flatMap((occasion) => [
    { loc: `${SITE}${occasionPath(occasion, "pt")}`, priority: "0.7" },
    { loc: `${SITE}${occasionPath(occasion, "en")}`, priority: "0.7" },
  ]),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`).join("\n")}
</urlset>
`;
writeFileSync(join(dist, "sitemap.xml"), sitemap);

console.log(`prerender: ${pages} paginas + sitemap.xml com ${urls.length} URLs`);
