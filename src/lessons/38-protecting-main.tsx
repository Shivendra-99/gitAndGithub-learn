import { AnalogyCard } from "@/components/lesson/analogy-card"
import { Callout } from "@/components/lesson/callout"
import { Challenge } from "@/components/lesson/challenge"
import { CodeBlock } from "@/components/lesson/code-block"
import { CommonMistake } from "@/components/lesson/common-mistake"
import { DifficultyLevels } from "@/components/lesson/difficulty-levels"
import { InterviewQuestion } from "@/components/lesson/interview-question"
import { KeyTakeaways } from "@/components/lesson/key-takeaways"
import { Quiz } from "@/components/lesson/quiz"

const rules = `Branch: main

[x] Require a pull request before merging
    [x] Require 1 approval
    [x] Dismiss stale approvals when new commits are pushed
    [x] Require review from Code Owners
[x] Require status checks to pass
    [x] Require branches to be up to date before merging
    - ci / test
    - ci / lint
[x] Require conversation resolution before merging
[x] Block force pushes
[x] Restrict deletions
[ ] Require signed commits          (nice, needs team setup first)
[ ] Require linear history          (only with squash or rebase merges)`

const hooks = `# .husky/pre-commit — runs before every commit, locally
npx lint-staged

# .husky/pre-push — a last check before it leaves your machine
npm test -- --run

# A local hook is a convenience, not a control:
git commit --no-verify    # skips it entirely`

const rejected = `git push origin main

remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Changes must be made through a pull request.
 ! [remote rejected] main -> main (protected branch hook declined)`

