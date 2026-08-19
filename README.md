# Git & GitHub Learn

A free, interactive Git and GitHub course — 40 lessons with visual commit graphs,
runnable command examples, quizzes with saved progress, and a searchable bank of
62 interview questions.

Built with the same scaffold as the React and Spring Boot courses: Vite, React 19,
TypeScript, Tailwind 4, Radix primitives, Framer Motion, and React Router.

## Running it

```bash
npm install
npm run dev
```

Open http://localhost:5174.

## Scripts

| Script                     | What it does                                          |
| -------------------------- | ----------------------------------------------------- |
| `npm run dev`              | Dev server with HMR                                    |
| `npm run build`            | Regenerates the sitemap, type-checks, and builds       |
| `npm run preview`          | Serves the production build locally                    |
| `npm run generate:sitemap` | Rewrites `public/sitemap.xml` from the lesson list     |
| `npm run lint`             | Oxlint                                                 |

## Structure

```
src/
├── lessons/            40 lesson components, lazily loaded
├── lib/
│   ├── lessons-data.tsx      curriculum index: slugs, sections, icons, order
│   ├── interview-questions.ts the 62-question bank
│   ├── interview-simple.ts    plain-English version of every answer
│   └── site-config.ts         SITE_URL, name, default meta description
├── components/
│   ├── diagram/        commit-graph-diagram, three-trees-diagram, step-flow-diagram
│   ├── lesson/         callout, quiz, code-block, code-walkthrough, terminal-demo,
│   │                   merge-conflict-demo, challenge, key-takeaways, …
│   ├── layout/         topbar, sidebar-nav, command palette (⌘K), app shell
│   └── ui/             Radix-based primitives
├── context/            theme (dark/light) and progress (localStorage)
└── pages/              home, lesson-page, interview-questions, not-found
```

## Adding a lesson

1. Create `src/lessons/NN-slug.tsx` exporting a default component.
2. Add an entry to `lessonDefinitions` in `src/lib/lessons-data.tsx` — slug,
   order, section, titles, description, a `lucide-react` icon, minutes, and the
   dynamic `load` import.
3. Run `npm run build` (the sitemap regenerates automatically).

The sidebar, home page outline, command palette, prev/next footer links, and
progress totals all read from `lessons-data.tsx`, so nothing else needs touching.

## Deployment

`vercel.json` rewrites every path to `index.html` for client-side routing. After
attaching a custom domain, update `SITE_URL` in `src/lib/site-config.ts` and
`public/robots.txt`, then re-run `npm run generate:sitemap`.
