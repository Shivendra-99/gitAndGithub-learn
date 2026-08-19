import { AnalogyCard } from "@/components/lesson/analogy-card"
import { Callout } from "@/components/lesson/callout"
import { Challenge } from "@/components/lesson/challenge"
import { CodeBlock } from "@/components/lesson/code-block"
import { CommonMistake } from "@/components/lesson/common-mistake"
import { DifficultyLevels } from "@/components/lesson/difficulty-levels"
import { InterviewQuestion } from "@/components/lesson/interview-question"
import { KeyTakeaways } from "@/components/lesson/key-takeaways"
import { Quiz } from "@/components/lesson/quiz"

const goodIssue = `Title: Checkout fails with a 500 when the cart has 0 items

**What happens**
Clicking "Pay now" with an empty cart returns a 500 and the
browser console shows: TypeError: cannot read 'total' of undefined

**Steps to reproduce**
1. Sign in
2. Remove every item from the cart
3. Click "Pay now"

**Expected**
A message saying the cart is empty, and no request sent.

**Environment**
Chrome 141, staging, build 2026.08.14-3

**Notes**
Started after #471 (cart refactor). Not reproducible in production yet.`

const closingKeywords = `# In a commit message or a PR description:
Fixes #482
Closes #482
Resolves #482

# Multiple issues:
Fixes #482, fixes #501

# Another repository:
Fixes owner/other-repo#12

# Reference without closing:
Related to #482`

const labels = `type:bug          type:feature      type:chore
priority:high     priority:low
area:checkout     area:auth         area:infra
good first issue  help wanted       blocked`

const search = `is:open is:issue label:"good first issue" no:assignee
is:open is:pr review-requested:@me
is:issue is:closed closed:>2026-07-01
is:open label:type:bug -label:priority:low sort:created-asc`

export default function IssuesAndTrackingLesson() {
  return (
    <>
      <p>
        Issues are where the work is described before it exists as code. Keeping them in the same place as the code
        means the bug report, the discussion, the commit, and the pull request all link to each other
        automatically.
      </p>

      <h2>What a useful issue looks like</h2>
      <CodeBlock language="markdown" filename="a bug report worth filing" code={goodIssue} />
      <p>
        The essentials: what happened, how to reproduce it, what you expected instead, and enough environment
        detail to rule things out. "Checkout is broken" starts a conversation; the above starts a fix.
      </p>

      <AnalogyCard title="A repair request, not a complaint.">
        "The car makes a noise" gets you a phone call asking questions. "A grinding noise from the front left when
        braking below 20mph, since Tuesday" gets you a mechanic who already knows where to look. Same problem, one
        of them skips a whole round trip.
      </AnalogyCard>

      <h2>Linking issues to code</h2>
      <CodeBlock language="bash" filename="closing keywords" code={closingKeywords} />
      <p>
        A closing keyword in a pull request description closes the issue automatically when the PR merges into the
        default branch. The value isn't saving a click — it's the permanent link. Two years later, <code>git blame</code>{" "}
        leads to a commit, the commit leads to a PR, and the PR leads to the discussion explaining why.
      </p>

      <Callout variant="tip" title="Put the keyword in the PR description, not the branch name">
        GitHub reads closing keywords from commit messages on the default branch and from pull request bodies.
        Branch names are ignored, so <code>fix/482-checkout</code> alone won't close anything.
      </Callout>

      <h2>Labels that earn their keep</h2>
      <CodeBlock language="bash" filename="a label scheme" code={labels} />
      <p>
        Prefixed labels stay sortable and readable as the list grows. Two carry special weight in open source:{" "}
        <strong>good first issue</strong> and <strong>help wanted</strong> — GitHub surfaces both to people looking
        for somewhere to start.
      </p>

      <h2>Search, which is the real feature</h2>
      <CodeBlock language="bash" filename="issue search" code={search} />
      <p>
        The search syntax works across issues and pull requests, in one repository or all of them. Saving two or
        three of these queries is more useful than any amount of board configuration.
      </p>

      <h2>Projects</h2>
      <p>
        GitHub Projects adds boards, tables, and roadmaps over the same issues and pull requests — custom fields,
        grouping, and automation like "move to Done when the PR merges". Because it's a view rather than a separate
        system, nothing has to be kept in sync by hand.
      </p>

      <DifficultyLevels
        simple={
          <p>
            Issues are the to-do list and bug tracker that live with your code. Mention "Fixes #12" in a pull
            request and merging it closes issue 12 automatically.
          </p>
        }
        developer={
          <p>
            Issues, pull requests, and commits share one reference namespace, so <code>#482</code> cross-links from
            anywhere and closing keywords in a PR body or a default-branch commit close the issue on merge. Labels
            plus the search syntax are the real triage tools; Projects is a view layer on top with automation.
          </p>
        }
        interview={
          <p>
            Emphasise traceability: the chain from <code>git blame</code> → commit → pull request → issue →
            discussion is what makes a codebase understandable years later, and it costs one line in a PR
            description. Also worth noting that issue data lives only on the platform, so it's not part of the
            repository backup a clone gives you.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="issues that describe a solution instead of a problem"
        wrong={`Title: Add a null check in checkout.js line 42`}
        right={`Title: Checkout 500s when the cart is empty

...symptoms, steps, expected behaviour.
The fix might be a null check — or the
cart shouldn't be reachable at all.`}
        explanation={
          <p>
            An issue framed as a specific fix locks in the first idea anyone had, and hides the actual symptom from
            whoever picks it up. Describe the problem and let the fix be decided in review — sometimes the right
            answer isn't the one in the title.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="Where does 'Fixes #482' need to appear for GitHub to close the issue automatically on merge?"
        options={[
          { id: "a", text: "In the branch name" },
          { id: "b", text: "In the pull request description, or a commit message on the default branch" },
          { id: "c", text: "As a comment on the issue" },
          { id: "d", text: "In a label" },
        ]}
        correctId="b"
        explanation="GitHub reads closing keywords from the PR body and from commits landing on the default branch. Branch names are never parsed for them."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="File one issue and close it with a PR"
        hint={
          <p>
            Put <code>Fixes #1</code> in the pull request description, then watch the issue close the moment the PR
            merges.
          </p>
        }
      >
        In a repository you own, file a real issue for something small using the structure above. Fix it on a
        branch, open a pull request with a closing keyword, and merge. Then follow the trail backwards from the
        commit to the issue and see the whole chain.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="How do you keep issues, commits, and pull requests connected?"
        answer={
          <p>
            By using the shared reference namespace deliberately. Every issue gets a number; branch names carry it
            for humans; the pull request description contains a closing keyword like <code>Fixes #482</code>, which
            both links the two and closes the issue on merge. Commit messages reference the issue where it adds
            context. The payoff is traceability in the other direction: someone puzzled by a line runs{" "}
            <code>git blame</code>, lands on a commit, follows it to the pull request, reads the review discussion,
            and finds the original issue explaining why the behaviour was needed. That chain costs one line to
            maintain and is often the only surviving record of a decision.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "A good issue states symptoms, reproduction steps, expected behaviour, and environment.",
          "Closing keywords (Fixes #12) in a PR body close the issue automatically on merge.",
          "Prefixed labels (type:, area:, priority:) stay usable as the list grows.",
          "The issue search syntax is the real triage tool — save the queries you use.",
          "Describe the problem, not the fix you first thought of.",
        ]}
      />
    </>
  )
}
