import { AnalogyCard } from "@/components/lesson/analogy-card"
import { Callout } from "@/components/lesson/callout"
import { Challenge } from "@/components/lesson/challenge"
import { CodeBlock } from "@/components/lesson/code-block"
import { CommonMistake } from "@/components/lesson/common-mistake"
import { DifficultyLevels } from "@/components/lesson/difficulty-levels"
import { InterviewQuestion } from "@/components/lesson/interview-question"
import { KeyTakeaways } from "@/components/lesson/key-takeaways"
import { Quiz } from "@/components/lesson/quiz"
import { TerminalDemo, type TerminalStep } from "@/components/lesson/terminal-demo"

const loop: TerminalStep[] = [
  {
    command: "git status --short",
    output: [" M src/app.js", " M src/styles.css", "?? notes.txt"],
    note: "Short format: the first column is the staging area, the second is the working directory. '??' means untracked.",
  },
  {
    command: "git add src/app.js",
    note: "One file staged. The others are untouched — this is the point of staging.",
  },
  {
    command: "git status --short",
    output: ["M  src/app.js", " M src/styles.css", "?? notes.txt"],
    note: "Notice the M moved to the first column for app.js. Staged changes are in column one, unstaged in column two.",
  },
  {
    command: 'git commit -m "Handle empty search queries"',
    output: ["[main 3f8b0aa] Handle empty search queries", " 1 file changed, 7 insertions(+), 2 deletions(-)"],
    note: "Only the staged file was recorded. styles.css and notes.txt are still sitting in the working directory, exactly as they were.",
  },
]

const addForms = `git add file.js            # one file
git add src/               # a directory, recursively
git add .                  # everything under the current directory
git add -A                 # everything in the repository
git add -p                 # interactively, hunk by hunk
git add -u                 # only files Git already tracks`

const commitForms = `# The everyday form
git commit -m "Fix off-by-one in pagination"

# Multi-line: opens your editor for a full message
git commit

# Stage all tracked files and commit in one step
# (does NOT include untracked files)
git commit -am "Tidy up spacing"`

const patchSession = `git add -p

diff --git a/src/cart.js b/src/cart.js
@@ -12,6 +12,7 @@ export function addItem(cart, item) {
   const existing = cart.find((entry) => entry.id === item.id)
+  console.log("DEBUG", item)
   if (existing) {
(1/2) Stage this hunk [y,n,q,a,d,s,e,?]? n`

