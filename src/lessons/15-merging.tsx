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

const ffCommits: GraphCommit[] = [
  { id: "c1", label: "c1", lane: 0 },
  { id: "c2", label: "c2", lane: 0, parents: ["c1"] },
  { id: "f1", label: "f1", lane: 0, parents: ["c2"] },
  { id: "f2", label: "f2", lane: 0, parents: ["f1"] },
]

const ffRefs: GraphRef[] = [
  { at: "f2", name: "main" },
  { at: "f2", name: "feature" },
]

const threeWayCommits: GraphCommit[] = [
  { id: "c1", label: "c1", lane: 0 },
  { id: "c2", label: "c2", lane: 0, parents: ["c1"] },
  { id: "f1", label: "f1", lane: 1, parents: ["c2"] },
  { id: "c3", label: "c3", lane: 0, parents: ["c2"] },
  { id: "f2", label: "f2", lane: 1, parents: ["f1"] },
  { id: "m1", label: "merge", lane: 0, parents: ["c3", "f2"], tone: "merge" },
]

const threeWayRefs: GraphRef[] = [
  { at: "f2", name: "feature" },
  { at: "m1", name: "main" },
]

const mergeCommands = `# Merge feature INTO the branch you're standing on
git switch main
git merge feature

# Always create a merge commit, even when a fast-forward was possible
git merge --no-ff feature

# Only merge if it can fast-forward; otherwise stop and do nothing
git merge --ff-only feature

# Abandon a merge that's gone wrong
git merge --abort`

const mergeOutput = `git merge feature

Merge made by the 'ort' strategy.
 src/search.js  | 28 ++++++++++++++++++++++++++++
 src/api.js     |  4 ++--
 2 files changed, 30 insertions(+), 2 deletions(-)`