export default function ProtectingMainLesson() {
  return (
    <>
      <p>
        Branch protection turns your team's agreements into rules the platform enforces. Not because people are
        careless — because everyone is occasionally tired, and <code>git push origin main</code> at 6pm on a Friday
        is one keystroke away from a normal push.
      </p>

      <h2>A reasonable rule set</h2>
      <CodeBlock language="bash" filename="Settings → Branches → Rules" code={rules} />
      <p>What each one buys you:</p>
      <ul>
        <li>
          <strong>Require a pull request</strong> — nothing reaches <code>main</code> unreviewed. The single
          highest-value rule.
        </li>
        <li>
          <strong>Dismiss stale approvals</strong> — an approval covers the code that was reviewed, not whatever
          gets pushed afterwards.
        </li>
        <li>
          <strong>Require status checks</strong> — this is what makes CI a gate rather than a notification.
        </li>
        <li>
          <strong>Require branches up to date</strong> — catches the case where two PRs pass individually and break
          when combined. Costs a rebase per merge, so it's a trade-off on busy repositories.
        </li>
        <li>
          <strong>Require conversation resolution</strong> — stops a merge with unanswered review threads.
        </li>
        <li>
          <strong>Block force pushes and deletions</strong> — makes <code>main</code>'s history genuinely
          append-only.
        </li>
      </ul>

      <AnalogyCard title="A door that locks behind you.">
        Nobody installs a lock because they expect burglars every night. They install it because the cost of the one
        bad night is enormous and the cost of the lock is nothing. Protection rules are the same trade: a small,
        constant inconvenience against a rare, expensive mistake.
      </AnalogyCard>

      <h2>What it looks like when it works</h2>
      <CodeBlock language="bash" filename="a blocked push" code={rejected} />
      <p>
        That message is the system doing its job. The fix is never to disable the rule — it's to open a pull
        request.
      </p>

      <h2>CODEOWNERS</h2>
      <p>
        Combined with "require review from Code Owners", a <code>CODEOWNERS</code> file makes review routing
        automatic: changes to <code>/src/payments/</code> require the finance team's approval, changes to{" "}
        <code>/infra/</code> require platform's. Reviewers stop being chosen by whoever happens to be online.
      </p>

      <h2>Local hooks are convenience, not control</h2>
      <CodeBlock language="bash" filename="husky hooks" code={hooks} />
      <p>
        Pre-commit hooks catch problems seconds after you create them, which is genuinely valuable — a formatter and
        a linter running on staged files saves a review round trip. But hooks live in each person's clone and{" "}
        <code>--no-verify</code> skips them. Anything that <em>must</em> hold is a server-side rule.
      </p>

      <Callout variant="warning" title="Don't lock yourself out">
        On a solo repository, "require 1 approval" means nobody can approve your PRs. Either allow the repository
        admin to bypass, or use rules that don't need a second person — required status checks and blocked force
        pushes still add real value on their own.
      </Callout>

      <h2>Beyond branch rules</h2>
      <ul>
        <li>
          <strong>Secret scanning with push protection</strong> — blocks a credential at push time, before it's ever
          in history.
        </li>
        <li>
          <strong>Dependabot</strong> — automated pull requests for vulnerable dependencies.
        </li>
        <li>
          <strong>Required signed commits</strong> — proves who authored what, since author fields are otherwise
          free text.
        </li>
        <li>
          <strong>Environment protection rules</strong> — a manual approval before a deploy job touches production.
        </li>
      </ul>

      <DifficultyLevels
        simple={
          <p>
            Branch protection stops anyone pushing straight to <code>main</code>, requires a review and passing
            tests, and blocks force pushes — so the important branch can't be broken by accident.
          </p>
        }
        developer={
          <p>
            Rules are enforced server-side on ref updates: required pull requests, approval counts, stale-approval
            dismissal, required status checks (optionally with strict up-to-date branches), conversation resolution,
            and force-push/deletion blocks. Repository rulesets extend this across multiple repositories and
            patterns.
          </p>
        }
        interview={
          <p>
            The distinction worth drawing is client-side versus server-side enforcement: hooks are advisory and
            bypassable with <code>--no-verify</code>; branch protection is not. Then name the specific rules and what
            each prevents, and mention the trade-off of "require up to date" on a high-traffic repository, where it
            can serialise merges.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="CI that runs but isn't required"
        wrong={`# Actions runs the tests on every PR.
# The merge button is green anyway.
# Failures get merged all week.`}
        right={`# Settings → Branches → Require status
# checks to pass → select "ci / test"
# Now a red build blocks the merge.`}
        explanation={
          <p>
            A workflow that runs and reports is only information; people under pressure merge past a red X. Marking
            the check required is what converts CI from a suggestion into a gate — and it's a single checkbox that
            most repositories never tick.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="Why isn't a pre-commit hook sufficient to guarantee tests run before code reaches main?"
        options={[
          { id: "a", text: "Hooks can't run test suites" },
          { id: "b", text: "Hooks are local, aren't shared automatically, and can be skipped with --no-verify" },
          { id: "c", text: "Hooks only work on Linux" },
          { id: "d", text: "Hooks run after the push, not before" },
        ]}
        correctId="b"
        explanation="Hooks live in each developer's .git directory and are trivially bypassed. They're a fast local convenience; the actual guarantee has to come from a server-side rule like a required status check."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Protect a branch and feel it work"
        hint={
          <p>
            On a personal repository, enable "require a pull request" and try pushing to <code>main</code> — read the
            rejection carefully.
          </p>
        }
      >
        Turn on branch protection for a repository you own: require a pull request, require your CI check, and block
        force pushes. Then deliberately try to push to <code>main</code> and confirm the rejection. Doing it once
        makes the concept concrete.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="How do you stop bad code reaching main?"
        answer={
          <p>
            Layers, with the enforcement server-side. Locally, pre-commit hooks run a formatter and linter on staged
            files for fast feedback — but they're a convenience, since they live in each clone and{" "}
            <code>--no-verify</code> skips them. The real gate is branch protection on <code>main</code>: require a
            pull request with at least one approval, dismiss stale approvals when new commits land, require the CI
            status checks to pass, require review from code owners for sensitive paths, require conversation
            resolution, and block force pushes and deletions. The detail people miss is that a workflow which merely
            runs isn't a gate — the check has to be marked <em>required</em>, or a red build is just a symbol next to
            a green merge button. Beyond that, secret scanning with push protection and Dependabot cover the classes
            of problem review is bad at catching.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "Branch protection enforces team agreements server-side, where they can't be skipped.",
          "Highest value rules: require a PR, require status checks, block force pushes.",
          "CI is only a gate once its check is marked required — running isn't enough.",
          "Dismiss stale approvals so a review covers the code that actually merges.",
          "Local hooks are fast feedback, not enforcement: --no-verify bypasses them.",
        ]}
      />
    </>
  )
}
