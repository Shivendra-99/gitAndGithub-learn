import { AnalogyCard } from "@/components/lesson/analogy-card"
import { Callout } from "@/components/lesson/callout"
import { Challenge } from "@/components/lesson/challenge"
import { CodeBlock } from "@/components/lesson/code-block"
import { CommonMistake } from "@/components/lesson/common-mistake"
import { DifficultyLevels } from "@/components/lesson/difficulty-levels"
import { InterviewQuestion } from "@/components/lesson/interview-question"
import { KeyTakeaways } from "@/components/lesson/key-takeaways"
import { Quiz } from "@/components/lesson/quiz"
import { CodeWalkthrough, type WalkthroughStep } from "@/components/lesson/code-walkthrough"

const workflow = `name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npm run lint
      - run: npm test -- --run`

const workflowSteps: WalkthroughStep[] = [
  {
    id: "w1",
    label: "name — what shows in the Actions tab",
    detail: "Purely cosmetic, but it's what you'll scan when three workflows are running at once.",
    lines: 1,
  },
  {
    id: "w2",
    label: "on — what triggers it",
    detail: "Here: pushes to main, and every pull request. Other triggers include schedule (cron), release, issues, and workflow_dispatch for a manual button.",
    range: [3, 6],
  },
  {
    id: "w3",
    label: "jobs — units that run in parallel",
    detail: "Each job gets a fresh virtual machine. Jobs run concurrently unless one declares 'needs' on another.",
    lines: 8,
  },
  {
    id: "w4",
    label: "runs-on — the machine",
    detail: "ubuntu-latest is the fast, cheap default. windows-latest and macos-latest exist and cost more minutes per run.",
    lines: 10,
  },
  {
    id: "w5",
    label: "checkout — get the code",
    detail: "The runner starts empty. Without this step your repository isn't there at all — the single most common first-workflow mistake.",
    lines: 12,
  },
  {
    id: "w6",
    label: "setup-node with caching",
    detail: "Installs the requested Node version and caches the npm download directory. Caching typically turns a 90-second install into 10.",
    range: [14, 17],
  },
  {
    id: "w7",
    label: "run — your actual commands",
    detail: "Plain shell. npm ci (not install) for a reproducible install from the lockfile, then lint and tests. Any non-zero exit fails the job.",
    range: [19, 21],
  },
]

const matrix = `jobs:
  test:
    runs-on: \${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest]
        node: [20, 22]
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: \${{ matrix.node }}
      - run: npm ci && npm test`

const secrets = `jobs:
  deploy:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production      # can require manual approval
    permissions:
      contents: read             # least privilege for GITHUB_TOKEN
    steps:
      - uses: actions/checkout@v5
      - run: ./deploy.sh
        env:
          API_TOKEN: \${{ secrets.DEPLOY_TOKEN }}`

