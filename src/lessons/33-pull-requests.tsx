import { GitBranch, GitPullRequest, MessagesSquare, GitMerge } from "lucide-react"
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

const prSteps: FlowStep[] = [
  {
    id: "p1",
    label: "Branch and commit",
    detail: "Work on a branch off an up-to-date main. Small, focused commits with real messages.",
    icon: GitBranch,
  },
  {
    id: "p2",
    label: "Push and open the PR",
    detail: "Describe what changed and why, link the issue, and say how you tested it. CI starts automatically.",
    icon: GitPullRequest,
  },
  {
    id: "p3",
    label: "Review and iterate",
    detail: "Reviewers comment; you push more commits to the same branch and the PR updates itself. Reply to every thread.",
    icon: MessagesSquare,
  },
  {
    id: "p4",
    label: "Merge and clean up",
    detail: "Choose merge, squash, or rebase, then delete the branch. The linked issue closes on merge.",
    icon: GitMerge,
    tone: "success",
  },
]

const description = `## What

Adds a /api/search endpoint with pagination and a 200ms debounce
on the client input.

## Why

Closes #482. Users on the catalogue page had no way to find a
product without scrolling; support gets this weekly.

## How to test

1. npm run dev
2. Go to /products, type "blue"
3. Results narrow after ~200ms; try page 2

## Notes for the reviewer

- The debounce lives in useSearch, not the component, so it can
  be reused by the admin search later.
- I deliberately did NOT add fuzzy matching — it's a bigger
  change and belongs in its own PR (#503).`

const ghCommands = `gh pr create --fill                  # use the branch's commits for title/body
gh pr create --draft                 # open as a draft
gh pr checkout 482                   # check out someone's PR locally
gh pr diff 482
gh pr review 482 --approve
gh pr merge 482 --squash --delete-branch
gh pr status`

const updating = `# Bring in the latest main while under review
git fetch origin
git rebase origin/main      # linear, needs --force-with-lease to push
# or
git merge origin/main       # no force push needed, adds a merge commit

git push --force-with-lease  # only after a rebase`

