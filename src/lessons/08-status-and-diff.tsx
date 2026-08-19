import { AnalogyCard } from "@/components/lesson/analogy-card"
import { Callout } from "@/components/lesson/callout"
import { Challenge } from "@/components/lesson/challenge"
import { CodeBlock } from "@/components/lesson/code-block"
import { CommonMistake } from "@/components/lesson/common-mistake"
import { DifficultyLevels } from "@/components/lesson/difficulty-levels"
import { InterviewQuestion } from "@/components/lesson/interview-question"
import { KeyTakeaways } from "@/components/lesson/key-takeaways"
import { Quiz } from "@/components/lesson/quiz"
import { CodeWalkthrough, type WalkthroughStep } from "@/components/lesson/code-walkthrough"

const diffOutput = `diff --git a/src/cart.js b/src/cart.js
index 3f8b0aa..a91f4c2 100644
--- a/src/cart.js
+++ b/src/cart.js
@@ -12,7 +12,8 @@ export function addItem(cart, item) {
   const existing = cart.find((entry) => entry.id === item.id)
   if (existing) {
-    existing.quantity++
+    existing.quantity += item.quantity
     return cart
   }
   return [...cart, item]`

const diffSteps: WalkthroughStep[] = [
  {
    id: "d1",
    label: "Which file, and the two versions",
    detail: "a/ is the 'before' side, b/ is the 'after' side. They're the same file — the letters just distinguish the two versions being compared.",
    lines: 1,
  },
  {
    id: "d2",
    label: "The object hashes and file mode",
    detail: "The blob hashes of each version, and the Unix file mode. You'll rarely need this line, but it's how Git identifies exactly what it compared.",
    lines: 2,
  },
  {
    id: "d3",
    label: "The --- / +++ header",
    detail: "Restates which side is which: --- is the old file, +++ is the new one. Every - line below belongs to the old, every + line to the new.",
    range: [3, 4],
  },
  {
    id: "d4",
    label: "The hunk header",
    detail: "@@ -12,7 +12,8 @@ means: starting at line 12, the old version had 7 lines here, the new version has 8. The text after it is the enclosing function, shown for context.",
    lines: 5,
  },
  {
    id: "d5",
    label: "Context lines",
    detail: "Lines with a leading space are unchanged. Git shows three of them either side by default so you can see where the change sits.",
    lines: [6, 7],
  },
  {
    id: "d6",
    label: "The actual change",
    detail: "One line removed, one line added. Git has no concept of a 'modified line' — every modification is a removal plus an addition.",
    range: [8, 9],
  },
]

const statusForms = `git status                 # the full, chatty version
git status --short         # two-column summary
git status -sb             # short, plus branch and ahead/behind info`

const diffForms = `git diff                   # working directory vs staging area
git diff --staged          # staging area vs last commit (what you're about to commit)
git diff HEAD              # working directory vs last commit (everything uncommitted)
git diff main feature      # one branch against another
git diff HEAD~3 HEAD       # the last three commits combined
git diff --stat            # just the summary: files and line counts
git diff -- src/app.js     # limit to one path`

