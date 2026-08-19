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
  { id: "a", label: "c1", lane: 0 },
  { id: "b", label: "c2", lane: 0, parents: ["a"] },
  { id: "c", label: "c3", lane: 0, parents: ["b"] },
  { id: "d", label: "c4", lane: 0, parents: ["c"] },
]

const refs: GraphRef[] = [{ at: "d", name: "main" }]

const insideGit = `ls -a my-project

.git        <- the entire repository lives here
index.html
styles.css`

export default function WhatIsGitLesson() {
  return (
    <>
      <p>
        Git is a program you install on your computer. It watches one folder, and when you tell it to, it records
        the state of everything inside that folder as a permanent, named snapshot. That's the whole idea. Everything
        else — branches, merges, remotes, pull requests — is built on top of it.
      </p>

      <h2>Git is a tool. GitHub is a website.</h2>
      <p>
        This is the single most common confusion, so let's kill it immediately. <strong>Git</strong> is the version
        control software, written by Linus Torvalds in 2005 to manage the Linux kernel. It runs entirely on your
        machine and needs no internet connection. <strong>GitHub</strong> is a company (now owned by Microsoft) that
        hosts Git repositories online and adds collaboration features around them: pull requests, issues, code
        review, CI.
      </p>
      <p>
        You can use Git for years without ever creating a GitHub account. You cannot use GitHub in any meaningful
        way without Git. GitLab, Bitbucket, Codeberg, and a server in your own office are all alternatives to
        GitHub — they all speak the same Git.
      </p>

      <AnalogyCard title="Git is the camera. GitHub is the photo-sharing site.">
        The camera takes and stores the pictures; it works perfectly well with no account anywhere. The sharing site
        is where you upload them so other people can see them, comment on them, and work on an album together. Swap
        the sharing site and your photos are unaffected — they were never the camera's reason for existing.
      </AnalogyCard>

      <h2>What a repository is</h2>
      <p>
        A <strong>repository</strong> (repo) is a folder that Git is tracking. It's an ordinary folder with one
        extra thing inside it — a hidden <code>.git</code> directory:
      </p>
      <CodeBlock language="bash" filename="terminal" code={insideGit} />
      <p>
        That <code>.git</code> folder holds every commit, every branch, every message, and every past version of
        every file. Delete it and you're left with plain files and no history. Copy the whole folder to a USB stick
        and you've copied the entire project history with it.
      </p>

      <Callout variant="warning" title="Never edit .git by hand">
        Everything in <code>.git</code> is managed by Git's commands. Opening it out of curiosity is fine and
        genuinely educational — dragging files around inside it is how repositories get corrupted.
      </Callout>

      <h2>History is a chain of commits</h2>
      <p>
        A <strong>commit</strong> is one recorded snapshot: the state of your files, plus who made it, when, and a
        message saying why. Each commit points back at the one before it, so history forms a chain. A{" "}
        <strong>branch</strong> — like <code>main</code> — is just a label that points at one commit in that chain,
        and moves forward as you add new ones.
      </p>
      <CommitGraphDiagram commits={commits} refs={refs} laneLabels={{ 0: "main" }} title="Four commits, one branch" />

      <DifficultyLevels
        simple={
          <p>
            Git is a program that takes labelled photos of your project folder. GitHub is a website where you store
            those photos so others can see them.
          </p>
        }
        developer={
          <p>
            Git is a distributed version control system. It stores content as immutable objects addressed by a hash
            of their contents, and models history as a directed acyclic graph of commits, each pointing to its
            parent(s) and to a tree describing the project's files at that moment. Branches and tags are lightweight
            pointers into that graph.
          </p>
        }
        interview={
          <p>
            Git's design choices matter in interviews: content-addressable storage means an identical file stored
            twice is stored once; commit hashes cover the parent, so history can't be silently rewritten without
            every later hash changing; and because the graph is a DAG rather than a line, merges are a first-class
            concept rather than a patch-and-pray operation. "Distributed" means every clone is a complete
            repository, not a checkout.
          </p>
        }
      />

      <h2>What Git is not</h2>
      <ul>
        <li>
          <strong>Not a backup system.</strong> It's excellent at recovering versions you committed, and useless for
          work you never committed. Commit often.
        </li>
        <li>
          <strong>Not a good home for large binaries.</strong> Video, huge datasets, and design assets bloat history
          because every version is kept. Use Git LFS or external storage.
        </li>
        <li>
          <strong>Not a place for secrets.</strong> Anything committed is in history forever, even if you delete it
          in a later commit. Treat a committed API key as leaked.
        </li>
        <li>
          <strong>Not a deployment tool</strong>, though plenty of deployment tools are triggered by it.
        </li>
      </ul>

      <h2>Common mistake</h2>
      <CommonMistake
        title="thinking a GitHub account is required to use Git"
        wrong={`# "I can't start yet, I haven't
# made a GitHub account"`}
        right={`git init
git add .
git commit -m "Initial commit"
# a complete repository, offline`}
        explanation={
          <p>
            Git is entirely local. You can create a repository, commit for months, branch, merge, and inspect
            history without ever touching a network. Adding a remote like GitHub is an optional later step —
            valuable for backup and collaboration, but never a prerequisite.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="You lose your internet connection. Which of these can you no longer do?"
        options={[
          { id: "a", text: "Commit changes" },
          { id: "b", text: "Create and switch branches" },
          { id: "c", text: "Push your commits to GitHub" },
          { id: "d", text: "Read the project's history" },
        ]}
        correctId="c"
        explanation="Committing, branching, and reading history all happen against the .git folder on your own machine. Only operations that talk to a remote — push, fetch, pull, clone — need the network."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Look inside a real .git folder"
        hint={
          <p>
            On macOS or Linux: <code>ls -a</code>. On Windows PowerShell: <code>Get-ChildItem -Force</code>. Then
            look at <code>.git/HEAD</code> — it's a one-line text file.
          </p>
        }
      >
        Find any project on your machine that's already a Git repository (or make one later, in lesson 6). List its
        hidden files, open <code>.git/HEAD</code> in a text editor, and see for yourself that the thing everyone
        calls "the current branch" is a single line of plain text.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="What's the difference between Git and GitHub?"
        answer={
          <p>
            Git is the distributed version control system — a command-line program that stores your project's
            history locally in a <code>.git</code> directory. GitHub is a hosting platform for Git repositories that
            adds a web interface and collaboration features Git itself has no opinion about: pull requests, issue
            tracking, code review, permissions, and CI/CD through Actions. Git works fully offline and without any
            account; GitHub is one of several interchangeable hosts (GitLab, Bitbucket, self-hosted Gitea) that all
            speak the same protocol. A good extra detail: pull requests are <em>not</em> a Git concept at all —
            they're a platform feature layered on top of Git's branches.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "Git is a local program; GitHub is a website that hosts Git repositories and adds collaboration tools.",
          "A repository is a folder containing a hidden .git directory that holds the complete history.",
          "A commit is a snapshot plus author, timestamp, and message; commits chain together into history.",
          "A branch is just a moving label pointing at a commit.",
          "Committing, branching, and reading history are offline operations — only remote commands need the network.",
        ]}
      />
    </>
  )
}