export default function GitHubActionsLesson() {
  return (
    <>
      <p>
        Actions runs commands on GitHub's machines when something happens in your repository. The most valuable use
        is the simplest one: run the tests on every pull request, so a broken change can't reach <code>main</code>{" "}
        unnoticed.
      </p>

      <h2>A workflow, line by line</h2>
      <p>
        Workflows are YAML files in <code>.github/workflows/</code>. Add the file, push it, and it starts running —
        there's nothing else to configure.
      </p>
      <CodeWalkthrough
        steps={workflowSteps}
        code={workflow}
        filename=".github/workflows/ci.yml"
        language="yaml"
        title="Anatomy of a CI workflow"
        autoPlayMs={3200}
      />

      <AnalogyCard title="A standing instruction to the office junior.">
        "Whenever a document arrives, print it, check the totals, and tell me if anything doesn't add up." You write
        the instruction once; it runs on every arrival, at 3am, on a bank holiday, without being reminded. The
        instruction is the workflow; the arrival is the trigger.
      </AnalogyCard>

      <h2>The vocabulary</h2>
      <ul>
        <li>
          <strong>Workflow</strong> — one YAML file, triggered by events.
        </li>
        <li>
          <strong>Job</strong> — a set of steps on one fresh machine. Jobs run in parallel by default.
        </li>
        <li>
          <strong>Step</strong> — either <code>run</code> (a shell command) or <code>uses</code> (a reusable
          action).
        </li>
        <li>
          <strong>Action</strong> — a packaged step someone else wrote, like{" "}
          <code>actions/checkout</code>.
        </li>
        <li>
          <strong>Runner</strong> — the machine. GitHub-hosted, or self-hosted for special hardware.
        </li>
      </ul>

      <h2>Testing several combinations at once</h2>
      <CodeBlock language="yaml" filename="matrix builds" code={matrix} />
      <p>
        That matrix produces four jobs — two operating systems times two Node versions — running simultaneously.{" "}
        <code>fail-fast: false</code> stops one failure cancelling the rest, so you see every failing combination
        rather than the first.
      </p>

      <h2>Secrets and permissions</h2>
      <CodeBlock language="yaml" filename="a guarded deploy job" code={secrets} />
      <ul>
        <li>
          Secrets live in repository or environment settings and are injected as{" "}
          <code>{"${{ secrets.NAME }}"}</code>. They're masked in logs.
        </li>
        <li>
          Set <code>permissions</code> explicitly — the default <code>GITHUB_TOKEN</code> scope is broader than most
          workflows need.
        </li>
        <li>
          Pin third-party actions to a version, ideally a commit SHA. A compromised action tag runs with your
          secrets.
        </li>
        <li>
          Use <code>environment:</code> for deploys so production can require a manual approval.
        </li>
      </ul>

      <Callout variant="warning" title="pull_request_target is a footgun">
        Unlike <code>pull_request</code>, it runs with write permissions and access to secrets in the context of the
        base repository — so a workflow that checks out and runs code from a fork under that trigger hands your
        secrets to anyone who opens a PR. Only use it for jobs that don't execute untrusted code, like labelling.
      </Callout>

      <DifficultyLevels
        simple={
          <p>
            Put a YAML file in <code>.github/workflows/</code> saying "when someone pushes, install and run the
            tests". GitHub does it automatically on its own machines.
          </p>
        }
        developer={
          <p>
            Workflows bind events to jobs of steps on ephemeral runners. Steps are shell commands or reusable
            actions; jobs parallelise unless chained with <code>needs</code>; matrices fan out across
            configurations. Caching dependencies and pinning action versions are the two things that most affect
            speed and safety respectively.
          </p>
        }
        interview={
          <p>
            Beyond syntax, talk about supply chain and permissions: pinning actions to SHAs, least-privilege{" "}
            <code>GITHUB_TOKEN</code> scopes, environment protection for deploys, and why{" "}
            <code>pull_request_target</code> is dangerous with fork code. Also worth mentioning that required status
            checks are what actually turn CI into a merge gate.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="forgetting the checkout step"
        wrong={`steps:
  - run: npm ci
# Error: package.json not found`}
        right={`steps:
  - uses: actions/checkout@v5
  - run: npm ci`}
        explanation={
          <p>
            The runner is a clean virtual machine with no knowledge of your repository. <code>actions/checkout</code>{" "}
            is what puts the code there. Nearly every first workflow fails on this exact line.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="Where must a workflow file live for GitHub to run it?"
        options={[
          { id: "a", text: "Anywhere, as long as it ends in .yml" },
          { id: "b", text: ".github/workflows/" },
          { id: "c", text: ".actions/" },
          { id: "d", text: "The repository root" },
        ]}
        correctId="b"
        explanation="GitHub only looks in .github/workflows/ on the branch the event relates to. A workflow in any other directory is just a YAML file that nothing reads."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Add CI to one of your repositories"
        hint={
          <p>
            Start with checkout, your language's setup action, install, and test. Push it and watch the Actions tab.
          </p>
        }
      >
        Write a workflow that runs your project's tests on every pull request. Then break a test deliberately, open
        a PR, and watch the check fail on it. Finally, add that check as a required status check in branch
        protection so a red build actually blocks the merge.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="How would you set up CI for a project on GitHub?"
        answer={
          <p>
            A workflow in <code>.github/workflows/</code> triggered on pull requests and pushes to{" "}
            <code>main</code>. The job checks out the code with <code>actions/checkout</code>, sets up the runtime
            with dependency caching, installs from the lockfile (<code>npm ci</code>, not{" "}
            <code>npm install</code>, so the build is reproducible), then runs lint, type checks, and tests. If the
            project supports several platforms or runtime versions, a matrix fans that out in parallel with{" "}
            <code>fail-fast: false</code>. Critically, I'd make those checks <em>required</em> in branch protection —
            CI that reports failures nobody has to act on is decoration. For deploys I'd add a separate job gated on
            the branch, using an environment with required approval, secrets injected as environment variables, an
            explicit least-privilege <code>permissions</code> block, and third-party actions pinned to a commit SHA.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "Workflows are YAML in .github/workflows/, triggered by repository events.",
          "Jobs run on fresh machines in parallel; steps are shell commands or reusable actions.",
          "actions/checkout is required — the runner starts with no code.",
          "Cache dependencies for speed; pin third-party actions and scope permissions for safety.",
          "CI only becomes a gate when the checks are marked required in branch protection.",
        ]}
      />
    </>
  )
}