export default function MergingLesson() {
  return (
    <>
      <p>
        Merging brings the work from one branch into another. Git has two ways of doing it, and knowing which one
        you're getting explains most of what you'll see in a repository's graph.
      </p>

      <h2>Direction matters</h2>
      <p>
        <code>git merge feature</code> means "bring <code>feature</code> into wherever I am". The branch you're
        standing on moves; the branch you name does not. So merging a feature into <code>main</code> always means
        switching to <code>main</code> first.
      </p>
      <CodeBlock language="bash" filename="merging" code={mergeCommands} />

      <h2>The two kinds of merge</h2>
      <div className="not-prose">
        <Tabs defaultValue="ff">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ff">Fast-forward</TabsTrigger>
            <TabsTrigger value="three">Three-way</TabsTrigger>
          </TabsList>
          <TabsContent value="ff" className="mt-3 space-y-3">
            <CommitGraphDiagram
              commits={ffCommits}
              refs={ffRefs}
              laneLabels={{ 0: "main" }}
              title="Fast-forward: the label just slides along"
            />
            <p className="text-sm text-muted-foreground">
              If <code>main</code> hasn't moved since <code>feature</code> branched off, there's nothing to
              reconcile. Git simply moves the <code>main</code> label forward to <code>feature</code>'s tip. No merge
              commit is created, and history stays a straight line.
            </p>
          </TabsContent>
          <TabsContent value="three" className="mt-3 space-y-3">
            <CommitGraphDiagram
              commits={threeWayCommits}
              refs={threeWayRefs}
              laneLabels={{ 0: "main", 1: "feature" }}
              title="Three-way: a merge commit joins both lines"
            />
            <p className="text-sm text-muted-foreground">
              Both branches gained commits after they diverged, so Git compares three points — the two tips and their
              common ancestor — and creates a <strong>merge commit</strong> with two parents. This is where conflicts
              can appear, and it's why merge commits exist at all.
            </p>
          </TabsContent>
        </Tabs>
      </div>
      <CodeBlock language="bash" filename="a three-way merge" code={mergeOutput} />

      <AnalogyCard title="Three-way merge is proofreading against the original.">
        Two editors marked up copies of the same manuscript. To combine them you don't compare the two marked-up
        copies to each other — you compare each against the original. Then a change only one editor made is applied
        cleanly, and only a passage both rewrote needs a human decision. The original is the common ancestor.
      </AnalogyCard>

      <h2>--no-ff: the deliberate merge commit</h2>
      <p>
        Fast-forward merges leave no trace that a branch existed. <code>--no-ff</code> forces a merge commit anyway,
        which keeps the feature's commits visibly grouped and makes the whole feature revertable as one unit.
        Plenty of teams set this as the default for merging into <code>main</code>.
      </p>

      <Callout variant="info" title="Merging never rewrites history">
        A merge only adds a commit. Every commit on both branches keeps its hash, so nobody else's clone is
        disrupted. That safety is the core argument for merge over rebase on shared branches — see lesson 18.
      </Callout>

      <h2>After the merge</h2>
      <p>
        The merged branch still exists, pointing at its last commit. Once the work is in <code>main</code>, delete
        it — locally with <code>git branch -d feature</code> and on the remote with{" "}
        <code>git push origin --delete feature</code>. Stale branches are the main reason repositories become
        unreadable.
      </p>

      <DifficultyLevels
        simple={
          <p>
            Merging copies the work from one branch into another. If nothing else changed in the meantime, Git just
            moves the label forward; if both branches moved, it combines them and records a merge.
          </p>
        }
        developer={
          <p>
            Fast-forward applies when the target's tip is an ancestor of the source's tip — the ref simply advances.
            Otherwise Git finds the merge base with the common-ancestor algorithm and performs a three-way merge
            using the <code>ort</code> strategy, producing a commit with two parents. Conflicts occur only where both
            sides changed the same region relative to the base.
          </p>
        }
        interview={
          <p>
            Be precise about the merge base: a three-way merge compares each side to their common ancestor, which is
            why a change made on only one side applies without a conflict no matter how large it is. Also worth
            noting that <code>--no-ff</code> preserves feature grouping and makes <code>git revert -m 1</code> able
            to undo a whole feature, and that merging is non-destructive — no existing commit is altered.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="merging in the wrong direction"
        wrong={`git switch feature
git merge main
# then wondering why main
# still doesn't have your work`}
        right={`git switch main
git pull
git merge feature`}
        explanation={
          <p>
            <code>git merge X</code> moves the branch you're <em>on</em>. Merging <code>main</code> into your
            feature branch is a legitimate thing to do — it's how you bring your branch up to date — but it doesn't
            deliver your work to <code>main</code>. For that you must be standing on <code>main</code>.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="You branch off main, commit twice, and nobody touches main meanwhile. What does git merge feature do on main?"
        options={[
          { id: "a", text: "Creates a merge commit with two parents" },
          { id: "b", text: "Fast-forwards: moves main's pointer to feature's tip, no new commit" },
          { id: "c", text: "Refuses, because the branches haven't diverged" },
          { id: "d", text: "Rebases feature onto main" },
        ]}
        correctId="b"
        explanation="main's tip is an ancestor of feature's tip, so there's nothing to reconcile — Git just advances the label. Pass --no-ff if you want a merge commit recorded anyway."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Produce both kinds of merge"
        hint={
          <p>
            For the three-way merge, commit on <code>main</code> as well after branching — the branches must both
            move for it to be needed.
          </p>
        }
      >
        In a scratch repository, create a fast-forward merge and a three-way merge. Look at{" "}
        <code>git log --oneline --graph</code> after each, then redo the fast-forward one with <code>--no-ff</code>{" "}
        and compare the graphs.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="Explain the difference between a fast-forward and a three-way merge."
        answer={
          <p>
            A fast-forward happens when the target branch's tip is an ancestor of the branch being merged — nothing
            new happened on the target, so Git simply moves its pointer forward. No merge commit is created and
            history stays linear. A three-way merge happens when both branches have moved since they diverged: Git
            finds their common ancestor (the merge base), compares each side against it, combines the changes, and
            records a commit with two parents. Conflicts arise only where both sides changed the same region
            relative to that base. You can force a merge commit in the fast-forward case with <code>--no-ff</code>,
            which many teams do so that a feature's commits remain visibly grouped and the whole feature can be
            reverted with <code>git revert -m 1</code>.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "git merge X brings X into the branch you're currently on — direction matters.",
          "Fast-forward: the target's pointer moves forward, no merge commit, linear history.",
          "Three-way: both branches moved, so Git combines them against their common ancestor and records two parents.",
          "--no-ff forces a merge commit, keeping a feature's commits grouped and revertable together.",
          "Merging never rewrites existing commits, which is why it's safe on shared branches.",
        ]}
      />
    </>
  )
}
