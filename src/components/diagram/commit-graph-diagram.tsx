import { useEffect, useMemo, useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Pause, Play, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface GraphCommit {
  id: string
  /** short label drawn under the node, e.g. "a1b2c3" or "feat: login" */
  label: string
  /** 0 is the trunk; 1 and 2 are branch lanes drawn above it */
  lane: number
  /** ids of the commits this one is built on — two of them means a merge */
  parents?: string[]
  tone?: "default" | "merge" | "highlight"
}

export interface GraphRef {
  /** the commit this ref points at */
  at: string
  name: string
  tone?: "branch" | "head" | "tag"
}

interface CommitGraphDiagramProps {
  commits: GraphCommit[]
  refs?: GraphRef[]
  title?: string
  /** lane index -> label drawn on the left, e.g. { 0: "main", 1: "feature" } */
  laneLabels?: Record<number, string>
  autoPlayMs?: number
  /** render every commit immediately instead of revealing them one at a time */
  static?: boolean
}

const NODE_R = 9
const STEP_X = 78
const LANE_H = 62
const PAD_X = 58
const PAD_TOP = 40
/** vertical gap between ref labels that point at the same commit */
const REF_STACK = 20

const TONE_FILL: Record<NonNullable<GraphCommit["tone"]>, string> = {
  default: "fill-primary",
  merge: "fill-success",
  highlight: "fill-destructive",
}

/**
 * The picture every Git explanation ends up drawing on a whiteboard: commits as
 * dots, parent links as lines, branch names as labels pointing at a dot.
 * Revealing them one at a time is the point — it shows that history is built
 * up commit by commit, and that a branch label simply moves to the newest one.
 */
export function CommitGraphDiagram({
  commits,
  refs = [],
  title = "Commit graph",
  laneLabels,
  autoPlayMs = 900,
  static: isStatic = false,
}: CommitGraphDiagramProps) {
  const prefersReducedMotion = useReducedMotion()
  const [revealed, setRevealed] = useState(isStatic ? commits.length : 1)
  const [playing, setPlaying] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  // Several refs can point at one commit (main + HEAD + a feature branch), so
  // they're stacked upwards and the top padding grows to keep them in frame.
  const stackIndex = new Map<GraphRef, number>()
  const perCommit = new Map<string, number>()
  for (const reference of refs) {
    const taken = perCommit.get(reference.at) ?? 0
    stackIndex.set(reference, taken)
    perCommit.set(reference.at, taken + 1)
  }
  const tallestStack = Math.max(1, ...perCommit.values())
  const padTop = PAD_TOP + (tallestStack - 1) * REF_STACK

  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number; index: number }>()
    commits.forEach((commit, index) => {
      map.set(commit.id, { x: PAD_X + index * STEP_X, y: padTop + commit.lane * LANE_H, index })
    })
    return map
  }, [commits, padTop])

  const maxLane = commits.reduce((max, commit) => Math.max(max, commit.lane), 0)
  const width = PAD_X + Math.max(0, commits.length - 1) * STEP_X + PAD_X
  const height = padTop + maxLane * LANE_H + 74

  useEffect(() => {
    if (!playing) return
    timer.current = setInterval(() => {
      setRevealed((prev) => {
        if (prev >= commits.length) {
          setPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, autoPlayMs)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [playing, autoPlayMs, commits.length])

  function togglePlay() {
    if (revealed >= commits.length) setRevealed(1)
    setPlaying((prev) => !prev)
  }

  const visible = commits.slice(0, revealed)
  const visibleIds = new Set(visible.map((commit) => commit.id))

  return (
    <div className="not-prose overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-4 py-2.5">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {isStatic ? null : (
          <div className="flex items-center gap-1">
            <span className="mr-1 hidden text-xs text-muted-foreground sm:inline">
              {Math.min(revealed, commits.length)} of {commits.length} commits
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => {
                setPlaying(false)
                setRevealed(1)
              }}
              aria-label="Restart"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto p-2">
        <svg
          viewBox={"0 0 " + width + " " + height}
          width={width}
          height={height}
          className="max-w-full"
          role="img"
          aria-label={"Commit graph: " + commits.map((commit) => commit.label).join(", ")}
        >
          {laneLabels
            ? Object.entries(laneLabels).map(([lane, label]) => (
                <text
                  key={lane}
                  x={6}
                  y={padTop + Number(lane) * LANE_H + 4}
                  className="fill-muted-foreground font-mono-code text-[10px]"
                >
                  {label}
                </text>
              ))
            : null}

          {commits.map((commit) => {
            const to = positions.get(commit.id)!
            return (commit.parents ?? []).map((parentId) => {
              const from = positions.get(parentId)
              if (!from) return null
              const shown = visibleIds.has(commit.id) && visibleIds.has(parentId)
              const midX = (from.x + to.x) / 2
              const path =
                from.y === to.y
                  ? "M " + from.x + " " + from.y + " L " + to.x + " " + to.y
                  : "M " + from.x + " " + from.y + " C " + midX + " " + from.y + ", " + midX + " " + to.y + ", " + to.x + " " + to.y
              return (
                <motion.path
                  key={parentId + "->" + commit.id}
                  d={path}
                  fill="none"
                  strokeWidth={2}
                  className={cn("stroke-border", shown && "stroke-primary/60")}
                  initial={prefersReducedMotion ? false : { pathLength: 0 }}
                  animate={{ pathLength: shown ? 1 : 0, opacity: shown ? 1 : 0.25 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
                />
              )
            })
          })}

          {commits.map((commit) => {
            const point = positions.get(commit.id)!
            const shown = visibleIds.has(commit.id)
            return (
              <motion.g
                key={commit.id}
                initial={prefersReducedMotion ? false : { scale: 0.4, opacity: 0 }}
                animate={{ scale: shown ? 1 : 0.6, opacity: shown ? 1 : 0.2 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
                style={{ transformOrigin: point.x + "px " + point.y + "px" }}
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={NODE_R}
                  className={cn(TONE_FILL[commit.tone ?? "default"], "stroke-card")}
                  strokeWidth={3}
                />
                <text
                  x={point.x}
                  y={point.y + 26}
                  textAnchor="middle"
                  className="fill-muted-foreground font-mono-code text-[10px]"
                >
                  {commit.label}
                </text>
              </motion.g>
            )
          })}

          {refs.map((reference) => {
            const point = positions.get(reference.at)
            if (!point) return null
            const shown = visibleIds.has(reference.at)
            const isHead = reference.tone === "head"
            const isTag = reference.tone === "tag"
            const boxWidth = reference.name.length * 6.2 + 14
            const lift = (stackIndex.get(reference) ?? 0) * REF_STACK
            return (
              <motion.g
                key={reference.name + "-" + reference.at}
                initial={false}
                animate={{ opacity: shown ? 1 : 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
              >
                <rect
                  x={point.x - boxWidth / 2}
                  y={point.y - 34 - lift}
                  width={boxWidth}
                  height={18}
                  rx={5}
                  className={cn(
                    isHead
                      ? "fill-destructive/15 stroke-destructive/50"
                      : isTag
                        ? "fill-success/15 stroke-success/50"
                        : "fill-primary/15 stroke-primary/50",
                  )}
                  strokeWidth={1}
                />
                <text
                  x={point.x}
                  y={point.y - 21 - lift}
                  textAnchor="middle"
                  className={cn(
                    "font-mono-code text-[10px]",
                    isHead ? "fill-destructive" : isTag ? "fill-success" : "fill-primary",
                  )}
                >
                  {reference.name}
                </text>
              </motion.g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
