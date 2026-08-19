import { lazy, type ComponentType } from "react"
import type { LucideIcon } from "lucide-react"
import {
  Rewind,
  GitBranch,
  Settings2,
  Database,
  Layers,
  FolderGit2,
  GitCommitHorizontal,
  FileDiff,
  ScrollText,
  EyeOff,
  MessageSquareText,
  Archive,
  GitGraph,
  Signpost,
  GitMerge,
  OctagonAlert,
  RefreshCw,
  GitCompareArrows,
  Cloud,
  CloudUpload,
  Cable,
  KeyRound,
  GitFork,
  Undo2,
  Pencil,
  RotateCcw,
  ListFilter,
  LifeBuoy,
  Globe,
  Rocket,
  FileText,
  CircleDot,
  GitPullRequest,
  MessagesSquare,
  Workflow,
  Tag,
  Network,
  ShieldCheck,
  Wrench,
  ClipboardCheck,
} from "lucide-react"

export type Section =
  | "foundations"
  | "basics"
  | "branching"
  | "remotes"
  | "undo"
  | "github"
  | "workflow"

export const SECTIONS: Record<Section, string> = {
  foundations: "Version Control Foundations",
  basics: "Everyday Git",
  branching: "Branching & Merging",
  remotes: "Remotes & Collaboration",
  undo: "Undo, Fix & Recover",
  github: "The GitHub Platform",
  workflow: "Team Workflow & Pro Habits",
}

interface LessonDefinition {
  slug: string
  order: number
  section: Section
  title: string
  shortTitle: string
  description: string
  icon: LucideIcon
  minutes: number
  /**
   * The raw dynamic import. Kept separate from `component` so it can also be
   * called on its own to warm the chunk before navigation — see prefetchLesson.
   */
  load: () => Promise<{ default: ComponentType }>
}

export interface Lesson extends LessonDefinition {
  component: ComponentType
}

