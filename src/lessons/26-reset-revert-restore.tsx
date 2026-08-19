import { AnalogyCard } from "@/components/lesson/analogy-card"
import { Callout } from "@/components/lesson/callout"
import { Challenge } from "@/components/lesson/challenge"
import { CodeBlock } from "@/components/lesson/code-block"
import { CommonMistake } from "@/components/lesson/common-mistake"
import { DifficultyLevels } from "@/components/lesson/difficulty-levels"
import { InterviewQuestion } from "@/components/lesson/interview-question"
import { KeyTakeaways } from "@/components/lesson/key-takeaways"
import { Quiz } from "@/components/lesson/quiz"
import { CommitGraphDiagram, type GraphCommit, type GraphRef } from "@/components/diagram/commit-graph-diagram"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const resetCommits: GraphCommit[] = [
  { id: "c1", label: "c1", lane: 0 },
  { id: "c2", label: "c2", lane: 0, parents: ["c1"] },
  { id: "c3", label: "c3", lane: 1, parents: ["c2"], tone: "highlight" },
]

const resetRefs: GraphRef[] = [{ at: "c2", name: "main" }]

const revertCommits: GraphCommit[] = [
  { id: "c1", label: "c1", lane: 0 },
  { id: "c2", label: "c2", lane: 0, parents: ["c1"] },
  { id: "c3", label: "c3", lane: 0, parents: ["c2"] },
  { id: "c4", label: 'revert c3', lane: 0, parents: ["c3"], tone: "merge" },
]

const revertRefs: GraphRef[] = [{ at: "c4", name: "main" }]

const resetModes = `# HEAD moves; index and working tree untouched.
# The commit's changes are left staged, ready to recommit differently.
git reset --soft HEAD~1

# HEAD moves; index reset; working tree untouched. (the default)
# Changes are back to unstaged edits on disk.
git reset HEAD~1
git reset --mixed HEAD~1

# HEAD moves; index AND working tree reset.
# The changes are gone from disk. Committed work is still in the reflog;
# uncommitted work is not.
git reset --hard HEAD~1`

const revertCommands = `# Undo one commit by creating a new commit that reverses it
git revert a91f4c2

# Undo a range
git revert HEAD~3..HEAD

# Stage the reversal without committing yet
git revert -n a91f4c2

# Undo a merge: -m 1 means "keep the first parent's side"
git revert -m 1 <merge-commit>`

