import { CloudUpload, CloudDownload, GitMerge, RefreshCw } from "lucide-react"
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

const pullSteps: FlowStep[] = [
  {
    id: "s1",
    label: "git fetch — download",
    detail: "New commits and refs arrive from the remote and update origin/main. Your branch and working directory are untouched. Completely safe.",
    icon: CloudDownload,
  },
  {
    id: "s2",
    label: "git merge origin/main — integrate",
    detail: "The downloaded commits are combined into your current branch. This is the step that can conflict.",
    icon: GitMerge,
    tone: "warning",
  },
  {
    id: "s3",
    label: "...and git pull is just those two",
    detail: "One command, two operations. Splitting them lets you look at what arrived before deciding how to integrate it.",
    icon: RefreshCw,
    tone: "success",
  },
  {
    id: "s4",
    label: "git push — upload",
    detail: "Sends your commits to the remote and moves its branch pointer. Only allowed if it's a fast-forward.",
    icon: CloudUpload,
    tone: "success",
  },
]

const commands = `git fetch                     # update remote-tracking branches, change nothing else
git fetch --prune             # ...and delete refs for branches deleted on the remote
git log HEAD..origin/main     # what arrived that I don't have yet
git pull                      # fetch + merge
git pull --rebase             # fetch + rebase
git push                      # send commits on the current branch
git push -u origin feature    # first push: also set the upstream
git push origin --delete old-branch`

const rejected = `git push

 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to 'github.com:me/repo.git'
hint: Updates were rejected because the remote contains work that you do
hint: not have locally. This is usually caused by another repository pushing
hint: to the same ref.`

