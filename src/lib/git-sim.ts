/**
 * The tiny Git simulator behind /playground.
 *
 * ponytail: models refs and a commit DAG only — no file contents, no hunk-level
 * staging, no conflicts. Swap in isomorphic-git if the playground ever needs
 * real diffs or conflict practice.
 */

export interface SimCommit {
  id: string
  message: string
  parents: string[]
  /** 0 is the trunk; each new branch gets the next lane, for the graph */
  lane: number
}

export interface SimState {
  initialized: boolean
  /** in creation order — the graph draws them left to right */
  commits: SimCommit[]
  /** branch name -> commit id */
  refs: Record<string, string>
  /** branch name -> graph lane */
  lanes: Record<string, number>
  head: string
  tracked: string[]
  /** tracked-or-new files with pending changes */
  changed: string[]
  staged: string[]
}

export interface OutputLine {
  kind: "cmd" | "out" | "err"
  text: string
}

export const START_FILES = ["index.html", "styles.css", "app.js"]

export function initialState(): SimState {
  return {
    initialized: false,
    commits: [],
    refs: {},
    lanes: {},
    head: "main",
    tracked: [],
    changed: [...START_FILES],
    staged: [],
  }
}

/** Splits a command line, keeping quoted strings together. */
function tokenize(input: string): string[] {
  return (input.match(/"[^"]*"|'[^']*'|\S+/g) ?? []).map((token) => token.replace(/^["']|["']$/g, ""))
}

function commitById(state: SimState, id: string | undefined): SimCommit | undefined {
  return id ? state.commits.find((commit) => commit.id === id) : undefined
}

function nextId(state: SimState): string {
  // Deterministic and hash-looking, so the self-check can assert on output.
  return (((state.commits.length + 1) * 0x9e3779b1) % 0xfffffff).toString(16).padStart(7, "0").slice(0, 7)
}

/** Resolves HEAD, HEAD~2, HEAD^, a branch name, or a commit id. */
function resolveRev(state: SimState, rev: string): string | undefined {
  let base = rev
  let back = 0
  const tilde = /^(.+?)~(\d+)$/.exec(rev)
  const caret = /^(.+?)\^\d*$/.exec(rev)
  if (tilde) {
    base = tilde[1]
    back = Number(tilde[2])
  } else if (caret) {
    base = caret[1]
    back = 1
  }

  let id: string | undefined =
    base === "HEAD" ? state.refs[state.head] : (state.refs[base] ?? commitById(state, base)?.id)

  for (let i = 0; i < back && id; i++) {
    id = commitById(state, id)?.parents[0]
  }
  return id
}

/** Every commit reachable from `id`, including itself. */
function ancestors(state: SimState, id: string | undefined): Set<string> {
  const seen = new Set<string>()
  const queue = id ? [id] : []
  while (queue.length) {
    const current = queue.pop()!
    if (seen.has(current)) continue
    seen.add(current)
    queue.push(...(commitById(state, current)?.parents ?? []))
  }
  return seen
}

export interface RunResult {
  state: SimState
  output: OutputLine[]
}

const HELP = [
  "Available commands:",
  "  git init                      start a repository",
  "  git status                    what's in each of the three trees",
  "  git add <file> | .            stage changes",
  '  git commit -m "message"       record the staged changes',
  "  git branch [name]             list branches, or create one here",
  "  git switch [-c] <name>        move to a branch (-c creates it)",
  "  git merge <name>              merge a branch into the current one",
  "  git log                       history reachable from HEAD",
  "  git reset --hard <rev>        move the current branch (e.g. HEAD~1)",
  "  touch <file>                  create or modify a file",
  "  ls                            list files in the working directory",
  "  help / clear                  this list / empty the terminal",
]

