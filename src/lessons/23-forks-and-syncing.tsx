import { GitFork, GitBranch, GitPullRequest, RefreshCw } from "lucide-react"
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

const contributionSteps: FlowStep[] = [
  {
    id: "s1",
    label: "Fork on GitHub",
    detail: "Creates your own server-side copy of the repository, under your account, that you have write access to.",
    icon: GitFork,
  },
  {
    id: "s2",
    label: "Clone your fork, add upstream",
    detail: "origin points at your fork; upstream points at the original project. Two remotes, two different jobs.",
    icon: RefreshCw,
  },
  {
    id: "s3",
    label: "Branch, commit, push to your fork",
    detail: "Never work on main — a branch per change keeps your fork reusable for the next contribution.",
    icon: GitBranch,
  },
  {
    id: "s4",
    label: "Open a pull request to the original",
    detail: "GitHub compares your branch against the project's main and lets maintainers review and merge it.",
    icon: GitPullRequest,
    tone: "success",
  },
]

const setup = `# 1. Fork on github.com (the button, top right)

# 2. Clone YOUR fork
git clone git@github.com:me/awesome-lib.git
cd awesome-lib

# 3. Add the original project as a second remote
git remote add upstream https://github.com/original/awesome-lib.git

git remote -v
origin    git@github.com:me/awesome-lib.git (fetch)
origin    git@github.com:me/awesome-lib.git (push)
upstream  https://github.com/original/awesome-lib.git (fetch)
upstream  https://github.com/original/awesome-lib.git (push)`

const syncing = `# Bring your fork's main up to date with the original project
git fetch upstream
git switch main
git merge upstream/main      # or: git rebase upstream/main
git push origin main

# Then start your work from a current base
git switch -c fix/typo-in-docs`

const contributing = `git switch -c fix/handle-empty-input
# ...make the change, commit...
git push -u origin fix/handle-empty-input
# GitHub prints a link to open the pull request`

