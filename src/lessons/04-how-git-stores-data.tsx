import { FileText, Boxes, GitCommitHorizontal, Fingerprint } from "lucide-react"
import { AnalogyCard } from "@/components/lesson/analogy-card"
import { Callout } from "@/components/lesson/callout"
import { Challenge } from "@/components/lesson/challenge"
import { CommonMistake } from "@/components/lesson/common-mistake"
import { DifficultyLevels } from "@/components/lesson/difficulty-levels"
import { InterviewQuestion } from "@/components/lesson/interview-question"
import { KeyTakeaways } from "@/components/lesson/key-takeaways"
import { Quiz } from "@/components/lesson/quiz"
import { StepFlowDiagram, type FlowStep } from "@/components/diagram/step-flow-diagram"
import { TerminalDemo, type TerminalStep } from "@/components/lesson/terminal-demo"

const objectSteps: FlowStep[] = [
  {
    id: "o1",
    label: "blob — the contents of one file",
    detail: "Just bytes. A blob doesn't know its own filename; two identical files anywhere in the project share one blob.",
    icon: FileText,
  },
  {
    id: "o2",
    label: "tree — one directory listing",
    detail: "Maps names to blobs and to other trees. This is where filenames and folder structure actually live.",
    icon: Boxes,
  },
  {
    id: "o3",
    label: "commit — a snapshot plus context",
    detail: "Points at one top-level tree, at its parent commit(s), and carries author, timestamp, and message.",
    icon: GitCommitHorizontal,
    tone: "success",
  },
  {
    id: "o4",
    label: "Every object is named by its hash",
    detail: "Change one byte anywhere and you get a different hash — and so does every commit built on top of it.",
    icon: Fingerprint,
    tone: "success",
  },
]

const hashDemo: TerminalStep[] = [
  {
    command: 'echo "hello git" | git hash-object --stdin',
    output: ["8d0e41234f24b6da002d962a26c2495ea16a425f"],
    note: "Git hashed the contents. Nothing about the filename, the date, or who you are went into that number — only the bytes.",
  },
  {
    command: "git cat-file -t HEAD",
    output: ["commit"],
    note: "HEAD names a commit object. -t asks Git what type of object a hash refers to.",
  },
  {
    command: "git cat-file -p HEAD",
    output: [
      "tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904",
      "parent 7d20e1b8c3a5f2e1d9b0a4c6e8f0a2b4c6d8e0f2",
      "author Ada Lovelace <ada@example.com> 1717171717 +0100",
      "committer Ada Lovelace <ada@example.com> 1717171717 +0100",
      "",
      "Add password strength meter",
    ],
    note: "A commit is this small: a pointer to a tree, a pointer to its parent, two identity lines, and your message. That's the entire object.",
  },
  {
    command: "git cat-file -p HEAD^{tree}",
    output: [
      "100644 blob a1b2c3d4...    index.html",
      "100644 blob e5f6a7b8...    styles.css",
      "040000 tree 9c8d7e6f...    src",
    ],
    note: "And there are the filenames — stored in the tree, not in the file contents. The 'src' entry points at another tree, which is how directories nest.",
  },
]