export default function StatusAndDiffLesson() {
  return (
    <>
      <p>
        <code>git status</code> tells you which files are in which state. <code>git diff</code> tells you what
        changed inside them. Between them they answer the only question that matters before committing: what,
        exactly, am I about to record?
      </p>

      <h2>status: the shapes of the answer</h2>
      <CodeBlock language="bash" filename="git status" code={statusForms} />
      <p>
        In short format each file gets two columns. The left column is the staging area, the right is the working
        directory: <code>M_</code> means staged modification, <code>_M</code> means unstaged modification,{" "}
        <code>MM</code> means both, <code>A_</code> is a newly added file, <code>??</code> is untracked, and{" "}
        <code>_D</code> is deleted on disk but not yet staged.
      </p>

      <Callout variant="tip" title="git status -sb is the one to alias">
        It fits on one line per file and adds a header showing your branch and how far ahead or behind its upstream
        you are — the two things you check most often, in one command.
      </Callout>

      <h2>Reading a diff, line by line</h2>
      <p>
        Diff output looks dense until someone walks you through it once. Step through this one — it's the format
        you'll read in your terminal, in pull requests, and in code review for the rest of your career.
      </p>
      <CodeWalkthrough
        steps={diffSteps}
        code={diffOutput}
        filename="git diff"
        language="diff"
        title="Anatomy of a diff"
        autoPlayMs={3200}
      />

      <AnalogyCard title="Diff is track changes, without the manuscript.">
        A word processor shows the whole document with edits marked. A diff shows only the neighbourhoods where
        something happened, with a few lines either side for context. That's why it stays readable on a change that
        touches three lines of a three-thousand-line file.
      </AnalogyCard>

      <h2>Which diff am I looking at?</h2>
      <p>
        This trips up nearly everyone once. <code>git diff</code> on its own does <strong>not</strong> show
        everything you've changed — it shows what's changed <em>and not yet staged</em>. Stage a file and it
        disappears from that view.
      </p>
      <CodeBlock language="bash" filename="the diff family" code={diffForms} />
      <ul>
        <li>
          <code>git diff</code> — working directory vs index. "What haven't I staged yet?"
        </li>
        <li>
          <code>git diff --staged</code> — index vs HEAD. "What will this commit contain?"
        </li>
        <li>
          <code>git diff HEAD</code> — working directory vs HEAD. "Everything I've changed since the last commit."
        </li>
      </ul>

      <DifficultyLevels
        simple={
          <p>
            <code>status</code> lists which files changed. <code>diff</code> shows the actual lines. Adding{" "}
            <code>--staged</code> shows what's in the envelope rather than what's still on the desk.
          </p>
        }
        developer={
          <p>
            The three-tree model explains the whole diff family: <code>git diff</code> compares working tree to
            index, <code>--staged</code> (or <code>--cached</code>) compares index to HEAD, and{" "}
            <code>git diff HEAD</code> compares working tree to HEAD. Anything you can name — a commit, a branch, a
            tag, <code>HEAD~3</code> — can go on either side.
          </p>
        }
        interview={
          <p>
            Worth mentioning: diffs are computed, not stored, so comparing two arbitrary commits is no more
            expensive than comparing adjacent ones. <code>--stat</code> gives a review-friendly summary,{" "}
            <code>--word-diff</code> is far better for prose, and <code>diff.algorithm=histogram</code> produces
            noticeably more sensible diffs on refactored code than the default Myers algorithm.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="thinking an empty git diff means no changes"
        wrong={`git add .
git diff          # empty!
# "I guess nothing changed?"`}
        right={`git add .
git diff --staged # there they are`}
        explanation={
          <p>
            Once a change is staged, it's no longer a difference between the working directory and the index — so
            plain <code>git diff</code> has nothing to report. The change hasn't vanished; you're looking at the
            wrong pair of trees. <code>git diff HEAD</code> shows staged and unstaged changes together.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="You edit two files, stage one, and run git diff. What do you see?"
        options={[
          { id: "a", text: "Both files' changes" },
          { id: "b", text: "Only the unstaged file's changes" },
          { id: "c", text: "Only the staged file's changes" },
          { id: "d", text: "Nothing, until you commit" },
        ]}
        correctId="b"
        explanation="Plain git diff compares the working directory against the staging area, so it only shows what you haven't staged. Use --staged for the other half, or git diff HEAD for both at once."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Predict all three diffs"
        hint={
          <p>
            Try <code>git diff</code>, <code>git diff --staged</code>, and <code>git diff HEAD</code> in that order
            and compare each against your prediction.
          </p>
        }
      >
        Change two files. Stage one. Before running anything, write down what you expect each of the three diff
        commands to print. Then run them. If any prediction was wrong, work out which pair of trees you had
        confused.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="What's the difference between git diff, git diff --staged, and git diff HEAD?"
        answer={
          <p>
            They compare different pairs of Git's three trees. <code>git diff</code> compares the working directory
            to the index — your unstaged changes. <code>git diff --staged</code> (identical to{" "}
            <code>--cached</code>) compares the index to HEAD — exactly what your next commit will contain.{" "}
            <code>git diff HEAD</code> compares the working directory to HEAD, so it shows staged and unstaged
            changes combined. The practical habit is running <code>git diff --staged</code> immediately before
            committing: it's the last chance to notice a debug statement or a stray file before it becomes part of
            history.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "git status shows which files are in which tree; git diff shows the line-level changes.",
          "In short status, column one is the staging area and column two is the working directory.",
          "git diff = unstaged changes; --staged = what you're about to commit; HEAD = both combined.",
          "A diff hunk header (@@ -12,7 +12,8 @@) gives the start line and line counts on each side.",
          "Review git diff --staged before every commit — it catches debug lines and accidental files.",
        ]}
      />
    </>
  )
}
