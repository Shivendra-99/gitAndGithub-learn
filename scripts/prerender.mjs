// Writes a static HTML file per route after `vite build`, each carrying that
// route's real title, description, canonical and OG tags.
//
// Why: this is a client-rendered SPA, so useSeo() only sets those tags after
// React hydrates. Googlebot runs JS and sees them; link-preview scrapers
// (Slack, WhatsApp, LinkedIn, X, Discord, iMessage) do not, so without this
// every shared URL previews as the same generic index.html. Vercel serves a
// matching file from the filesystem before applying the SPA rewrite, and React
// Router takes over on hydration, so the app behaves exactly as before.
//
// ponytail: swaps meta tags only, no JSON-LD and no rendered body — scrapers
// don't read either, and Googlebot renders the page for the rest. Reach for a
// real SSG (vike, react-router SSR) if the body ever needs to be in the HTML.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { routes, fullTitle, SITE_URL, OG_IMAGE } from "./routes.mjs"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const dist = path.join(root, "dist")

const template = readFileSync(path.join(dist, "index.html"), "utf-8")

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/** Replaces one tag's content, and fails loudly if the tag isn't in index.html. */
function replace(html, pattern, replacement, what) {
  if (!pattern.test(html)) {
    throw new Error(`prerender: no ${what} in dist/index.html — did the template change?`)
  }
  return html.replace(pattern, replacement)
}

function pageFor(route) {
  const title = escapeHtml(fullTitle(route))
  const description = escapeHtml(route.description)
  const url = `${SITE_URL}${route.path}`

  let html = template
  html = replace(html, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`, "<title>")
  html = replace(
    html,
    /<meta\s+name="description"\s+content="[\s\S]*?"\s*\/?>/,
    `<meta name="description" content="${description}" />`,
    "meta description",
  )
  html = replace(
    html,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${url}" />`,
    "canonical link",
  )

  for (const [attr, key, value] of [
    ["property", "og:title", title],
    ["property", "og:description", description],
    ["property", "og:url", url],
    ["property", "og:image", OG_IMAGE],
    ["name", "twitter:title", title],
    ["name", "twitter:description", description],
    ["name", "twitter:image", OG_IMAGE],
  ]) {
    html = replace(
      html,
      new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[\\s\\S]*?"\\s*/?>`),
      `<meta ${attr}="${key}" content="${value}" />`,
      `${key} tag`,
    )
  }

  return html
}

let written = 0
for (const route of routes) {
  const html = pageFor(route)

  if (route.path === "/") {
    writeFileSync(path.join(dist, "index.html"), html)
    written++
    continue
  }

  // Written twice on purpose: "/lessons/x.html" covers hosts that resolve an
  // extensionless path by appending .html, "/lessons/x/index.html" covers
  // hosts that resolve it as a directory index. Whichever one the host picks,
  // the SPA rewrite in vercel.json is never reached — and getting this wrong
  // fails silently, with previews staying broken. 2KB each is cheap insurance.
  const file = path.join(dist, `${route.path}.html`)
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, html)

  const dir = path.join(dist, route.path)
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, "index.html"), html)
  written++
}

console.log(`prerender: wrote ${written} static HTML files with per-route meta tags`)