export default function ResetRevertRestoreLesson() {
  return (
    <>
      <p>
        Three commands with similar names and completely different jobs. The one-line version:{" "}
        <strong>restore</strong> operates on files, <strong>reset</strong> moves the branch pointer, and{" "}
        <strong>revert</strong> adds a new commit that undoes an old one.
      </p>

      <h2>The distinction that matters</h2>
      <ul>
        <li>
          <strong><code>git restore</code></strong> — file-level. Discards or unstages changes. Doesn't touch
          history. (Lesson 24.)
        </li>
        <li>
          <strong><code>git reset</code></strong> — commit-level, <em>rewrites</em> history by moving your branch
          backwards. Safe locally, disruptive once pushed.
        </li>
        <li>
          <strong><code>git revert</code></strong> — commit-level, <em>adds to</em> history with an inverse commit.
          Safe on shared branches, because nothing existing changes.
        </li>
      </ul>

      <div className="not-prose">
        <Tabs defaultValue="reset">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reset">reset — move the pointer back</TabsTrigger>
            <TabsTrigger value="revert">revert — add an inverse commit</TabsTrigger>
          </TabsList>
          <TabsContent value="reset" className="mt-3 space-y-3">
            <CommitGraphDiagram
              commits={resetCommits}
              refs={resetRefs}
              laneLabels={{ 0: "main", 1: "orphaned" }}
              title="git reset --hard HEAD~1"
              static
            />
            <p className="text-sm text-muted-foreground">
              <code>main</code> now points at <code>c2</code>. <code>c3</code> still exists in the object database
              and in the reflog, but nothing references it — as far as the branch is concerned, it never happened.
            </p>
          </TabsContent>
          <TabsContent value="revert" className="mt-3 space-y-3">
            <CommitGraphDiagram
              commits={revertCommits}
              refs={revertRefs}
              laneLabels={{ 0: "main" }}
              title="git revert c3"
              static
            />
            <p className="text-sm text-muted-foreground">
              <code>c3</code> is still there, and a fourth commit undoes its changes. History records both the
              mistake and the correction — which is what you want on a branch other people have.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <AnalogyCard title="Tearing the page out, versus writing a correction.">
        Reset tears the page out of the notebook — fine in your private journal, alarming in a shared logbook where
        others have already read it. Revert writes a new entry saying "the entry on page 12 was wrong; here's the
        correction". The record is longer, but nobody's copy is invalidated.
      </AnalogyCard>

      <h2>reset's three modes, in terms of the three trees</h2>
      <CodeBlock language="bash" filename="git reset" code={resetModes} />
      <p>
        Each mode resets one more tree than the last: <code>--soft</code> touches HEAD only, <code>--mixed</code>{" "}
        also resets the index, <code>--hard</code> also overwrites your working directory. That progression is the
        whole design — and it's exactly why lesson 5's model is worth knowing.
      </p>

      <Callout variant="tip" title="--soft is the underrated one">
        <code>git reset --soft HEAD~3</code> collapses your last three commits back into the staging area with every
        change intact, ready to be recommitted as one clean commit. It's the simplest way to squash without going
        near interactive rebase.
      </Callout>

      <h2>revert, including merges</h2>
      <CodeBlock language="bash" filename="git revert" code={revertCommands} />
      <p>
        Reverting a merge commit needs <code>-m</code> to say which parent's line of history to keep —{" "}
        <code>-m 1</code> is nearly always the right answer, meaning "keep the branch we merged into". Note that
        reverting a merge and then wanting the branch back later is genuinely awkward; the usual advice is to revert
        the revert when you re-merge.
      </p>

      <h2>Which do I use?</h2>
      <ul>
        <li>
          <strong>Local commits, not pushed</strong> → <code>reset</code>. Clean and simple.
        </li>
        <li>
          <strong>Pushed to a shared branch</strong> → <code>revert</code>. Never rewrite what others have.
        </li>
        <li>
          <strong>Just a file, uncommitted</strong> → <code>restore</code>.
        </li>
      </ul>

      <DifficultyLevels
        simple={
          <p>
            <code>reset</code> pretends the commits never happened — fine on your own machine.{" "}
            <code>revert</code> adds a new commit that undoes an old one — the safe choice once others can see it.
          </p>
        }
        developer={
          <p>
            <code>reset</code> moves the branch ref and optionally the index and working tree (<code>--soft</code>,{" "}
            <code>--mixed</code>, <code>--hard</code>). <code>revert</code> computes the inverse diff of a commit
            and commits it, leaving all existing objects untouched, which is why it needs no force push. Reverting a
            merge requires <code>-m</code> to choose the mainline parent.
          </p>
        }
        interview={
          <p>
            Map reset's modes onto HEAD/index/working tree and the answer is complete. Add that{" "}
            <code>reset --hard</code> is the one command that can destroy uncommitted work irrecoverably, while
            reset of <em>committed</em> work is recoverable via reflog. And be clear on the social rule: reset
            rewrites, revert appends — public history gets revert.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="resetting a branch others have already pulled"
        wrong={`git reset --hard HEAD~3
git push --force
# three commits vanish from
# the remote; colleagues' clones
# still have them`}
        right={`git revert HEAD~2..HEAD
git push
# the undo is itself a commit,
# nobody's history is invalidated`}
        explanation={
          <p>
            Force-pushing a reset branch makes everyone else's history diverge silently; their next push or pull
            reintroduces the commits you deleted, and the confusion multiplies. On shared branches the correct undo
            is always revert.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="A bad commit is already pushed to main, which three colleagues have pulled. How do you undo it?"
        options={[
          { id: "a", text: "git reset --hard HEAD~1 then git push --force" },
          { id: "b", text: "git revert <hash> then git push" },
          { id: "c", text: "git restore ." },
          { id: "d", text: "Delete and recreate the branch" },
        ]}
        correctId="b"
        explanation="revert adds a new commit that reverses the change, so everyone's existing history stays valid and a normal push works. Resetting and force-pushing shared history is how teams lose an afternoon."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Feel the difference between the three modes"
        hint={
          <p>
            Run <code>git status</code> after each reset — the mode determines whether the change appears as staged,
            unstaged, or nowhere at all.
          </p>
        }
      >
        Make three commits in a scratch repository. Reset with <code>--soft</code>, check <code>git status</code>,
        then use the reflog to get back. Repeat with <code>--mixed</code> and <code>--hard</code>. Write down, in
        your own words, which tree each mode reached.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="What's the difference between git reset and git revert?"
        answer={
          <p>
            <code>reset</code> moves the current branch pointer to an earlier commit, so the commits after it are no
            longer part of the branch — a history rewrite. Its three modes correspond to Git's three trees:{" "}
            <code>--soft</code> moves HEAD only and leaves the changes staged, <code>--mixed</code> also resets the
            index, and <code>--hard</code> also overwrites the working tree, which is the one genuinely destructive
            variant. <code>revert</code> instead creates a new commit containing the inverse of the target commit,
            leaving all existing history intact. The practical rule is about who else has the commits: reset is fine
            for local, unpushed work, but anything already on a shared branch should be undone with revert, because
            rewriting published history forces everyone else to reconcile a divergence they didn't cause.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "restore = files, reset = move the branch pointer, revert = add an inverse commit.",
          "reset --soft/--mixed/--hard reset one, two, or all three of Git's trees.",
          "reset --hard is the only command here that can destroy uncommitted work for good.",
          "Use reset on unpushed local work; use revert on anything others have pulled.",
          "Reverting a merge needs -m 1 to name the mainline parent.",
        ]}
      />
    </>
  )
}