const lessonDefinitions: LessonDefinition[] = [
  // ----------------------------------------------------------------- foundations
  {
    slug: "why-version-control",
    order: 1,
    section: "foundations",
    title: "Why Version Control Exists",
    shortTitle: "Why Version Control",
    description: "The problem Git was invented to solve, and why final-v2-FINAL-real.zip isn't a solution.",
    icon: Rewind,
    minutes: 6,
    load: () => import("@/lessons/01-why-version-control"),
  },
  {
    slug: "what-is-git",
    order: 2,
    section: "foundations",
    title: "What Is Git?",
    shortTitle: "What Is Git?",
    description: "What Git actually is, what it isn't, and how it differs from GitHub.",
    icon: GitBranch,
    minutes: 7,
    load: () => import("@/lessons/02-what-is-git"),
  },
  {
    slug: "installing-and-configuring-git",
    order: 3,
    section: "foundations",
    title: "Installing & Configuring Git",
    shortTitle: "Install & Configure",
    description: "Get Git running and set the handful of config values that save you pain later.",
    icon: Settings2,
    minutes: 8,
    load: () => import("@/lessons/03-installing-and-configuring-git"),
  },
  {
    slug: "how-git-stores-data",
    order: 4,
    section: "foundations",
    title: "How Git Stores Your Work",
    shortTitle: "How Git Stores Data",
    description: "Snapshots, not diffs — and what that hash next to every commit really is.",
    icon: Database,
    minutes: 10,
    load: () => import("@/lessons/04-how-git-stores-data"),
  },
  {
    slug: "the-three-trees",
    order: 5,
    section: "foundations",
    title: "The Three Trees: Working Directory, Staging Area, Repository",
    shortTitle: "The Three Trees",
    description: "The one mental model that makes every Git command make sense.",
    icon: Layers,
    minutes: 10,
    load: () => import("@/lessons/05-the-three-trees"),
  },

  // ---------------------------------------------------------------------- basics
  {
    slug: "init-and-clone",
    order: 6,
    section: "basics",
    title: "Starting a Repository: init & clone",
    shortTitle: "init & clone",
    description: "The two ways every project begins, and what lands on disk when they run.",
    icon: FolderGit2,
    minutes: 8,
    load: () => import("@/lessons/06-init-and-clone"),
  },
  {
    slug: "staging-and-committing",
    order: 7,
    section: "basics",
    title: "Staging & Committing Changes",
    shortTitle: "Staging & Committing",
    description: "git add and git commit — the loop you'll run thousands of times.",
    icon: GitCommitHorizontal,
    minutes: 10,
    load: () => import("@/lessons/07-staging-and-committing"),
  },
  {
    slug: "status-and-diff",
    order: 8,
    section: "basics",
    title: "Seeing What Changed: status & diff",
    shortTitle: "status & diff",
    description: "Read the two commands that answer 'what am I about to commit?'",
    icon: FileDiff,
    minutes: 9,
    load: () => import("@/lessons/08-status-and-diff"),
  },
  {
    slug: "reading-history",
    order: 9,
    section: "basics",
    title: "Reading History with git log",
    shortTitle: "Reading History",
    description: "Find when a line changed, who changed it, and which commit introduced a bug.",
    icon: ScrollText,
    minutes: 10,
    load: () => import("@/lessons/09-reading-history"),
  },
  {
    slug: "gitignore",
    order: 10,
    section: "basics",
    title: "Ignoring Files with .gitignore",
    shortTitle: ".gitignore",
    description: "Keep secrets, build output, and node_modules out of your history — and fix it if they got in.",
    icon: EyeOff,
    minutes: 9,
    load: () => import("@/lessons/10-gitignore"),
  },
  {
    slug: "commit-messages",
    order: 11,
    section: "basics",
    title: "Writing Commit Messages That Help",
    shortTitle: "Commit Messages",
    description: "What to write so that future-you (and your reviewer) can follow the story.",
    icon: MessageSquareText,
    minutes: 8,
    load: () => import("@/lessons/11-commit-messages"),
  },
  {
    slug: "stashing",
    order: 12,
    section: "basics",
    title: "Stashing Work in Progress",
    shortTitle: "Stashing",
    description: "Park half-finished work safely when something urgent jumps the queue.",
    icon: Archive,
    minutes: 7,
    load: () => import("@/lessons/12-stashing"),
  },

  // ------------------------------------------------------------------- branching
  {
    slug: "branches-explained",
    order: 13,
    section: "branching",
    title: "Branches Are Just Pointers",
    shortTitle: "Branches Explained",
    description: "Why branching in Git is instant, and what HEAD actually points at.",
    icon: GitGraph,
    minutes: 10,
    load: () => import("@/lessons/13-branches-explained"),
  },
  {
    slug: "creating-and-switching-branches",
    order: 14,
    section: "branching",
    title: "Creating & Switching Branches",
    shortTitle: "Create & Switch",
    description: "switch, checkout, and what happens to your uncommitted changes when you move.",
    icon: Signpost,
    minutes: 9,
    load: () => import("@/lessons/14-creating-and-switching-branches"),
  },
  {
    slug: "merging",
    order: 15,
    section: "branching",
    title: "Merging Branches",
    shortTitle: "Merging",
    description: "Fast-forward vs three-way merges, and how to read the graph they leave behind.",
    icon: GitMerge,
    minutes: 11,
    load: () => import("@/lessons/15-merging"),
  },
  {
    slug: "merge-conflicts",
    order: 16,
    section: "branching",
    title: "Resolving Merge Conflicts",
    shortTitle: "Merge Conflicts",
    description: "What those <<<<<<< markers mean and how to finish a conflicted merge calmly.",
    icon: OctagonAlert,
    minutes: 12,
    load: () => import("@/lessons/16-merge-conflicts"),
  },
  {
    slug: "rebasing",
    order: 17,
    section: "branching",
    title: "Rebasing: Replaying Your Work",
    shortTitle: "Rebasing",
    description: "Move your commits onto a new base for a straight, readable history.",
    icon: RefreshCw,
    minutes: 12,
    load: () => import("@/lessons/17-rebasing"),
  },
  {
    slug: "merge-vs-rebase",
    order: 18,
    section: "branching",
    title: "Merge vs Rebase: Choosing One",
    shortTitle: "Merge vs Rebase",
    description: "The trade-off, the golden rule, and what most teams actually do.",
    icon: GitCompareArrows,
    minutes: 9,
    load: () => import("@/lessons/18-merge-vs-rebase"),
  },

  // --------------------------------------------------------------------- remotes
  {
    slug: "remotes-explained",
    order: 19,
    section: "remotes",
    title: "Remotes: What origin Really Is",
    shortTitle: "Remotes Explained",
    description: "A remote is just a nickname for a URL — and remote-tracking branches are local.",
    icon: Cloud,
    minutes: 9,
    load: () => import("@/lessons/19-remotes-explained"),
  },
  {
    slug: "push-fetch-pull",
    order: 20,
    section: "remotes",
    title: "push, fetch & pull",
    shortTitle: "push, fetch & pull",
    description: "Three commands, one direction each — and why pull is really two commands.",
    icon: CloudUpload,
    minutes: 11,
    load: () => import("@/lessons/20-push-fetch-pull"),
  },
  {
    slug: "tracking-branches",
    order: 21,
    section: "remotes",
    title: "Tracking Branches & Upstream",
    shortTitle: "Tracking Branches",
    description: "Why Git says 'no upstream branch', and what -u actually sets.",
    icon: Cable,
    minutes: 8,
    load: () => import("@/lessons/21-tracking-branches"),
  },
  {
    slug: "ssh-and-authentication",
    order: 22,
    section: "remotes",
    title: "Authentication: SSH Keys & Tokens",
    shortTitle: "SSH & Auth",
    description: "Set up SSH once, understand personal access tokens, and stop typing passwords.",
    icon: KeyRound,
    minutes: 10,
    load: () => import("@/lessons/22-ssh-and-authentication"),
  },
  {
    slug: "forks-and-syncing",
    order: 23,
    section: "remotes",
    title: "Forks & Keeping Them in Sync",
    shortTitle: "Forks & Syncing",
    description: "The open-source contribution loop: fork, branch, PR, and stay up to date.",
    icon: GitFork,
    minutes: 10,
    load: () => import("@/lessons/23-forks-and-syncing"),
  },

  // ------------------------------------------------------------------------ undo
  {
    slug: "undoing-uncommitted-changes",
    order: 24,
    section: "undo",
    title: "Undoing Uncommitted Changes",
    shortTitle: "Undo Uncommitted",
    description: "Throw away edits, unstage files, and know which of those is unrecoverable.",
    icon: Undo2,
    minutes: 9,
    load: () => import("@/lessons/24-undoing-uncommitted-changes"),
  },
  {
    slug: "amending-commits",
    order: 25,
    section: "undo",
    title: "Amending the Last Commit",
    shortTitle: "Amending Commits",
    description: "Fix the message or add the file you forgot — and when amending is unsafe.",
    icon: Pencil,
    minutes: 8,
    load: () => import("@/lessons/25-amending-commits"),
  },
  {
    slug: "reset-revert-restore",
    order: 26,
    section: "undo",
    title: "reset vs revert vs restore",
    shortTitle: "reset / revert / restore",
    description: "Three undo commands that do very different things. Pick the right one.",
    icon: RotateCcw,
    minutes: 12,
    load: () => import("@/lessons/26-reset-revert-restore"),
  },
  {
    slug: "interactive-rebase",
    order: 27,
    section: "undo",
    title: "Cleaning History with Interactive Rebase",
    shortTitle: "Interactive Rebase",
    description: "Squash, reword, drop, and reorder commits before anyone else sees them.",
    icon: ListFilter,
    minutes: 12,
    load: () => import("@/lessons/27-interactive-rebase"),
  },
  {
    slug: "reflog-and-recovery",
    order: 28,
    section: "undo",
    title: "git reflog: Recovering Lost Work",
    shortTitle: "reflog & Recovery",
    description: "The safety net almost nobody knows about, until the day it saves them.",
    icon: LifeBuoy,
    minutes: 9,
    load: () => import("@/lessons/28-reflog-and-recovery"),
  },

  // ---------------------------------------------------------------------- github
  {
    slug: "what-is-github",
    order: 29,
    section: "github",
    title: "What GitHub Adds on Top of Git",
    shortTitle: "What Is GitHub?",
    description: "Git is the tool; GitHub is the place teams do the work around it.",
    icon: Globe,
    minutes: 7,
    load: () => import("@/lessons/29-what-is-github"),
  },
  {
    slug: "creating-and-pushing-a-repo",
    order: 30,
    section: "github",
    title: "Creating a Repo and Pushing Your Code",
    shortTitle: "Create & Push a Repo",
    description: "Local project to a live GitHub repository, without the 'rejected' errors.",
    icon: Rocket,
    minutes: 9,
    load: () => import("@/lessons/30-creating-and-pushing-a-repo"),
  },
  {
    slug: "readme-and-repo-files",
    order: 31,
    section: "github",
    title: "READMEs, Licenses & Repo Hygiene",
    shortTitle: "README & Repo Files",
    description: "The files that decide whether anyone can use — or trust — your project.",
    icon: FileText,
    minutes: 9,
    load: () => import("@/lessons/31-readme-and-repo-files"),
  },
  {
    slug: "issues-and-tracking",
    order: 32,
    section: "github",
    title: "Issues, Labels & Projects",
    shortTitle: "Issues & Tracking",
    description: "Track work where the code lives, and close issues automatically from commits.",
    icon: CircleDot,
    minutes: 9,
    load: () => import("@/lessons/32-issues-and-tracking"),
  },
  {
    slug: "pull-requests",
    order: 33,
    section: "github",
    title: "Pull Requests End to End",
    shortTitle: "Pull Requests",
    description: "Open, update, and merge a PR — and choose between merge, squash, and rebase.",
    icon: GitPullRequest,
    minutes: 12,
    load: () => import("@/lessons/33-pull-requests"),
  },
  {
    slug: "code-review",
    order: 34,
    section: "github",
    title: "Reviewing Code Well",
    shortTitle: "Code Review",
    description: "How to review so people act on your comments, and how to receive a review.",
    icon: MessagesSquare,
    minutes: 10,
    load: () => import("@/lessons/34-code-review"),
  },
  {
    slug: "github-actions",
    order: 35,
    section: "github",
    title: "Automating with GitHub Actions",
    shortTitle: "GitHub Actions",
    description: "Run tests on every push with a workflow file you can actually read.",
    icon: Workflow,
    minutes: 13,
    load: () => import("@/lessons/35-github-actions"),
  },
  {
    slug: "releases-and-pages",
    order: 36,
    section: "github",
    title: "Tags, Releases & GitHub Pages",
    shortTitle: "Releases & Pages",
    description: "Mark a version, ship release notes, and host a site straight from a repo.",
    icon: Tag,
    minutes: 10,
    load: () => import("@/lessons/36-releases-and-pages"),
  },

  // -------------------------------------------------------------------- workflow
  {
    slug: "branching-strategies",
    order: 37,
    section: "workflow",
    title: "Branching Strategies That Scale",
    shortTitle: "Branching Strategies",
    description: "Git Flow, GitHub Flow, and trunk-based development — and which fits your team.",
    icon: Network,
    minutes: 11,
    load: () => import("@/lessons/37-branching-strategies"),
  },
  {
    slug: "protecting-main",
    order: 38,
    section: "workflow",
    title: "Protecting main",
    shortTitle: "Protecting main",
    description: "Branch protection, required checks, and CODEOWNERS — guardrails, not bureaucracy.",
    icon: ShieldCheck,
    minutes: 9,
    load: () => import("@/lessons/38-protecting-main"),
  },
  {
    slug: "git-config-and-aliases",
    order: 39,
    section: "workflow",
    title: "Config, Aliases & Ergonomics",
    shortTitle: "Config & Aliases",
    description: "Small settings that remove daily friction, including the ones that prevent mistakes.",
    icon: Wrench,
    minutes: 9,
    load: () => import("@/lessons/39-git-config-and-aliases"),
  },
  {
    slug: "git-troubleshooting",
    order: 40,
    section: "workflow",
    title: "Troubleshooting Cheat Sheet",
    shortTitle: "Troubleshooting",
    description: "The errors and 'oh no' moments you'll actually hit, with the fix for each.",
    icon: ClipboardCheck,
    minutes: 12,
    load: () => import("@/lessons/40-git-troubleshooting"),
  },
]

