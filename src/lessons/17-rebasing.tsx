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

const beforeCommits: GraphCommit[] = [
  { id: "c1", label: "c1", lane: 0 },
  { id: "c2", label: "c2", lane: 0, parents: ["c1"] },
  { id: "f1", label: "f1", lane: 1, parents: ["c2"] },
  { id: "c3", label: "c3", lane: 0, parents: ["c2"] },
  { id: "f2", label: "f2", lane: 1, parents: ["f1"] },
]

const beforeRefs: GraphRef[] = [
  { at: "c3", name: "main" },
  { at: "f2", name: "feature" },
]

const afterCommits: GraphCommit[] = [
  { id: "c1", label: "c1", lane: 0 },
  { id: "c2", label: "c2", lane: 0, parents: ["c1"] },
  { id: "c3", label: "c3", lane: 0, parents: ["c2"] },
  { id: "f1x", label: "f1'", lane: 0, parents: ["c3"] },
  { id: "f2x", label: "f2'", lane: 0, parents: ["f1x"] },
]

const afterRefs: GraphRef[] = [
  { at: "c3", name: "main" },
  { at: "f2x", name: "feature" },
]

const rebaseCommands = `# Replay my branch's commits on top of the latest main
git switch feature
git fetch origin
git rebase origin/main

# If a conflict stops it
#   ...fix the files, then:
git add <file>
git rebase --continue

# Skip a commit that's become empty
git rebase --skip

# Give up and go back to how things were
git rebase --abort`

const pullRebase = `# Instead of a merge commit every time you pull:
git pull --rebase

# Make it the default for this repository
git config pull.rebase true`

