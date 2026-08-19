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

const commits: GraphCommit[] = [
  { id: "c1", label: "c1", lane: 0 },
  { id: "c2", label: "c2", lane: 0, parents: ["c1"] },
  { id: "c3", label: "c3", lane: 0, parents: ["c2"] },
  { id: "f1", label: "f1", lane: 1, parents: ["c3"] },
  { id: "f2", label: "f2", lane: 1, parents: ["f1"] },
]

const refs: GraphRef[] = [
  { at: "c3", name: "main" },
  { at: "f2", name: "feature" },
  { at: "f2", name: "HEAD", tone: "head" },
]

const insideRefs = `cat .git/refs/heads/main
3f8b0aa1c4d7e2f5a8b9c0d1e2f3a4b5c6d7e8f9

cat .git/HEAD
ref: refs/heads/feature

# A branch really is one line of text.
# That's why creating one is instant.`

const branchCommands = `git branch                     # list local branches
git branch -a                  # local + remote-tracking
git branch -v                  # with each branch's latest commit
git branch --merged            # branches already merged into HEAD
git branch --no-merged         # branches with unmerged work
git branch -d old-feature      # delete (refuses if unmerged)
git branch -D old-feature      # delete anyway
git branch -m old-name new-name  # rename`

export default function BranchesExplainedLesson() {
  return (
    <>
      <p>
        Branching sounds heavyweight — a parallel copy of the project, surely? It isn't. A branch in Git is a file
        containing one commit hash. Creating one writes 41 bytes. Everything about how teams use Git follows from
        that fact.
      </p>

      <h2>A branch is a pointer</h2>
      <p>
        Commits form a chain, each pointing at its parent. A <strong>branch</strong> is a movable label pointing at
        one commit. When you commit, the label you're currently on shifts forward to the new commit. That's all
        "being on a branch" means.
      </p>
      <CommitGraphDiagram
        commits={commits}
        refs={refs}
        laneLabels={{ 0: "main", 1: "feature" }}
        title="Two labels, one shared history"
      />
      <p>
        Notice what the diagram does <em>not</em> show: two copies of the project. <code>c1</code>, <code>c2</code>,
        and <code>c3</code> belong to both branches. Branches don't own commits; they point into a shared graph.
      </p>

      <h2>HEAD: where you are</h2>
      <p>
        <code>HEAD</code> is Git's answer to "which branch am I on?". Normally it points at a branch, which points
        at a commit. Occasionally it points straight at a commit instead — that's <strong>detached HEAD</strong>,
        and it's what happens when you check out a specific hash or a tag.
      </p>
      <CodeBlock language="bash" filename="looking at the plumbing" code={insideRefs} />

      <AnalogyCard title="Branches are bookmarks, not photocopies.">
        A bookmark marks your place in a shared book; it doesn't duplicate the pages. Several bookmarks can sit in
        one book at different places, and moving one doesn't disturb the others. Creating a bookmark is instant —
        which is exactly why Git users branch for a two-line fix without thinking about it.
      </AnalogyCard>

      <h2>Why cheap branching changed everything</h2>
      <p>
        In older version control systems, branching meant copying the project on a server, and merging back was
        painful enough that teams avoided both. So everyone worked on one trunk, integration problems piled up, and
        releases were tense.
      </p>
      <p>
        In Git, branching costs nothing, so the natural unit of work becomes "a branch per change". That's what
        makes pull requests, code review before merge, and per-branch CI practical — none of which are Git features,
        but all of which depend on branches being free.
      </p>

      <h2>Working with the list</h2>
      <CodeBlock language="bash" filename="git branch" code={branchCommands} />

      <Callout variant="tip" title="--merged is your cleanup tool">
        <code>git branch --merged main</code> lists branches whose work is already in <code>main</code> — safe to
        delete. <code>--no-merged</code> lists the ones still holding unique commits, which is the list you check
        before any bulk tidy-up.
      </Callout>

      <DifficultyLevels
        simple={
          <p>
            A branch is a bookmark pointing at one commit. When you commit, the bookmark moves forward. Making a new
            branch just puts a second bookmark in the same place.
          </p>
        }
        developer={
          <p>
            A branch is a ref: a file under <code>.git/refs/heads/</code> (or an entry in{" "}
            <code>packed-refs</code>) containing a commit hash. HEAD is a symbolic ref pointing at the current
            branch. Committing creates a commit whose parent is the current HEAD commit, then updates the branch ref
            to the new hash — an O(1) operation regardless of project size.
          </p>
        }
        interview={
          <p>
            The answer that lands: branches are pointers into a DAG, not copies, so creating and deleting them is
            trivial and merging is a graph operation rather than a file-copying one. Deleting a branch removes only
            the label; the commits survive until garbage collection, and are recoverable via the reflog. Detached
            HEAD means HEAD points at a commit directly, so new commits belong to no branch and become unreachable
            once you switch away.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="assuming deleting a branch deletes the work"
        wrong={`git branch -D feature
# "my work is gone forever"`}
        right={`git reflog
# find the commit hash
git switch -c feature-restored a91f4c2`}
        explanation={
          <p>
            Deleting a branch removes a label. The commits stay in the object database until garbage collection runs
            (typically 30+ days for unreachable objects), and the reflog remembers where the branch pointed. That
            said, <code>-d</code> refuses to delete unmerged branches for a reason — reach for <code>-D</code> only
            when you mean it.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="What physically happens when you run git branch feature?"
        options={[
          { id: "a", text: "Git copies the project files into a new directory" },
          { id: "b", text: "Git writes a file containing the current commit's hash" },
          { id: "c", text: "Git creates a new commit" },
          { id: "d", text: "Git uploads a branch to the remote" },
        ]}
        correctId="b"
        explanation="A branch is a ref — a small file under .git/refs/heads/ holding one commit hash. No files are copied, no commit is created, and nothing is sent anywhere."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Read your own refs"
        hint={
          <p>
            <code>cat .git/HEAD</code>, then <code>cat</code> whatever file it names. On Windows PowerShell use{" "}
            <code>Get-Content</code>.
          </p>
        }
      >
        In any repository, print <code>.git/HEAD</code> and the ref file it points at. Create a branch, print the
        new ref file, and confirm it holds the same hash as the branch you were on. You've just seen the entire
        implementation of branching.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="Why is branching in Git so much cheaper than in older version control systems?"
        answer={
          <p>
            Because a Git branch is a 41-byte file containing a commit hash, not a copy of anything. Commits already
            form a directed acyclic graph, so a branch is just a movable label pointing into it, and committing
            updates that label — constant-time work no matter how large the project is. Centralised systems like
            Subversion implemented branches as directory copies on a server, so branching was a network operation
            and merging meant reconstructing what happened by comparing paths. The knock-on effect is cultural:
            because branches are free, the industry standard became one short-lived branch per change with review
            before merge, which simply wasn't practical when each branch cost real time and risk.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "A branch is a movable pointer to a commit — a small file under .git/refs/heads/.",
          "HEAD points at the current branch; detached HEAD means it points straight at a commit.",
          "Branches share commits; they don't own or copy them.",
          "Creating, switching, and deleting branches is near-instant regardless of project size.",
          "Deleting a branch removes the label, not the commits — the reflog can still find them.",
        ]}
      />
    </>
  )
}