export default function PullRequestsLesson() {
  return (
    <>
      <p>
        A pull request is a proposal: "here's a branch, please review it and merge it into <code>main</code>". It's
        where code review, CI, and the merge decision all come together — and it's a platform feature, not a Git
        one.
      </p>

      <h2>The lifecycle</h2>
      <StepFlowDiagram title="A pull request, start to finish" steps={prSteps} autoPlayMs={1900} />

      <h2>Writing a description reviewers can act on</h2>
      <CodeBlock language="markdown" filename="PR description" code={description} />
      <p>
        The four things a reviewer actually needs: what changed, why, how to verify it, and what you decided{" "}
        <em>not</em> to do. That last section prevents the most common review comment — "why didn't you also…" —
        before it's written.
      </p>

      <AnalogyCard title="A PR is a pitch, not a delivery.">
        You're not dropping a box at reception; you're presenting a proposal to people whose job is to find problems
        with it. Give them the context they'd otherwise have to reconstruct, and their attention goes on the code
        rather than on working out what you were trying to do.
      </AnalogyCard>

      <h2>Size is the single biggest factor</h2>
      <ul>
        <li>
          <strong>Under ~200 lines</strong> — gets a genuine line-by-line review.
        </li>
        <li>
          <strong>Around 500</strong> — gets a skim and a few comments.
        </li>
        <li>
          <strong>Over 1,000</strong> — gets "LGTM 👍" and no real scrutiny at all.
        </li>
      </ul>
      <p>
        If a change is genuinely large, split it: a refactor PR that changes no behaviour, then a feature PR on top.
        Reviewers can hold one of those in their head at a time.
      </p>

      <Callout variant="tip" title="Draft PRs are underused">
        Open a draft as soon as you start. CI runs, teammates can see the direction early, and you get architectural
        feedback before you've written the code that depends on it. Mark it ready when it is.
      </Callout>

      <h2>Keeping it current</h2>
      <CodeBlock language="bash" filename="updating a PR branch" code={updating} />
      <p>
        Pushing to the same branch updates the pull request automatically — there's no "resubmit". Whether you
        rebase or merge <code>main</code> in is a team preference; rebase keeps the diff clean, merge avoids force
        pushes mid-review.
      </p>

      <h2>The three merge buttons</h2>
      <ul>
        <li>
          <strong>Create a merge commit</strong> — all commits plus a merge commit. Full history, busier graph.
        </li>
        <li>
          <strong>Squash and merge</strong> — one commit on <code>main</code> per PR. The most common default;
          detailed history stays in the PR.
        </li>
        <li>
          <strong>Rebase and merge</strong> — commits replayed individually, no merge commit. Only pleasant when the
          branch's commits are already tidy.
        </li>
      </ul>

      <h2>From the terminal</h2>
      <CodeBlock language="bash" filename="gh pr" code={ghCommands} />

      <DifficultyLevels
        simple={
          <p>
            Push a branch, open a pull request describing your change, respond to review comments by pushing more
            commits, then merge and delete the branch.
          </p>
        }
        developer={
          <p>
            A PR is a platform object binding a head ref to a base ref, with review state, status checks, and a
            merge strategy. Pushing to the head branch updates it in place. Branch protection can require approvals,
            passing checks, up-to-date branches, and code owner review before the merge button unlocks.
          </p>
        }
        interview={
          <p>
            Cover the mechanics and the judgement: PRs aren't a Git feature; size drives review quality far more
            than reviewer diligence does; draft PRs surface direction early; and the merge strategy choice is really
            a choice about what <code>main</code>'s history should look like. Mentioning that you split refactors
            from behaviour changes signals real review experience.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="one PR containing a refactor and a feature"
        wrong={`"Add search (and reformat the
whole catalogue module)"
+2,400 −1,900`}
        right={`PR 1: "Extract catalogue helpers"
      (no behaviour change)
PR 2: "Add product search"
      +180 −12`}
        explanation={
          <p>
            When formatting and logic changes are mixed, the reviewer can't see which lines actually do something —
            so they stop looking. Landing the mechanical change first makes the second diff small enough to review
            properly, which is the entire point of the exercise.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="A reviewer asks for changes. How do you update the pull request?"
        options={[
          { id: "a", text: "Close it and open a new one" },
          { id: "b", text: "Push new commits to the same branch — the PR updates automatically" },
          { id: "c", text: "Upload a patch file to the discussion" },
          { id: "d", text: "Ask a maintainer to apply the changes" },
        ]}
        correctId="b"
        explanation="A pull request tracks a branch, not a snapshot. Any push to that branch updates the PR, re-runs CI, and shows reviewers the new commits."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Split one PR into two"
        hint={
          <p>
            Branch the refactor from <code>main</code>, then branch the feature from the refactor branch and target
            the PR at it.
          </p>
        }
      >
        Take a change you'd normally ship as one pull request and split it into a no-behaviour-change refactor and a
        feature on top. Open both, and compare how the two diffs read against the combined one.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="Walk me through your pull request process."
        answer={
          <p>
            I branch from an up-to-date <code>main</code>, keep commits small and focused, and open a draft PR early
            so CI runs and the direction is visible before I've built too much on it. The description covers what
            changed, why (with the issue linked via a closing keyword), how to test it, and anything I deliberately
            left out. I keep the diff small — under a couple of hundred lines if I can — and split mechanical
            refactors from behaviour changes, because a mixed diff simply doesn't get reviewed properly. During
            review I respond to every comment, push follow-up commits rather than opening a new PR, and rebase or
            merge <code>main</code> in if it's moved. On merge I use whatever strategy the team agreed — usually
            squash, so <code>main</code> stays one commit per PR — and delete the branch.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "A pull request proposes merging one branch into another; it's a platform feature, not Git.",
          "Describe what, why, how to test, and what you deliberately didn't do.",
          "Small PRs get real reviews; large ones get rubber-stamped.",
          "Pushing to the branch updates the PR — never close and reopen.",
          "Merge, squash, or rebase: a decision about what main's history should look like.",
        ]}
      />
    </>
  )
}
