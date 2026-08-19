import { AnalogyCard } from "@/components/lesson/analogy-card"
import { Callout } from "@/components/lesson/callout"
import { Challenge } from "@/components/lesson/challenge"
import { CodeBlock } from "@/components/lesson/code-block"
import { CommonMistake } from "@/components/lesson/common-mistake"
import { DifficultyLevels } from "@/components/lesson/difficulty-levels"
import { InterviewQuestion } from "@/components/lesson/interview-question"
import { KeyTakeaways } from "@/components/lesson/key-takeaways"
import { Quiz } from "@/components/lesson/quiz"

const readme = `# Project Name

One sentence saying what this is and who it's for.

## Quick start

\`\`\`bash
git clone https://github.com/me/project.git
cd project
npm install
npm run dev
\`\`\`

Open http://localhost:5173.

## Requirements

- Node 20+
- A Postgres database (see \`.env.example\`)

## Configuration

| Variable       | Required | Description                  |
| -------------- | -------- | ---------------------------- |
| \`DATABASE_URL\` | yes      | Postgres connection string   |
| \`PORT\`         | no       | Defaults to 3000             |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

MIT — see [LICENSE](LICENSE).`

const layout = `.
├── README.md              # what it is, how to run it
├── LICENSE                # the legal terms of reuse
├── CONTRIBUTING.md        # how to propose a change
├── CODE_OF_CONDUCT.md     # behaviour expectations (community projects)
├── SECURITY.md            # how to report a vulnerability privately
├── CHANGELOG.md           # what changed in each release
├── .gitignore
├── .gitattributes         # line endings, diff behaviour, LFS
├── .env.example           # every variable, no real values
└── .github/
    ├── workflows/ci.yml           # Actions
    ├── PULL_REQUEST_TEMPLATE.md
    ├── ISSUE_TEMPLATE/bug.yml
    └── CODEOWNERS                 # who reviews what`

const codeowners = `# .github/CODEOWNERS
# Last matching pattern wins.

*                   @me
/src/payments/      @finance-team
/infra/             @platform-team
*.sql               @data-team`

