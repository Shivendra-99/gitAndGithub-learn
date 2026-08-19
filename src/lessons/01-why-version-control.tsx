import { FolderOpen, Users, Rewind, AlertTriangle } from "lucide-react"
import { AnalogyCard } from "@/components/lesson/analogy-card"
import { Callout } from "@/components/lesson/callout"
import { Challenge } from "@/components/lesson/challenge"
import { CodeBlock } from "@/components/lesson/code-block"
import { CommonMistake } from "@/components/lesson/common-mistake"
import { DifficultyLevels } from "@/components/lesson/difficulty-levels"
import { InterviewQuestion } from "@/components/lesson/interview-question"
import { KeyTakeaways } from "@/components/lesson/key-takeaways"
import { Quiz } from "@/components/lesson/quiz"
import { StepFlowDiagram, type FlowStep } from "@/components/diagram/step-flow-diagram"

const folderMess = `project/
├── index.html
├── index-old.html
├── index-v2.html
├── index-v2-FINAL.html
├── index-v2-FINAL-real.html
└── index-v2-FINAL-real-USE-THIS-ONE.html`

const gitVersion = `git log --oneline

a91f4c2 Fix login redirect on mobile
7d20e1b Add password strength meter
3f8b0aa Rework the sign-up form layout
c04e77d Initial commit`

const painSteps: FlowStep[] = [
  {
    id: "p1",
    label: "You copy the folder before a risky change",
    detail: "It works, briefly. Then you make another copy, and another, and the names stop meaning anything.",
    icon: FolderOpen,
  },
  {
    id: "p2",
    label: "A teammate edits the same file",
    detail: "You email versions back and forth and merge them by hand, in a text editor, at 6pm.",
    icon: Users,
    tone: "warning",
  },
  {
    id: "p3",
    label: "Something breaks in production",
    detail: "Nobody can say which change caused it, or what the file looked like on Tuesday.",
    icon: AlertTriangle,
    tone: "warning",
  },
  {
    id: "p4",
    label: "Version control removes all three problems",
    detail: "One folder, complete history, every change attributed, any past state recoverable in seconds.",
    icon: Rewind,
    tone: "success",
  },
]