export default function ForksAndSyncingLesson() {
  return (
    <>
      <p>
        You can't push to a repository you don't have write access to — which is most of open source. A{" "}
        <strong>fork</strong> gives you a copy you <em>can</em> push to, and a pull request is how you offer your
        change back.
      </p>

      <h2>The contribution loop</h2>
      <StepFlowDiagram title="Fork → branch → PR" steps={contributionSteps} autoPlayMs={1800} />

      <h2>Fork versus clone versus branch</h2>
      <ul>
        <li>
          <strong>Fork</strong> — a copy of the repository on the <em>server</em>, under your account. A GitHub
          feature, not a Git command.
        </li>
        <li>
          <strong>Clone</strong> — a copy on your <em>machine</em>. A Git command.
        </li>
        <li>
          <strong>Branch</strong> — a line of work <em>inside</em> a repository. Also a Git command.
        </li>
      </ul>
      <p>
        A typical open-source contribution uses all three: fork the project, clone your fork, branch inside the
        clone.
      </p>

      <AnalogyCard title="Fork is your own photocopy of the recipe book.">
        The library won't let you write in its copy. So you photocopy it, annotate your version freely, and then
        send the librarian a note: "page 42, this quantity is wrong, here's my correction." They decide whether to
        update the original. Your copy stays yours either way.
      </AnalogyCard>

      <h2>Setting up the two remotes</h2>
      <CodeBlock language="bash" filename="fork setup" code={setup} />
      <p>
        The convention is worth memorising: <strong><code>origin</code> is your fork</strong> (you push there),{" "}
        <strong><code>upstream</code> is the original</strong> (you pull from there). Mixing them up is the single
        most common fork mistake.
      </p>

      <h2>Keeping your fork current</h2>
      <p>
        A fork does not update itself. Left alone for a month, your <code>main</code> drifts behind the project's,
        and pull requests from it fill with unrelated conflicts.
      </p>
      <CodeBlock language="bash" filename="syncing" code={syncing} />
      <p>
        GitHub's web UI also has a "Sync fork" button that does the same thing for the default branch. Either way,
        sync <em>before</em> starting new work, not after you've finished it.
      </p>

      <h2>Making the contribution</h2>
      <CodeBlock language="bash" filename="a contribution" code={contributing} />

      <Callout variant="tip" title="Read CONTRIBUTING.md first">
        Most established projects document what they expect: commit message format, whether to squash, which branch
        to target, how to run the tests. Following it is the difference between a pull request that gets merged and
        one that stalls for weeks.
      </Callout>

      <DifficultyLevels
        simple={
          <p>
            A fork is your own copy of someone else's project on GitHub. You change your copy, then ask the original
            owner to take your change.
          </p>
        }
        developer={
          <p>
            Forking is a platform-level clone with a permission boundary: you get push access to your copy only.
            Locally you configure two remotes — <code>origin</code> (fork) and <code>upstream</code> (original) — and
            keep your default branch in sync with <code>upstream</code> so feature branches start from current code.
            Cross-fork pull requests compare your branch against the upstream base.
          </p>
        }
        interview={
          <p>
            Points that show experience: forks are a GitHub concept, not a Git one; the <code>origin</code>/
            <code>upstream</code> convention; syncing before branching to avoid conflict-laden PRs; never committing
            to your fork's <code>main</code>, so it stays a clean mirror; and that maintainers can push to your PR
            branch if "allow edits from maintainers" is ticked.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="working directly on your fork's main"
        wrong={`git switch main
# ...commit the fix here...
git push origin main
# now your main and upstream's
# have permanently diverged`}
        right={`git switch -c fix/empty-input
# ...commit the fix here...
git push -u origin fix/empty-input`}
        explanation={
          <p>
            Once your <code>main</code> contains commits the project doesn't have, syncing it means merging or
            resetting every time, and a second contribution starts from a polluted base. Keep <code>main</code> as a
            pure mirror of upstream and do all work on branches.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="In the standard fork workflow, what do origin and upstream refer to?"
        options={[
          { id: "a", text: "origin is the original project; upstream is your fork" },
          { id: "b", text: "origin is your fork; upstream is the original project" },
          { id: "c", text: "Both point at the original project" },
          { id: "d", text: "origin is local; upstream is remote" },
        ]}
        correctId="b"
        explanation="Clone sets origin to whatever you cloned — your fork. You then add upstream by hand for the original project. You push to origin and fetch from upstream."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Do a real contribution end to end"
        hint={
          <p>
            Documentation fixes are ideal first contributions — small, easy to verify, and genuinely welcome. Look
            for a "good first issue" label.
          </p>
        }
      >
        Find a small open-source project with a typo or an unclear sentence in its README. Fork it, add{" "}
        <code>upstream</code>, branch, fix, push, and open a pull request. The technical loop is the same whether the
        change is one word or a thousand lines.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="Walk me through contributing to an open-source project you don't have write access to."
        answer={
          <p>
            Fork the repository on GitHub, which gives me a server-side copy I can push to. Clone my fork —{" "}
            <code>origin</code> now points at it — and add the original as a second remote called{" "}
            <code>upstream</code>. Before starting, I sync my <code>main</code> with{" "}
            <code>upstream/main</code> so I'm building on current code, then create a feature branch; I never commit
            to my fork's <code>main</code>, so it stays a clean mirror. I make focused commits, push the branch to my
            fork, and open a pull request against the upstream repository, following whatever{" "}
            <code>CONTRIBUTING.md</code> specifies. If review takes a while and upstream moves, I sync and rebase my
            branch so the diff stays clean. Worth adding: forks are a GitHub feature — Git itself just sees another
            remote.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "A fork is a server-side copy you have write access to; it's a GitHub feature, not a Git command.",
          "Convention: origin = your fork, upstream = the original project.",
          "Forks don't auto-update — sync main from upstream before starting new work.",
          "Never commit to your fork's main; keep it a clean mirror and work on branches.",
          "Read CONTRIBUTING.md before opening a pull request.",
        ]}
      />
    </>
  )
}
