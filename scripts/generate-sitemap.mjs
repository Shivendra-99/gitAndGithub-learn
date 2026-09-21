// Regenerates public/sitemap.xml from the route list in scripts/routes.mjs.
// Runs automatically as part of `npm run build`; run it by hand with
// `npm run generate:sitemap` after changing lessons or the site URL.
import { writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { routes, SITE_URL } from "./routes.mjs"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const today = new Date().toISOString().slice(0, 10)

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) =>
      `  <url>\n    <loc>${SITE_URL}${route.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`,
  )
  .join("\n")}
</urlset>
`

writeFileSync(path.join(root, "public/sitemap.xml"), xml)
console.log(`generate-sitemap: wrote public/sitemap.xml with ${routes.length} URLs`)
