import { useMemo, useRef, useState } from "react"
import { FolderOpen, Boxes, RotateCcw, TerminalSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CommitGraphDiagram, type GraphCommit, type GraphRef } from "@/components/diagram/commit-graph-diagram"
import { initialState, run, type OutputLine, type SimState } from "@/lib/git-sim"
import { useSeo } from "@/hooks/use-seo"
import { cn } from "@/lib/utils"

const DESCRIPTION =
  "Run Git commands in the browser and watch the commit graph react — branch, commit, merge, and reset with nothing to install and nothing to break."

const SUGGESTIONS = [
  "git init",
  "git add .",
  'git commit -m "Initial commit"',
  "git switch -c feature",
  "touch login.js",
  "git merge feature",
  "git log",
  "git reset --hard HEAD~1",
]

const WELCOME: OutputLine[] = [
  { kind: "out", text: "A pretend repository with three files in it. Nothing here touches your machine." },
  { kind: "out", text: "Start with 'git init', or type 'help' for the full list of commands." },
]

function FileColumn({ title, sub, icon: Icon, files, tone }: {
  title: string
  sub: string
  icon: typeof FolderOpen
  files: string[]
  tone: "changed" | "staged"
}) {
  return (
    <div className="min-w-0 flex-1 rounded-xl border bg-card p-3.5">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">{title}</p>
          <p className="truncate text-[11px] text-muted-foreground">{sub}</p>
        </div>
      </div>
      <ul className="space-y-1.5">
        {files.map((file) => (
          <li
            key={file}
            className={cn(
              "rounded-md border px-2 py-1 font-mono-code text-[11px] text-foreground",
              tone === "changed" ? "border-destructive/30 bg-destructive/5" : "border-primary/30 bg-primary/5",
            )}
          >
            {file}
          </li>
        ))}
        {files.length === 0 ? <li className="text-[11px] text-muted-foreground/70">empty</li> : null}
      </ul>
    </div>
  )
}

export default function Playground() {
  const [state, setState] = useState<SimState>(initialState)
  const [lines, setLines] = useState<OutputLine[]>(WELCOME)
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [historyAt, setHistoryAt] = useState<number | null>(null)
  const scroller = useRef<HTMLDivElement>(null)

  useSeo({ title: "Git Playground", description: DESCRIPTION, path: "/playground" })

  const commits: GraphCommit[] = useMemo(
    () =>
      state.commits.map((commit) => ({
        id: commit.id,
        label: commit.id,
        lane: commit.lane,
        parents: commit.parents,
        tone: commit.parents.length > 1 ? ("merge" as const) : ("default" as const),
      })),
    [state.commits],
  )

  const graphRefs: GraphRef[] = useMemo(() => {
    const branches = Object.entries(state.refs).map(([name, at]) => ({ at, name }))
    const headAt = state.refs[state.head]
    return headAt ? [...branches, { at: headAt, name: "HEAD", tone: "head" as const }] : branches
  }, [state.refs, state.head])

  const laneLabels = useMemo(
    () => Object.fromEntries(Object.entries(state.lanes).map(([name, lane]) => [lane, name])),
    [state.lanes],
  )

  function submit(command: string) {
    const trimmed = command.trim()
    if (!trimmed) return
    setHistory((prev) => [...prev, trimmed])
    setHistoryAt(null)
    setInput("")

    if (trimmed === "clear") {
      setLines([])
      return
    }

    const result = run(state, trimmed)
    setState(result.state)
    setLines((prev) => [...prev, ...result.output])
    // Let the new lines land before scrolling to them.
    requestAnimationFrame(() => {
      scroller.current?.scrollTo({ top: scroller.current.scrollHeight })
    })
  }

  function recall(direction: -1 | 1) {
    if (!history.length) return
    const next =
      historyAt === null
        ? direction === -1
          ? history.length - 1
          : null
        : Math.min(history.length - 1, Math.max(0, historyAt + direction))
    setHistoryAt(next)
    setInput(next === null ? "" : history[next])
  }

  function reset() {
    setState(initialState())
    setLines(WELCOME)
    setInput("")
    setHistory([])
    setHistoryAt(null)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="border-b pb-6">
        <span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-primary uppercase">
          <TerminalSquare className="size-3.5" aria-hidden="true" />
          Playground
        </span>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
          Git Playground
        </h1>
        <p className="mt-3 text-base text-muted-foreground">{DESCRIPTION}</p>
      </header>

      <section className="mt-8 space-y-4">
        {commits.length > 0 ? (
          <CommitGraphDiagram
            commits={commits}
            refs={graphRefs}
            laneLabels={laneLabels}
            title="Your commit graph"
            static
          />
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No commits yet. Run <code className="font-mono-code text-foreground">git init</code>, then{" "}
            <code className="font-mono-code text-foreground">git add .</code> and{" "}
            <code className="font-mono-code text-foreground">git commit -m "first"</code> to draw the first dot.
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <FileColumn
            title="Working directory"
            sub="edited, not staged"
            icon={FolderOpen}
            files={state.changed}
            tone="changed"
          />
          <FileColumn
            title="Staging area"
            sub="going into the next commit"
            icon={Boxes}
            files={state.staged}
            tone="staged"
          />
        </div>

        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-4 py-2.5">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <TerminalSquare className="size-4 text-primary" aria-hidden="true" />
              {state.initialized ? `~/playground on ${state.head}` : "~/playground"}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs text-muted-foreground"
              onClick={reset}
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Reset
            </Button>
          </div>

          <div
            ref={scroller}
            className="h-72 overflow-y-auto bg-[#0d1117] px-4 py-3 font-mono-code text-[12.5px] leading-relaxed"
          >
            {lines.map((line, index) => (
              <div
                key={index}
                className={cn(
                  "whitespace-pre-wrap",
                  line.kind === "cmd" && "text-gray-100",
                  line.kind === "out" && "text-gray-400",
                  line.kind === "err" && "text-red-400",
                )}
              >
                {line.kind === "cmd" ? <span className="text-emerald-400">$ </span> : null}
                {line.text || " "}
              </div>
            ))}
          </div>

          <form
            className="flex items-center gap-2 border-t px-4 py-2.5"
            onSubmit={(event) => {
              event.preventDefault()
              submit(input)
            }}
          >
            <span className="font-mono-code text-sm text-primary" aria-hidden="true">
              $
            </span>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowUp") {
                  event.preventDefault()
                  recall(-1)
                } else if (event.key === "ArrowDown") {
                  event.preventDefault()
                  recall(1)
                }
              }}
              placeholder="git init"
              aria-label="Git command"
              autoComplete="off"
              spellCheck={false}
              className="h-8 w-full bg-transparent font-mono-code text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </form>
        </div>

        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((command) => (
            <button
              key={command}
              type="button"
              onClick={() => submit(command)}
              className="rounded-md border bg-card px-2.5 py-1 font-mono-code text-[11px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              {command}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