export default function HowGitStoresDataLesson() {
  return (
    <>
      <p>
        Most version control systems store a list of changes: file A, line 42, this became that. Git doesn't. Git
        stores <strong>snapshots</strong> — the complete state of your project at each commit. Understanding that one
        difference explains why branching is instant, why commit hashes change when you rebase, and why history is
        so hard to tamper with.
      </p>

      <h2>Snapshots, not differences</h2>
      <p>
        Each time you commit, Git records what every tracked file looks like at that moment. If a file hasn't
        changed since the last commit, Git doesn't store it again — it stores a pointer to the identical content it
        already has. So "snapshot" doesn't mean "a full copy of everything, every time"; it means the commit
        describes a complete state, assembled mostly from content Git already holds.
      </p>

      <AnalogyCard title="A film reel, not a list of edits.">
        A list of edits ("move the vase left, then dim the lamp") only makes sense if you replay every instruction
        from the beginning. A film reel holds complete frames, and any frame can be projected on its own. Git keeps
        frames — and since most of each frame is identical to the last, it stores each unchanged region once and
        points at it.
      </AnalogyCard>

      <h2>Three object types, and that's nearly all of it</h2>
      <StepFlowDiagram title="The Git object model" steps={objectSteps} autoPlayMs={1600} />
      <p>
        There's a fourth type, the annotated <strong>tag</strong>, and that really is the whole storage model. Every
        branch, every merge, every piece of history you'll ever look at is built from these four things.
      </p>

      <h2>Content addressing: the hash is the name</h2>
      <p>
        Git names each object by the SHA-1 hash of its contents (newer repositories can use SHA-256). This is called{" "}
        <strong>content-addressable storage</strong>, and it has consequences worth internalising:
      </p>
      <ul>
        <li>
          <strong>Identical content is stored once.</strong> Copy a file to ten places and Git stores one blob.
        </li>
        <li>
          <strong>Corruption is detectable.</strong> If a byte changes on disk, the content no longer matches its
          name.
        </li>
        <li>
          <strong>History is tamper-evident.</strong> A commit's hash covers its parent's hash, so altering an old
          commit changes every hash after it — which is exactly why rewriting history is disruptive for other people.
        </li>
      </ul>
      <TerminalDemo steps={hashDemo} title="Look at the objects yourself" />

      <Callout variant="tip" title="These are real commands, not toys">
        <code>git cat-file</code> and <code>git hash-object</code> are "plumbing" commands — the low-level tools the
        friendly commands are built on. Nothing stops you running them in your own repository right now, and doing so
        turns Git from magic into machinery.
      </Callout>

      <DifficultyLevels
        simple={
          <p>
            Every time you commit, Git saves a complete picture of your project and gives that picture a unique
            fingerprint. Unchanged files aren't saved again — the new picture just points at the old copy.
          </p>
        }
        developer={
          <p>
            Git stores four object types — blob (file contents), tree (directory listing), commit (snapshot pointer
            plus metadata), tag — each keyed by the hash of its content. A commit references one root tree and one
            or more parents, forming a DAG. Deduplication happens naturally because identical content hashes to the
            same object, and packfiles later apply delta compression on top for storage efficiency.
          </p>
        }
        interview={
          <p>
            The distinction interviewers look for: Git's <em>storage</em> is snapshot-based, while its{" "}
            <em>presentation</em> is diff-based — <code>git diff</code> computes differences on demand rather than
            reading stored deltas. Delta compression does exist, but inside packfiles as an optimisation, not as the
            data model. And because a commit hash covers its parent, hashes chain, which is what makes history
            tamper-evident and what makes rebasing produce entirely new commit objects.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="believing a rebase 'moves' your commits"
        wrong={`# mental model:
# the same commits, relocated`}
        right={`# reality:
# new commit objects, new hashes,
# same changes, old ones abandoned`}
        explanation={
          <p>
            Commits are immutable — their hash is derived from their content, including their parent. Give a commit
            a different parent and it is, by definition, a different object with a different hash. Rebase copies
            changes into new commits and leaves the originals unreferenced. That's why force-pushing a rebased
            branch disrupts anyone who had the old commits, and why the reflog can still find them afterwards.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="You commit a project, then commit again after changing one line in one file. What does Git store for the second commit?"
        options={[
          { id: "a", text: "A complete second copy of every file" },
          { id: "b", text: "Only a diff against the previous commit" },
          { id: "c", text: "A new blob for the changed file, new trees along its path, and pointers to unchanged content" },
          { id: "d", text: "Nothing — the change is only in the working directory" },
        ]}
        correctId="c"
        explanation="A new blob is created for the changed file, new tree objects are written for the directories on the path to it, and everything unchanged is referenced by its existing hash. The commit describes a complete snapshot without duplicating unchanged content."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Prove content addressing to yourself"
        hint={
          <p>
            <code>git hash-object</code> reads content and prints its hash without writing anything, so it's
            completely safe to experiment with.
          </p>
        }
      >
        Create two files with identical contents but different names, and run <code>git hash-object</code> on both.
        Then change one character in one of them and run it again. Explain, in one sentence, why the first two hashes
        matched and the third didn't.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="Does Git store diffs or snapshots?"
        answer={
          <p>
            Snapshots. Each commit points at a tree representing the complete state of the project at that moment.
            Files that didn't change aren't stored again — the new tree simply references the existing blob by its
            hash — so snapshots are cheap without being deltas. Diffs are <em>computed</em> when you ask for them,
            which is why <code>git diff</code> between any two arbitrary commits is equally easy. Delta compression
            does appear in packfiles, where Git stores similar objects as deltas to save disk space, but that's a
            storage optimisation applied after the fact, not the model the history is built on.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "Git stores snapshots of the whole project, not a chain of diffs.",
          "Four object types: blob (contents), tree (directory listing), commit (snapshot + metadata), tag.",
          "Objects are named by the hash of their content, so identical content is stored once.",
          "A commit's hash includes its parent's hash, making history tamper-evident and rebases hash-changing.",
          "Diffs are computed on demand; delta compression exists only inside packfiles as an optimisation.",
        ]}
      />
    </>
  )
}