export default function PushFetchPullLesson() {
  return (
    <>
      <p>
        Three commands move commits between your machine and the remote. Each goes in one direction, and one of them
        is secretly two commands — which is the source of most confusion about all three.
      </p>

      <h2>The three, in order of safety</h2>
      <StepFlowDiagram title="What each command actually does" steps={pullSteps} autoPlayMs={1800} />
      <CodeBlock language="bash" filename="the commands" code={commands} />

      <AnalogyCard title="Fetch collects the post. Pull opens it and files it.">
        Fetching brings the letters to your desk — nothing has been read, nothing has been acted on, and you can
        ignore them entirely. Pulling collects them <em>and</em> immediately files everything into your existing
        paperwork. That second half is where things can collide with what you were already working on.
      </AnalogyCard>

      <h2>Why fetch-then-look is a good habit</h2>
      <p>
        <code>git pull</code> is convenient, and it also merges before you've seen what arrived. Splitting it gives
        you a moment to look:
      </p>
      <CodeBlock
        language="bash"
        filename="the careful version"
        code={`git fetch
git log --oneline HEAD..origin/main     # what's new upstream
git diff HEAD...origin/main             # what those commits change
git merge origin/main                   # ...now integrate`}
      />

      <Callout variant="tip" title="Configure pull so it can't surprise you">
        <code>git config --global pull.ff only</code> makes <code>pull</code> refuse when a merge would be needed,
        instead of silently creating a merge commit. You then choose explicitly:{" "}
        <code>git pull --rebase</code> or <code>git merge origin/main</code>.
      </Callout>

      <h2>When push is rejected</h2>
      <CodeBlock language="bash" filename="the classic rejection" code={rejected} />
      <p>
        This isn't a permissions problem. It means the remote branch has commits you don't have, so moving its
        pointer to your commit would discard them. Git requires pushes to be <strong>fast-forwards</strong>: the
        remote's current commit must be an ancestor of what you're pushing.
      </p>
      <p>The fix is always the same shape — get their work first, then push:</p>
      <CodeBlock
        language="bash"
        filename="resolving a rejected push"
        code={`git pull --rebase      # replay your commits on top of theirs
# ...resolve any conflicts...
git push`}
      />

      <Callout variant="warning" title="--force is not the fix">
        <code>git push --force</code> makes the rejection go away by deleting the other person's commits from the
        remote. The only legitimate use is on a branch you own and have deliberately rewritten — and even then, use{" "}
        <code>--force-with-lease</code>, which refuses if the remote moved since your last fetch.
      </Callout>

      <h2>Pruning deleted branches</h2>
      <p>
        When a branch is deleted on GitHub, your <code>origin/*</code> refs keep it forever until you prune. Over a
        year that's dozens of ghost branches in your autocomplete:
      </p>
      <CodeBlock
        language="bash"
        filename="cleanup"
        code={`git fetch --prune
git config --global fetch.prune true    # do it automatically, always`}
      />

      <DifficultyLevels
        simple={
          <p>
            <code>fetch</code> downloads without changing your work. <code>pull</code> downloads and merges into
            your work. <code>push</code> uploads your commits.
          </p>
        }
        developer={
          <p>
            <code>fetch</code> updates <code>refs/remotes/*</code> only. <code>pull</code> is{" "}
            <code>fetch</code> + <code>merge</code> (or <code>rebase</code> with <code>--rebase</code>).{" "}
            <code>push</code> uploads objects and requests a ref update, which the server accepts only if it's a
            fast-forward unless forced. <code>-u</code> records the upstream so later bare <code>push</code> and{" "}
            <code>pull</code> know where to go.
          </p>
        }
        interview={
          <p>
            Be able to say that <code>pull</code> is two operations and why splitting them matters; explain a
            rejected push in terms of the fast-forward requirement rather than "permissions"; and distinguish{" "}
            <code>--force</code> from <code>--force-with-lease</code>, which is a race-condition check against the
            remote's current position.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="force-pushing to make a rejection go away"
        wrong={`git push --force
# the colleague's three commits
# are now gone from the remote`}
        right={`git pull --rebase
# ...resolve conflicts...
git push`}
        explanation={
          <p>
            The rejection is Git protecting someone else's work. Forcing past it moves the remote branch to your
            commit and orphans theirs — recoverable via their reflog, but only if they notice, and only if they
            still have it locally. Integrate first; force only on branches you own.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="Which command downloads new commits from the remote without changing your current branch?"
        options={[
          { id: "a", text: "git pull" },
          { id: "b", text: "git fetch" },
          { id: "c", text: "git push" },
          { id: "d", text: "git merge" },
        ]}
        correctId="b"
        explanation="fetch only updates remote-tracking branches like origin/main. Your local branch, working directory, and staged changes are untouched — which is why it's always safe to run."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Cause a rejected push deliberately"
        hint={
          <p>
            Two clones of the same repository on your machine work fine for this — commit and push from one, then
            commit and try to push from the other.
          </p>
        }
      >
        Produce the "Updates were rejected" error on purpose, then resolve it with <code>git pull --rebase</code>{" "}
        followed by <code>git push</code>. Before pulling, run <code>git log --oneline HEAD..origin/main</code> and
        read exactly which commits you were missing.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="What's the difference between git fetch and git pull?"
        answer={
          <p>
            <code>git fetch</code> downloads new objects and updates your remote-tracking branches (
            <code>origin/main</code> and friends). It doesn't touch your local branches, working directory, or index,
            so it can never conflict and is safe to run at any moment. <code>git pull</code> is{" "}
            <code>fetch</code> followed immediately by an integration step — <code>merge</code> by default, or{" "}
            <code>rebase</code> with <code>--rebase</code> — and that second step is what can conflict or create an
            unwanted merge commit. I usually fetch first and look at <code>git log HEAD..origin/main</code> before
            deciding how to integrate, and I set <code>pull.ff only</code> so a plain pull can never quietly merge
            for me.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "fetch downloads and updates remote-tracking branches only — always safe.",
          "pull = fetch + merge (or + rebase). The second half is what can conflict.",
          "push uploads commits and must be a fast-forward, or it's rejected.",
          "A rejected push means the remote has commits you don't — integrate, don't force.",
          "Use --force-with-lease over --force, and fetch --prune to clear deleted remote branches.",
        ]}
      />
    </>
  )
}