export default function WhyVersionControlLesson() {
  return (
    <>
      <p>
        Before touching a single command, it's worth being precise about the problem Git solves. Almost every
        confusing thing Git does later makes sense once you know what it was designed to protect you from.
      </p>

      <h2>The problem, in one folder</h2>
      <p>
        Nearly everyone invents the same broken system before they learn version control. It looks like this:
      </p>
      <CodeBlock language="bash" filename="the folder we've all had" code={folderMess} />
      <p>
        This "works" until you need to answer a normal question: <em>what changed between v2 and v2-FINAL, and
        why?</em> The folder can't tell you. The information — the reason for each change — was never recorded
        anywhere.
      </p>
      <StepFlowDiagram title="How it falls apart" steps={painSteps} autoPlayMs={1400} />

      <AnalogyCard title="A save file versus a diary.">
        Copying a folder is like keeping a save file: you get one frozen moment, with no idea what happened between
        saves. Version control is a diary — every entry says what changed, when, who did it, and why. You can flip
        back to any page, and you can hand the whole diary to someone else without losing a word of it.
      </AnalogyCard>

      <h2>What version control actually gives you</h2>
      <p>Four things, and every one of them is something you will need eventually:</p>
      <ul>
        <li>
          <strong>History</strong> — every version of every file is kept, forever, with the reason for the change
          attached to it.
        </li>
        <li>
          <strong>Attribution</strong> — who changed this line, and when. Not to assign blame, but to know who to
          ask.
        </li>
        <li>
          <strong>Parallel work</strong> — several people (or several ideas from one person) can move at once
          without overwriting each other.
        </li>
        <li>
          <strong>A way back</strong> — any past state can be restored exactly, which is what makes risky changes
          safe to try.
        </li>
      </ul>
      <CodeBlock language="bash" filename="what history looks like instead" code={gitVersion} />

      <DifficultyLevels
        simple={
          <p>
            Version control is an undo button for a whole project, one that never forgets and that several people
            can share.
          </p>
        }
        developer={
          <p>
            A version control system records the full state of a project over time as a series of committed
            snapshots, each with an author, timestamp, and message. It supports branching for parallel lines of
            work and merging to bring them back together, and it can reproduce any recorded state exactly.
          </p>
        }
        interview={
          <p>
            Version control systems split into <strong>centralised</strong> (SVN, Perforce — one server holds
            history, clients hold a working copy) and <strong>distributed</strong> (Git, Mercurial — every clone
            holds the complete history). Distributed systems make branching, merging, and offline work cheap, and
            remove the single point of failure, at the cost of a steeper mental model and a full copy of history
            on every machine.
          </p>
        }
      />

      <h2>Centralised versus distributed</h2>
      <p>
        Older systems like Subversion keep the history on one server. You check out a working copy, and almost
        every operation — committing, viewing history, branching — needs the server. If it's down, or you're on a
        train, you're stuck.
      </p>
      <p>
        Git is <strong>distributed</strong>: when you clone a repository you get the entire history, not just the
        latest files. Committing, branching, searching history, and diffing all happen on your machine, at local
        disk speed. You only need the network to share work with other people.
      </p>

      <Callout variant="tip" title="This is why Git feels fast">
        Creating a branch in Git is instant because nothing is copied and no server is contacted — it writes a
        41-byte file. In centralised systems, branching often meant copying a directory on a server, which is why
        older teams branched rarely and dreaded merging.
      </Callout>

      <h2>Common mistake</h2>
      <CommonMistake
        title="using cloud file sync as version control"
        wrong={`Dropbox/
  project/   <- synced folder
  project (conflicted copy).../`}
        right={`project/
  .git/      <- full history, messages, authors
  src/`}
        explanation={
          <p>
            File sync tools copy bytes; they don't understand your project. They can't tell you why a change was
            made, can't merge two people's edits to the same file sensibly, and will happily sync a broken state to
            everyone. They solve backup, not collaboration or history.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="What is the main practical difference between a centralised and a distributed version control system?"
        options={[
          { id: "a", text: "Distributed systems don't keep a history" },
          { id: "b", text: "In a distributed system, every clone contains the full project history" },
          { id: "c", text: "Centralised systems can't be used by teams" },
          { id: "d", text: "Distributed systems require a permanent network connection" },
        ]}
        correctId="b"
        explanation="A clone in Git is a complete copy of the repository, including all history. That's why committing, branching, and reading history work offline — and why there's no single machine whose loss destroys the project."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Find the version control you've already improvised"
        hint={
          <p>
            Look for filenames containing <code>final</code>, <code>old</code>, <code>backup</code>, a date, or a
            version number.
          </p>
        }
      >
        Open any folder of work you've done — code, a dissertation, design files. Find the places where you
        invented your own versioning with filenames. For each one, write down the question you'd need answered
        today ("what changed here, and why?") and notice that the filename can't answer it.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="Why would a team choose Git over a centralised VCS like SVN?"
        answer={
          <p>
            The usual answer is speed and offline work, but the deeper reason is <strong>cheap branching</strong>.
            Because a branch is just a pointer to a commit, creating and merging branches costs almost nothing,
            which makes short-lived feature branches and pull-request review practical as an everyday workflow. In
            centralised systems, branching was expensive enough that teams avoided it and worked on a shared trunk,
            which pushes integration pain to the end. Git also removes the single point of failure: every clone is
            a full backup. The honest trade-off is complexity — Git's model takes longer to learn, and large binary
            assets are handled better by centralised tools or Git LFS.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "Version control records not just files, but what changed, when, by whom, and why.",
          "Copying folders and syncing files solves backup — not history, attribution, or collaboration.",
          "Centralised systems keep history on a server; distributed ones give every clone the full history.",
          "Git is distributed, which is why committing, branching, and reading history are fast and work offline.",
          "Cheap branching is the feature that changed how teams work day to day.",
        ]}
      />
    </>
  )
}