export function run(state: SimState, input: string): RunResult {
  const line = input.trim()
  const echo: OutputLine = { kind: "cmd", text: line }
  if (!line) return { state, output: [] }

  const argv = tokenize(line)
  const out = (next: SimState, ...text: string[]): RunResult => ({
    state: next,
    output: [echo, ...text.map((t) => ({ kind: "out" as const, text: t }))],
  })
  const err = (...text: string[]): RunResult => ({
    state,
    output: [echo, ...text.map((t) => ({ kind: "err" as const, text: t }))],
  })

  if (argv[0] === "help") return out(state, ...HELP)
  if (argv[0] === "ls") {
    const files = [...new Set([...state.tracked, ...state.changed, ...state.staged])].sort()
    return out(state, files.length ? files.join("  ") : "(empty)")
  }
  if (argv[0] === "touch") {
    const name = argv[1]
    if (!name) return err("touch: missing file operand")
    if (state.changed.includes(name) || state.staged.includes(name)) {
      return out(state, `${name} already has pending changes`)
    }
    return out({ ...state, changed: [...state.changed, name] }, `${name} changed`)
  }
  if (argv[0] !== "git") {
    return err(`command not found: ${argv[0]}`, "Type 'help' to see what this playground understands.")
  }

  const sub = argv[1]
  if (!sub) return err("usage: git <command>", "Type 'help' for the list.")

  if (sub === "init") {
    if (state.initialized) return out(state, "Reinitialized existing Git repository in ~/playground/.git/")
    return out(
      { ...state, initialized: true, head: "main", lanes: { main: 0 } },
      "Initialized empty Git repository in ~/playground/.git/",
    )
  }

  if (!state.initialized) {
    return err("fatal: not a git repository (or any of the parent directories): .git", "Run 'git init' first.")
  }

  const tip = state.refs[state.head] as string | undefined

  switch (sub) {
    case "status": {
      const lines = [`On branch ${state.head}`]
      if (!tip) lines.push("", "No commits yet")
      const staged = state.staged
      const unstaged = state.changed.filter((file) => state.tracked.includes(file))
      const untracked = state.changed.filter((file) => !state.tracked.includes(file))

      if (staged.length) {
        lines.push("", "Changes to be committed:")
        lines.push(...staged.map((f) => `        ${state.tracked.includes(f) ? "modified:  " : "new file:  "} ${f}`))
      }
      if (unstaged.length) {
        lines.push("", "Changes not staged for commit:")
        lines.push(...unstaged.map((f) => `        modified:   ${f}`))
      }
      if (untracked.length) {
        lines.push("", "Untracked files:")
        lines.push(...untracked.map((f) => `        ${f}`))
      }
      if (!staged.length && !unstaged.length && !untracked.length) {
        lines.push("", "nothing to commit, working tree clean")
      }
      return out(state, ...lines)
    }

    case "add": {
      const target = argv[2]
      if (!target) return err("Nothing specified, nothing added.", 'hint: maybe you wanted "git add ."?')
      if (target === "." || target === "-A") {
        if (!state.changed.length) return out(state, "(nothing to stage)")
        return out({ ...state, staged: [...state.staged, ...state.changed], changed: [] })
      }
      if (!state.changed.includes(target)) {
        return err(`fatal: pathspec '${target}' did not match any files`)
      }
      return out({
        ...state,
        staged: [...state.staged, target],
        changed: state.changed.filter((f) => f !== target),
      })
    }

    case "commit": {
      const flag = argv.indexOf("-m")
      const message = flag === -1 ? undefined : argv[flag + 1]
      if (!message) return err("error: switch `m' requires a value", 'Try: git commit -m "your message"')
      if (!state.staged.length) {
        return err("nothing to commit, working tree clean", "hint: stage something first with 'git add .'")
      }
      const commit: SimCommit = {
        id: nextId(state),
        message,
        parents: tip ? [tip] : [],
        lane: state.lanes[state.head] ?? 0,
      }
      const next: SimState = {
        ...state,
        commits: [...state.commits, commit],
        refs: { ...state.refs, [state.head]: commit.id },
        tracked: [...new Set([...state.tracked, ...state.staged])],
        staged: [],
      }
      const count = state.staged.length
      return out(
        next,
        `[${state.head}${tip ? "" : " (root-commit)"} ${commit.id}] ${message}`,
        ` ${count} file${count === 1 ? "" : "s"} changed`,
      )
    }

    case "branch": {
      const name = argv[2]
      if (!name) {
        const names = Object.keys(state.refs).length ? Object.keys(state.lanes) : [state.head]
        return out(state, ...names.map((n) => `${n === state.head ? "* " : "  "}${n}`))
      }
      if (state.lanes[name] !== undefined) return err(`fatal: a branch named '${name}' already exists`)
      if (!tip) return err(`fatal: not a valid object name: '${state.head}'`, "hint: make a commit first.")
      const lane = Math.max(...Object.values(state.lanes)) + 1
      return out({
        ...state,
        refs: { ...state.refs, [name]: tip },
        lanes: { ...state.lanes, [name]: lane },
      })
    }

    case "switch":
    case "checkout": {
      const create = argv.includes("-c") || argv.includes("-b")
      const name = argv[argv.length - 1]
      if (!name || name === "-c" || name === "-b") return err("fatal: missing branch name")
      if (create) {
        if (state.lanes[name] !== undefined) return err(`fatal: a branch named '${name}' already exists`)
        const lane = Object.keys(state.lanes).length ? Math.max(...Object.values(state.lanes)) + 1 : 0
        return out(
          {
            ...state,
            head: name,
            lanes: { ...state.lanes, [name]: lane },
            refs: tip ? { ...state.refs, [name]: tip } : state.refs,
          },
          `Switched to a new branch '${name}'`,
        )
      }
      if (state.lanes[name] === undefined) return err(`fatal: invalid reference: ${name}`)
      if (name === state.head) return out(state, `Already on '${name}'`)
      return out({ ...state, head: name }, `Switched to branch '${name}'`)
    }

    case "merge": {
      const name = argv[2]
      if (!name) return err("fatal: no branch specified")
      if (name === state.head) return out(state, "Already up to date.")
      const other = state.refs[name]
      if (other === undefined) return err(`merge: ${name} - not something we can merge`)
      if (!tip) return err(`fatal: ${state.head} does not point at a commit yet`)

      if (ancestors(state, tip).has(other)) return out(state, "Already up to date.")

      if (ancestors(state, other).has(tip)) {
        return out(
          { ...state, refs: { ...state.refs, [state.head]: other } },
          `Updating ${tip}..${other}`,
          "Fast-forward",
        )
      }

      const commit: SimCommit = {
        id: nextId(state),
        message: `Merge branch '${name}'`,
        parents: [tip, other],
        lane: state.lanes[state.head] ?? 0,
      }
      return out(
        {
          ...state,
          commits: [...state.commits, commit],
          refs: { ...state.refs, [state.head]: commit.id },
        },
        "Merge made by the 'ort' strategy.",
      )
    }

    case "log": {
      if (!tip) return err(`fatal: your current branch '${state.head}' does not have any commits yet`)
      const reachable = ancestors(state, tip)
      const lines = state.commits
        .filter((commit) => reachable.has(commit.id))
        .reverse()
        .map((commit) => {
          const labels = Object.keys(state.refs).filter((name) => state.refs[name] === commit.id)
          const decoration = labels.length ? ` (${labels.map((l) => (l === state.head ? `HEAD -> ${l}` : l)).join(", ")})` : ""
          return `${commit.id}${decoration} ${commit.message}`
        })
      return out(state, ...lines)
    }

    case "reset": {
      const rev = argv[argv.length - 1]
      const hard = argv.includes("--hard")
      if (!rev || rev === "reset" || rev.startsWith("--")) return err("usage: git reset --hard <rev>")
      const target = resolveRev(state, rev)
      if (!target) return err(`fatal: ambiguous argument '${rev}': unknown revision`)
      const commit = commitById(state, target)!
      return out(
        {
          ...state,
          refs: { ...state.refs, [state.head]: target },
          staged: hard ? [] : state.staged,
          changed: hard ? [] : state.changed,
        },
        `HEAD is now at ${commit.id} ${commit.message}`,
      )
    }

    default:
      return err(
        `git: '${sub}' is not a git command that this playground understands.`,
        "Type 'help' to see the list.",
      )
  }
}