export default function RebasingLesson() {
  return (
    <>
      <p>
        Rebasing answers a different question from merging. Merge asks "how do I combine these two lines of work?".
        Rebase asks "what if I'd started my work from the latest <code>main</code> instead?" — and then rewrites your
        commits as though you had.
      </p>

      <h2>What it does to the graph</h2>
      <div className="not-prose">
        <Tabs defaultValue="before">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="before">Before</TabsTrigger>
            <TabsTrigger value="after">After git rebase main</TabsTrigger>
          </TabsList>
          <TabsContent value="before" className="mt-3 space-y-3">
            <CommitGraphDiagram
              commits={beforeCommits}
              refs={beforeRefs}
              laneLabels={{ 0: "main", 1: "feature" }}
              title="Diverged: both branches moved"
            />
            <p className="text-sm text-muted-foreground">
              <code>feature</code> branched off at <code>c2</code>, and <code>main</code> has since gained{" "}
              <code>c3</code>.
            </p>
          </TabsContent>
          <TabsContent value="after" className="mt-3 space-y-3">
            <CommitGraphDiagram
              commits={afterCommits}
              refs={afterRefs}
              laneLabels={{ 0: "main + feature" }}
              title="Replayed: one straight line"
            />
            <p className="text-sm text-muted-foreground">
              <code>f1</code> and <code>f2</code> are gone. In their place are <code>f1'</code> and{" "}
              <code>f2'</code> — <strong>new commits</strong> with the same changes, new parents, and new hashes.
              History is now linear, as if the feature had been written after <code>c3</code>.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <AnalogyCard title="Rewriting your chapter to fit the new draft.">
        You wrote chapter 4 based on chapter 3 as it stood in March. The author has since rewritten chapter 3.
        Merging staples both versions together with a note explaining the join. Rebasing rewrites your chapter as
        though you'd read the new version all along — cleaner to read, but it is genuinely a <em>new</em> chapter,
        and anyone holding a copy of your old one now has something that no longer exists.
      </AnalogyCard>

      <h2>Running it</h2>
      <CodeBlock language="bash" filename="git rebase" code={rebaseCommands} />
      <p>
        Rebase replays your commits one at a time, so a conflict can stop it once per commit. That feels like more
        conflict work than a merge — and it is, in exchange for resolving each one in the context of the single
        commit that caused it rather than all at once.
      </p>

      <Callout variant="warning" title="The golden rule">
        <strong>Never rebase commits that other people have based work on.</strong> Rebasing creates new commits and
        abandons the old ones. If someone else has the originals, their history and yours have silently diverged,
        and the next merge produces duplicated commits and unnecessary conflicts. Rebase your own unpushed or
        unshared branches freely; leave shared history alone.
      </Callout>

      <h2>git pull --rebase</h2>
      <p>
        A plain <code>git pull</code> merges the remote's commits into yours, which sprinkles "Merge branch 'main' of
        github.com…" commits through history whenever two people are working at once. <code>--rebase</code> replays
        your local commits on top of what you fetched instead, keeping the line straight.
      </p>
      <CodeBlock language="bash" filename="cleaner pulls" code={pullRebase} />

      <h2>When to reach for it</h2>
      <ul>
        <li>
          <strong>Before opening a pull request</strong> — rebase onto the latest <code>main</code> so reviewers see
          only your changes, and CI tests your work against current code.
        </li>
        <li>
          <strong>To keep a long-lived branch current</strong> without accumulating merge commits from{" "}
          <code>main</code>.
        </li>
        <li>
          <strong>To tidy your own commits</strong> before sharing — that's interactive rebase, lesson 27.
        </li>
      </ul>

      <DifficultyLevels
        simple={
          <p>
            Rebasing picks up your commits, moves the starting point to the latest version of the other branch, and
            replays them there — so your work looks like it was done last, on top of everything else.
          </p>
        }
        developer={
          <p>
            <code>git rebase main</code> finds commits on the current branch not on <code>main</code>, then applies
            each as a new commit on top of <code>main</code>'s tip. New parents mean new hashes, so the originals
            are abandoned (still reachable via the reflog). Conflicts pause the rebase per commit;{" "}
            <code>--continue</code>, <code>--skip</code>, and <code>--abort</code> drive it from there.
          </p>
        }
        interview={
          <p>
            Say the mechanism, not just the effect: rebase re-applies commits onto a new base, creating new objects,
            which is why the golden rule about shared branches exists. Mention <code>--force-with-lease</code> over{" "}
            <code>--force</code> when pushing a rebased branch, <code>rerere</code> for repeated conflicts, and that
            rebase makes <code>git bisect</code> and <code>git log</code> more useful by keeping history linear —
            the actual argument for the extra effort.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="force-pushing over a colleague's work"
        wrong={`git rebase main
git push --force
# overwrites whatever is on the
# remote, including commits
# pushed while you rebased`}
        right={`git rebase main
git push --force-with-lease
# refuses if the remote moved
# since you last fetched`}
        explanation={
          <p>
            A rebased branch can't be pushed normally — its commits are new, so the remote rejects a non-fast-forward
            update. <code>--force-with-lease</code> is the safe version: it checks that the remote is still where you
            last saw it and refuses if someone pushed in the meantime. Plain <code>--force</code> asks no questions.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="After rebasing your feature branch onto main, why does git push fail?"
        options={[
          { id: "a", text: "Rebasing deletes the remote branch" },
          { id: "b", text: "The rebase created new commits, so the push isn't a fast-forward" },
          { id: "c", text: "You need to merge main first" },
          { id: "d", text: "Rebased branches can never be pushed" },
        ]}
        correctId="b"
        explanation="Your local branch no longer contains the commits the remote has — it has replacements with different hashes. That's a non-fast-forward update, so it needs git push --force-with-lease."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Watch the hashes change"
        hint={
          <p>
            Record the output of <code>git log --oneline</code> before the rebase and compare it afterwards.
          </p>
        }
      >
        Create a branch with two commits, add a commit to <code>main</code>, then rebase. Compare the commit hashes
        before and after, and find the originals in <code>git reflog</code>. Seeing the old hashes still sitting
        there is what makes the golden rule click.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="What does git rebase do, and when is it dangerous?"
        answer={
          <p>
            It takes the commits unique to your branch and re-applies them on top of another branch's tip, producing
            a linear history. Because each replayed commit gets a new parent, it's a new object with a new hash —
            rebase rewrites history rather than moving it. That's dangerous on any branch other people have based
            work on: their clones still reference the original commits, so pushing the rebased version (which
            requires a force push) leaves everyone with divergent histories, duplicate commits, and avoidable
            conflicts. The rule of thumb is rebase private branches freely, never rebase shared ones, and when you do
            force-push use <code>--force-with-lease</code> so the push fails if someone else has pushed since you
            last fetched.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "Rebase replays your commits onto a new base, producing new commits with new hashes.",
          "The result is linear history; the cost is that the original commits are abandoned.",
          "Never rebase commits other people have built on — that's the golden rule.",
          "Pushing a rebased branch needs --force-with-lease, never plain --force.",
          "git pull --rebase avoids the merge commits that plain git pull scatters through history.",
        ]}
      />
    </>
  )
}