export default function StagingAndCommittingLesson() {
  return (
    <>
      <p>
        This is the loop: change files, stage what belongs together, commit it with a message, repeat. You'll run it
        more than any other sequence in your career, so it's worth running deliberately rather than on autopilot.
      </p>

      <h2>The loop</h2>
      <TerminalDemo steps={loop} title="Stage one file, commit it, leave the rest" />

      <h2>Ways to stage</h2>
      <CodeBlock language="bash" filename="git add" code={addForms} />
      <p>
        <code>git add .</code> is the one everyone reaches for, and it's fine — as long as you've looked at{" "}
        <code>git status</code> first. The habit worth building is <em>look, then stage</em>, not <em>stage, then
        hope</em>.
      </p>

      <Callout variant="tip" title="git add -p is the one to learn next">
        Interactive staging walks through each chunk of each change and asks whether it belongs in this commit. It's
        how you turn "I fixed three things at once" into three clean commits — and it makes you re-read your own
        diff, which catches a startling number of stray debug lines.
      </Callout>
      <CodeBlock language="bash" filename="an add -p session" code={patchSession} />

      <h2>Ways to commit</h2>
      <CodeBlock language="bash" filename="git commit" code={commitForms} />
      <p>
        <code>git commit -am</code> is a convenient shortcut with one sharp edge: it only picks up files Git already
        tracks. A brand-new file stays untracked and silently misses the commit — one of the most common "but I
        committed it!" moments.
      </p>

      <AnalogyCard title="Commits are paragraphs, not autosaves.">
        An autosave records whatever happened to be on screen at that second. A paragraph is a deliberate unit: one
        idea, self-contained, that a reader can follow. Aim for commits someone could read a list of and understand
        the shape of the work — not a stream of "wip", "wip2", "more wip".
      </AnalogyCard>

      <h2>What makes a good commit</h2>
      <ul>
        <li>
          <strong>One logical change.</strong> If the message needs the word "and", consider two commits.
        </li>
        <li>
          <strong>It leaves the project working.</strong> Not perfect — working. Later commits are much easier to
          revert or bisect if each one builds.
        </li>
        <li>
          <strong>It's small enough to review.</strong> A 40-line commit gets read; a 2,000-line commit gets
          approved without being read.
        </li>
      </ul>

      <DifficultyLevels
        simple={
          <p>
            <code>git add</code> chooses what goes in the next save; <code>git commit</code> makes the save, with a
            note explaining it.
          </p>
        }
        developer={
          <p>
            <code>add</code> writes blob objects and updates the index. <code>commit</code> turns the index into a
            tree object, creates a commit object pointing at that tree and the current HEAD as parent, and advances
            the current branch. That's why an amended or rebased commit is a different object: different parent or
            different tree means a different hash.
          </p>
        }
        interview={
          <p>
            Be ready to explain <code>git commit -a</code>'s limitation (tracked files only), what{" "}
            <code>git add -p</code> buys a team (reviewable, atomic commits), and why "commit early, commit often"
            is a safety argument rather than a style one — uncommitted work has no recovery path, since it was never
            written to the object database.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="one giant commit at the end of the day"
        wrong={`git add .
git commit -m "changes"
# 47 files, four unrelated fixes,
# one useless message`}
        right={`git add src/auth/
git commit -m "Reject expired session tokens"

git add src/ui/header.css
git commit -m "Align nav items on mobile"`}
        explanation={
          <p>
            A commit mixing four concerns can't be reverted without collateral damage, can't be reviewed properly,
            and tells a future reader nothing. Splitting by concern costs you thirty seconds now and saves an hour
            the day something breaks and you need to find out which change caused it.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question={'You create a new file, notes.txt, then run git commit -am "Add notes". What ends up in the commit?'}
        options={[
          { id: "a", text: "notes.txt, because -a stages everything" },
          { id: "b", text: "Nothing from notes.txt — -a only stages files Git already tracks" },
          { id: "c", text: "notes.txt, but only if it's in the repository root" },
          { id: "d", text: "Git refuses to commit and shows an error" },
        ]}
        correctId="b"
        explanation="-a stages modifications and deletions of tracked files. An untracked file has never been added, so Git leaves it alone — it'll still be sitting there under 'Untracked files' after the commit."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Split one mess into two commits"
        hint={
          <p>
            Use <code>git add -p</code> and answer <code>y</code> for the hunks belonging to the first concern and{" "}
            <code>n</code> for the rest. Commit, then stage and commit what's left.
          </p>
        }
      >
        In a scratch repository, make two unrelated changes in the same file — say, fix a typo in a comment and
        change a function's behaviour. Now commit them as two separate commits without undoing either change.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="What makes a good commit, and why does commit size matter?"
        answer={
          <p>
            A good commit is one logical change, with a message explaining why it was made, that leaves the project
            in a working state. Size matters for three concrete reasons: reviewers genuinely read small diffs and
            rubber-stamp large ones; <code>git revert</code> on a focused commit undoes exactly one thing rather
            than dragging unrelated work with it; and <code>git bisect</code> can only pin a bug to a commit, so
            large commits leave you with a large haystack. The practical technique is <code>git add -p</code>, which
            lets you build focused commits even when your working directory has become a mixture of several ideas.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "The loop is: edit → git add (choose) → git commit (record) → repeat.",
          "git status --short shows staged changes in column one, unstaged in column two.",
          "git commit -am skips untracked files — new files still need an explicit git add.",
          "git add -p stages individual hunks, which is how you get atomic commits from messy work.",
          "One logical change per commit: easier to review, to revert, and to bisect.",
        ]}
      />
    </>
  )
}