export default function ReadmeAndRepoFilesLesson() {
  return (
    <>
      <p>
        A repository is read far more often than it's written, usually by someone who has thirty seconds to decide
        whether it's worth their time. These files are what they read.
      </p>

      <h2>The README</h2>
      <p>
        Answer, in this order: what is this, how do I run it, what does it need, and where do I go next. Someone
        landing cold should be able to get it running without asking anyone.
      </p>
      <CodeBlock language="markdown" filename="README.md" code={readme} />

      <Callout variant="tip" title="Test it on a stranger">
        The only real check is watching someone clone the repository and follow the quick start on a clean machine.
        Every step they get stuck on is a bug in the README — usually an unstated prerequisite that's been installed
        on your machine for two years.
      </Callout>

      <AnalogyCard title="The README is the shop window.">
        Nobody walks past a blank window and comes in to ask what's sold inside. A clear README does the same job a
        display does: it tells a passer-by in five seconds whether this is what they were looking for, and gives
        them the one obvious next step.
      </AnalogyCard>

      <h2>The rest of the furniture</h2>
      <CodeBlock language="bash" filename="a well-equipped repository" code={layout} />
      <ul>
        <li>
          <strong>LICENSE</strong> — without one, default copyright applies and nobody may legally reuse your code.
          MIT and Apache-2.0 are the common permissive choices; GPL requires derivative works to stay open.
        </li>
        <li>
          <strong>CONTRIBUTING.md</strong> — how to set up, how to test, what a good pull request looks like. Saves
          the same conversation repeatedly.
        </li>
        <li>
          <strong>SECURITY.md</strong> — a private route for vulnerability reports, so they don't arrive as a public
          issue.
        </li>
        <li>
          <strong>.env.example</strong> — every variable the app needs, with placeholder values. The single most
          useful file for a new contributor.
        </li>
        <li>
          <strong>.gitattributes</strong> — <code>* text=auto</code> settles line endings for the whole team, and{" "}
          <code>*.psd binary</code> stops Git trying to diff binaries.
        </li>
      </ul>

      <h2>Templates and CODEOWNERS</h2>
      <p>
        Issue and pull request templates pre-fill the questions you'd otherwise have to ask ("what did you expect to
        happen?", "how do I reproduce it?"). <code>CODEOWNERS</code> automatically requests review from the right
        people when specific paths change:
      </p>
      <CodeBlock language="bash" filename=".github/CODEOWNERS" code={codeowners} />
      <p>
        Combined with branch protection (lesson 38), code owner review can be made mandatory for sensitive
        directories.
      </p>

      <DifficultyLevels
        simple={
          <p>
            A README explains what the project is and how to run it. A LICENSE says whether others may use it. The
            rest tell contributors how to help.
          </p>
        }
        developer={
          <p>
            GitHub gives community health files special treatment: they're surfaced in the UI, and an
            organisation-level <code>.github</code> repository provides defaults for every repo that lacks its own.{" "}
            <code>CODEOWNERS</code> drives automatic review requests and, with branch protection, required approvals
            per path.
          </p>
        }
        interview={
          <p>
            The point worth making is operational: these files reduce repeated human effort. A README that works
            eliminates onboarding questions, <code>.env.example</code> eliminates "what config do I need",
            templates eliminate the back-and-forth on bug reports, and CODEOWNERS eliminates "who should review
            this". Licensing is the one with legal consequences — no licence means no permission.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="a README that documents everything except how to run it"
        wrong={`# Project

## Architecture
## Design decisions
## Roadmap
## Philosophy`}
        right={`# Project

One line: what this is.

## Quick start
npm install && npm run dev

## Architecture
...`}
        explanation={
          <p>
            Architecture notes matter, but they're not what someone needs in the first thirty seconds. Lead with
            what it is and how to run it; put the deeper material below, or in <code>docs/</code>.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="You publish a public repository with no LICENSE file. What can others legally do with your code?"
        options={[
          { id: "a", text: "Anything — public means public domain" },
          { id: "b", text: "Use and modify it, but not sell it" },
          { id: "c", text: "Essentially nothing: default copyright reserves all rights to you" },
          { id: "d", text: "GitHub applies MIT automatically" },
        ]}
        correctId="c"
        explanation="Publishing code doesn't grant anyone rights to it. Without an explicit licence, default copyright applies and others have no permission to use, copy, or modify it — which is why 'no licence' quietly blocks adoption."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Clean-machine test your README"
        hint={
          <p>
            Clone into a fresh folder and follow your own instructions literally, without using knowledge that isn't
            written down.
          </p>
        }
      >
        Take one of your repositories, clone it into a new directory, and follow the README exactly. Every place you
        had to rely on knowledge that isn't in the file is a missing line. Fix them, and add a{" "}
        <code>.env.example</code> if the project needs configuration.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="What should a good repository contain besides the code?"
        answer={
          <p>
            A README that says what the project is and gets someone running it in a few commands — that's the one
            file everybody reads. A LICENSE, because without one default copyright applies and nobody can legally
            use the code. <code>CONTRIBUTING.md</code> for setup, testing, and PR expectations;{" "}
            <code>SECURITY.md</code> so vulnerabilities are reported privately rather than as public issues; and{" "}
            <code>.env.example</code> listing every configuration variable with placeholder values. In{" "}
            <code>.github/</code>, I'd expect issue and PR templates, a CI workflow, and <code>CODEOWNERS</code> to
            route reviews automatically. The common thread is that each file removes a conversation that would
            otherwise be repeated with every new contributor.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "README first: what it is, how to run it, what it needs — then the deeper material.",
          "No LICENSE means default copyright: legally, nobody may reuse your code.",
          ".env.example is the highest-value file for a new contributor after the README.",
          "Issue/PR templates and CODEOWNERS automate questions and review routing.",
          "The test of a README is a stranger on a clean machine, not the author's memory.",
        ]}
      />
    </>
  )
}