export const lessons: Lesson[] = lessonDefinitions.map((definition) => ({
  ...definition,
  component: lazy(definition.load),
}))

const prefetched = new Set<string>()

/**
 * Warms a lesson's chunk ahead of navigation, e.g. on link hover. The module
 * registry dedupes the import, so the lazy() component later resolves from the
 * already-fetched module instead of waiting on a fresh network round trip.
 */
export function prefetchLesson(slug: string) {
  if (prefetched.has(slug)) return
  const lesson = lessons.find((item) => item.slug === slug)
  if (!lesson) return
  prefetched.add(slug)
  // A failed prefetch is not worth surfacing — navigation will retry the import
  // and show the real error through Suspense.
  void lesson.load().catch(() => prefetched.delete(slug))
}

export function getLessonBySlug(slug: string | undefined) {
  return lessons.find((lesson) => lesson.slug === slug)
}

export function getAdjacentLessons(slug: string) {
  const index = lessons.findIndex((lesson) => lesson.slug === slug)
  return {
    previous: index > 0 ? lessons[index - 1] : undefined,
    next: index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : undefined,
  }
}

export function getLessonsBySection() {
  return (Object.keys(SECTIONS) as Section[]).map((section) => ({
    section,
    label: SECTIONS[section],
    lessons: lessons.filter((lesson) => lesson.section === section),
  }))
}
