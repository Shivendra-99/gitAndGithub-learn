import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { GitMerge, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Resolution = "ours" | "theirs" | "both" | null

const OURS = ['  <button class="btn btn-primary">Sign in</button>']
const THEIRS = ['  <button class="btn btn-lg">Log in</button>']

const RESOLVED: Record<Exclude<Resolution, null>, string[]> = {
  ours: OURS,
  theirs: THEIRS,
  both: [...OURS, ...THEIRS],
}

const EXPLANATION: Record<Exclude<Resolution, null>, string> = {
  ours: "You kept the version from the branch you're currently on (HEAD) and threw away the incoming change. Fine when your side is genuinely the newer, correct one — but check you're not silently deleting a colleague's work.",
  theirs:
    "You kept the incoming version and dropped yours. Also legitimate — just be sure you actually read what you were discarding.",
  both: "Sometimes neither side is wrong and the real answer is a bit of both — or something new entirely. Git does not care what you write; it only cares that the markers are gone.",
}

/**
 * A conflict is the one part of Git that reliably scares people, mostly because
 * the markers look like the file has been corrupted. Letting the reader pick a
 * side and watch the markers disappear takes most of that fear away: the file is
 * just text, and resolving means editing it until it says what you want.
 */
export function MergeConflictDemo() {
  const prefersReducedMotion = useReducedMotion()
  const [resolution, setResolution] = useState<Resolution>(null)

  const conflicted = [
    "<div class=\"login\">",
    "<<<<<<< HEAD",
    ...OURS,
    "=======",
    ...THEIRS,
    ">>>>>>> feature/login-copy",
    "</div>",
  ]

  const lines = resolution ? ["<div class=\"login\">", ...RESOLVED[resolution], "</div>"] : conflicted

  function lineClass(line: string) {
    if (line.startsWith("<<<<<<<") || line.startsWith(">>>>>>>") || line === "=======") {
      return "bg-destructive/15 text-destructive"
    }
    if (!resolution && OURS.includes(line)) return "bg-primary/10 text-gray-100"
    if (!resolution && THEIRS.includes(line)) return "bg-success/10 text-gray-100"
    return "text-gray-300"
  }

  return (
    <div className="not-prose overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-4 py-2.5">
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          <GitMerge className="size-4 text-primary" aria-hidden="true" />
          login.html — {resolution ? "resolved" : "conflicted"}
        </p>
        {resolution ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs text-muted-foreground"
            onClick={() => setResolution(null)}
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Back to the conflict
          </Button>
        ) : null}
      </div>

      <div className="overflow-x-auto bg-[#0d1117] px-4 py-3 font-mono-code text-[12.5px] leading-relaxed">
        <AnimatePresence mode="wait">
          <motion.div
            key={resolution ?? "conflict"}
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {lines.map((line, index) => (
              <div key={index} className={cn("min-w-max rounded px-2 py-0.5 whitespace-pre", lineClass(line))}>
                {line || " "}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t px-4 py-3">
        <span className="mr-1 text-xs text-muted-foreground">Resolve it by:</span>
        <Button type="button" size="sm" variant={resolution === "ours" ? "default" : "outline"} onClick={() => setResolution("ours")}>
          Keeping ours
        </Button>
        <Button
          type="button"
          size="sm"
          variant={resolution === "theirs" ? "default" : "outline"}
          onClick={() => setResolution("theirs")}
        >
          Keeping theirs
        </Button>
        <Button type="button" size="sm" variant={resolution === "both" ? "default" : "outline"} onClick={() => setResolution("both")}>
          Keeping both
        </Button>
      </div>

      <div className="border-t px-4 py-3 text-sm text-muted-foreground">
        {resolution ? (
          <>
            <p>{EXPLANATION[resolution]}</p>
            <p className="mt-2">
              Now tell Git you're done:{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono-code text-[12.5px] text-foreground">
                git add login.html
              </code>{" "}
              then{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono-code text-[12.5px] text-foreground">git commit</code>.
            </p>
          </>
        ) : (
          <p>
            Everything between <code className="font-mono-code text-foreground">&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code> and{" "}
            <code className="font-mono-code text-foreground">=======</code> is your side. Everything between{" "}
            <code className="font-mono-code text-foreground">=======</code> and{" "}
            <code className="font-mono-code text-foreground">&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> is the incoming side. Your job
            is to delete the markers and leave the file saying what it should say.
          </p>
        )}
      </div>
    </div>
  )
}
