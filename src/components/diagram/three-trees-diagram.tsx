import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { FileText, FolderOpen, Boxes, Database, Cloud, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Stage = "working" | "staging" | "local" | "remote"

interface TrackedFile {
  name: string
  stage: Stage
}

const STAGES: Array<{ id: Stage; label: string; sub: string; icon: typeof FolderOpen }> = [
  { id: "working", label: "Working directory", sub: "the files you edit", icon: FolderOpen },
  { id: "staging", label: "Staging area", sub: "what the next commit will contain", icon: Boxes },
  { id: "local", label: "Local repository", sub: ".git — your commit history", icon: Database },
  { id: "remote", label: "Remote", sub: "GitHub", icon: Cloud },
]

const INITIAL: TrackedFile[] = [
  { name: "index.html", stage: "working" },
  { name: "styles.css", stage: "working" },
  { name: "app.js", stage: "working" },
]

/**
 * The mental model that makes Git click: a change moves through four places,
 * and each command moves it exactly one step. Almost every beginner question
 * ("why didn't my change show up on GitHub?") is really a question about which
 * of these four boxes the change is sitting in.
 */
export function ThreeTreesDiagram() {
  const prefersReducedMotion = useReducedMotion()
  const [files, setFiles] = useState<TrackedFile[]>(INITIAL)
  const [log, setLog] = useState<string[]>([])

  function move(from: Stage, to: Stage, command: string) {
    setFiles((prev) => prev.map((file) => (file.stage === from ? { ...file, stage: to } : file)))
    setLog((prev) => [...prev, command])
  }

  const countIn = (stage: Stage) => files.filter((file) => file.stage === stage).length

  const canAdd = countIn("working") > 0
  const canCommit = countIn("staging") > 0
  const canPush = countIn("local") > 0

  return (
    <div className="not-prose overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-4 py-2.5">
        <p className="text-sm font-medium text-foreground">Where does my change live right now?</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-muted-foreground"
          onClick={() => {
            setFiles(INITIAL)
            setLog([])
          }}
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Reset
        </Button>
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
        {STAGES.map((stage) => {
          const Icon = stage.icon
          const inStage = files.filter((file) => file.stage === stage.id)
          return (
            <div key={stage.id} className="min-h-32 bg-card p-3.5">
              <div className="mb-2 flex items-center gap-2">
                <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-foreground">{stage.label}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{stage.sub}</p>
                </div>
              </div>
              <ul className="space-y-1.5">
                <AnimatePresence mode="popLayout">
                  {inStage.map((file) => (
                    <motion.li
                      key={file.name}
                      layout={!prefersReducedMotion}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, y: 6 }}
                      transition={{ duration: 0.22 }}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono-code text-[11px]",
                        stage.id === "working" && "border-destructive/30 bg-destructive/5 text-foreground",
                        stage.id === "staging" && "border-primary/30 bg-primary/5 text-foreground",
                        stage.id === "local" && "border-success/30 bg-success/10 text-foreground",
                        stage.id === "remote" && "border-success/40 bg-success/15 text-foreground",
                      )}
                    >
                      <FileText className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
                      {file.name}
                    </motion.li>
                  ))}
                </AnimatePresence>
                {inStage.length === 0 ? <li className="text-[11px] text-muted-foreground/70">empty</li> : null}
              </ul>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t px-4 py-3">
        <Button type="button" size="sm" variant="outline" disabled={!canAdd} onClick={() => move("working", "staging", "git add .")}>
          git add .
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!canCommit}
          onClick={() => move("staging", "local", 'git commit -m "..."')}
        >
          git commit
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={!canPush} onClick={() => move("local", "remote", "git push")}>
          git push
        </Button>
      </div>

      {log.length > 0 ? (
        <div className="border-t bg-[#0d1117] px-4 py-3 font-mono-code text-[12px] leading-relaxed text-gray-300">
          {log.map((entry, index) => (
            <div key={index}>
              <span className="text-gray-500">$ </span>
              {entry}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
