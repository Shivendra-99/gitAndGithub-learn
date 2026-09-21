// Every public route, with the title and description that route renders.
//
// Both the sitemap and the prerender step read from here, so a lesson added to
// lessons-data.tsx shows up in both without touching either script. The page
// metadata is parsed out of the source rather than duplicated — every parse
// throws if it finds nothing, so a rename breaks the build instead of silently
// shipping stale meta tags (which is the exact bug prerendering exists to fix).
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

function read(file) {
  return readFileSync(path.join(root, file), "utf-8")
}

function match(source, pattern, what) {
  const found = pattern.exec(source)
  if (!found) throw new Error(`routes: couldn't find ${what} — check the regex against the source`)
  return found[1]
}

const siteConfig = read("src/lib/site-config.ts")

export const SITE_URL = process.env.SITE_URL || match(siteConfig, /SITE_URL\s*=\s*"([^"]+)"/, "SITE_URL")
export const SITE_NAME = match(siteConfig, /SITE_NAME\s*=\s*"([^"]+)"/, "SITE_NAME")
export const DEFAULT_DESCRIPTION = match(
  siteConfig,
  /DEFAULT_DESCRIPTION\s*=\s*\n?\s*"([^"]+)"/,
  "DEFAULT_DESCRIPTION",
)
export const OG_IMAGE = `${SITE_URL}/og-image.png`

/** The title useSeo() passes for a page, e.g. "Git Playground". */
function seoTitle(file) {
  return match(read(file), /useSeo\(\{[\s\S]*?title:\s*"([^"]+)"/, `useSeo title in ${file}`)
}

/** The page-level DESCRIPTION constant. */
function pageDescription(file) {
  return match(read(file), /const DESCRIPTION =\s*\n?\s*"([^"]+)"/, `DESCRIPTION in ${file}`)
}

function lessonRoutes() {
  const source = read("src/lib/lessons-data.tsx")
  // Field order in each entry is slug → … → title → shortTitle → description.
  // `title:` is lowercase so it can't match `shortTitle:`.
  const pattern = /slug:\s*"([^"]+)"[\s\S]*?\btitle:\s*"([^"]+)"[\s\S]*?description:\s*"([^"]*)"/g
  const routes = [...source.matchAll(pattern)].map(([, slug, title, description]) => ({
    path: `/lessons/${slug}`,
    title,
    description,
    changefreq: "monthly",
    priority: "0.8",
  }))
  if (routes.length === 0) {
    throw new Error("routes: found no lessons — check the regex against lessons-data.tsx")
  }
  return routes
}

export const routes = [
  {
    path: "/",
    title: seoTitle("src/pages/home.tsx"),
    description: DEFAULT_DESCRIPTION,
    changefreq: "weekly",
    priority: "1.0",
  },
  {
    path: "/interview-questions",
    title: seoTitle("src/pages/interview-questions.tsx"),
    description: pageDescription("src/pages/interview-questions.tsx"),
    changefreq: "monthly",
    priority: "0.9",
  },
  {
    path: "/playground",
    title: seoTitle("src/pages/playground.tsx"),
    description: pageDescription("src/pages/playground.tsx"),
    changefreq: "monthly",
    priority: "0.9",
  },
  ...lessonRoutes(),
]

/** Exactly what useSeo() puts in document.title, so the static HTML matches. */
export function fullTitle(route) {
  return `${route.title} · ${SITE_NAME}`
}
