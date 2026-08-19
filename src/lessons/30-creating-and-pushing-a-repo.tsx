import { AnalogyCard } from "@/components/lesson/analogy-card"
import { Callout } from "@/components/lesson/callout"
import { Challenge } from "@/components/lesson/challenge"
import { CodeBlock } from "@/components/lesson/code-block"
import { CommonMistake } from "@/components/lesson/common-mistake"
import { DifficultyLevels } from "@/components/lesson/difficulty-levels"
import { InterviewQuestion } from "@/components/lesson/interview-question"
import { KeyTakeaways } from "@/components/lesson/key-takeaways"
import { Quiz } from "@/components/lesson/quiz"
import { TerminalDemo, type TerminalStep } from "@/components/lesson/terminal-demo"

const pushFlow: TerminalStep[] = [
  {
    command: "git init",
    output: ["Initialized empty Git repository in ~/my-project/.git/"],
    note: "Local repository created. Nothing has left your machine.",
  },
  {
    command: "printf 'node_modules/\\n.env\\ndist/\\n' > .gitignore",
    note: "Write .gitignore BEFORE the first commit. Anything committed once is in history forever, even if you delete it later.",
  },
  {
    command: 'git add . && git commit -m "Initial commit"',
    output: ["[main (root-commit) c04e77d] Initial commit", " 14 files changed, 320 insertions(+)"],
    note: "Check the file count. If it says 8,000, node_modules got in — fix the ignore file and redo this commit now, while it's cheap.",
  },
  {
    command: "git remote add origin git@github.com:me/my-project.git",
    note: "Create the empty repository on GitHub first (no README, no .gitignore, no licence), then point origin at it.",
  },
  {
    command: "git push -u origin main",
    output: [
      "Enumerating objects: 18, done.",
      "To github.com:me/my-project.git",
      " * [new branch]      main -> main",
      "branch 'main' set up to track 'origin/main'.",
    ],
    note: "-u sets the upstream, so from now on plain git push and git pull work with no arguments.",
  },
]

const ghCli = `# The whole thing in one command, from inside the project folder
gh repo create my-project --public --source=. --remote=origin --push`

const unrelatedHistories = `git push -u origin main

 ! [rejected]        main -> main (fetch first)

# Cause: GitHub created the repo with a README, so its main
# has a commit yours has never seen.

# Option A — bring it in (keeps GitHub's initial commit)
git pull --rebase origin main
git push -u origin main

# Option B — only if you're certain the remote is empty of anything you want
git push -u --force origin main`

export default function CreatingAndPushingARepoLesson() {
  return (
    <>
      <p>
        Local project, empty GitHub repository, five commands. The two things that go wrong are committing files you
        didn't mean to and hitting a rejected push on the very first attempt — both avoidable.
      </p>

      <h2>The sequence</h2>
      <TerminalDemo steps={pushFlow} title="Local project to GitHub" prompt="~/my-project" />

      <Callout variant="warning" title="Create the GitHub repo empty">
        Ticking "Add a README" gives the remote a commit your local repository doesn't have, and your first push is
        rejected. Create it with no README, no <code>.gitignore</code>, and no licence — you're bringing your own.
      </Callout>

      <h2>When it's rejected anyway</h2>
      <CodeBlock language="bash" filename="fixing the first push" code={unrelatedHistories} />
      <p>
        If the two histories have no common ancestor at all, Git will say "refusing to merge unrelated histories",
        and <code>git pull --allow-unrelated-histories origin main</code> is the escape hatch. It's safe here
        precisely because the remote contains one auto-generated commit and nothing else.
      </p>

      <AnalogyCard title="Moving into a flat that isn't quite empty.">
        You arrive with your furniture and find the landlord left a chair. You can keep it and arrange around it
        (pull), or take it out first (force push into a repo you're certain is otherwise empty). What you can't do is
        pretend it isn't there — which is exactly what the rejection is telling you.
      </AnalogyCard>

      <h2>The one-command version</h2>
      <CodeBlock language="bash" filename="gh repo create" code={ghCli} />
      <p>
        The GitHub CLI creates the remote repository, wires up <code>origin</code>, and pushes — skipping the
        browser and the empty-repository trap entirely.
      </p>

      <h2>Before you make it public</h2>
      <ul>
        <li>
          <strong>Search history for secrets.</strong> <code>git log -S&quot;api_key&quot; --all</code> and the
          same for <code>password</code>, <code>secret</code>, <code>token</code>.
        </li>
        <li>
          <strong>Check what's tracked.</strong> <code>git ls-files | head -50</code> — anything surprising there is
          in your history.
        </li>
        <li>
          <strong>Add a README and a licence.</strong> Without a licence, nobody can legally reuse your code.
        </li>
        <li>
          <strong>Turn on secret scanning and push protection</strong> in the repository settings.
        </li>
      </ul>

      <DifficultyLevels
        simple={
          <p>
            <code>git init</code>, write a <code>.gitignore</code>, commit, create an empty repo on GitHub, add it as{" "}
            <code>origin</code>, and <code>git push -u origin main</code>.
          </p>
        }
        developer={
          <p>
            The push fails as a non-fast-forward when the remote has commits you don't, which is exactly what
            initialising the GitHub repo with a README causes. Either integrate (<code>pull --rebase</code>, possibly
            with <code>--allow-unrelated-histories</code>) or, when the remote is genuinely disposable, force. Write{" "}
            <code>.gitignore</code> before the first commit, since removing a file later doesn't remove it from
            history.
          </p>
        }
        interview={
          <p>
            Show the failure modes, not just the happy path: the README-collision rejection and its two resolutions;
            unrelated histories; why the ignore file must precede the first commit; and that a secret pushed even
            once must be rotated rather than deleted. That's the difference between having done it and having done
            it on a real project.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="committing everything before writing .gitignore"
        wrong={`git add .
git commit -m "Initial commit"
# 40,000 files, node_modules,
# and a .env with live credentials`}
        right={`printf 'node_modules/\\n.env\\n' > .gitignore
git add .
git status              # read the list first
git commit -m "Initial commit"`}
        explanation={
          <p>
            The first commit is the one people rush, and it's the worst one to get wrong: everything in it is in
            history permanently unless you rewrite the repository. Write the ignore file first and read{" "}
            <code>git status</code> before committing — if it's a wall of files, something is wrong.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="You created a GitHub repo with a README, then tried to push your local project. The push is rejected. Why?"
        options={[
          { id: "a", text: "You need to be an organisation owner" },
          { id: "b", text: "The remote has a commit your local repository doesn't, so the push isn't a fast-forward" },
          { id: "c", text: "The repository is private" },
          { id: "d", text: "You forgot to run git init" },
        ]}
        correctId="b"
        explanation="GitHub's README creation made a commit on the remote's main. Pushing would discard it, so Git refuses. Pull it in (possibly with --allow-unrelated-histories) or create the repository empty next time."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Publish something small, properly"
        hint={
          <p>
            <code>git ls-files</code> lists exactly what's tracked. Run it before pushing and read the whole list.
          </p>
        }
      >
        Take a small local project and publish it: ignore file first, a real README, a licence, then push. Before
        pushing, run <code>git ls-files</code> and confirm every single tracked file is one you meant to publish.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="How do you get an existing local project onto GitHub?"
        answer={
          <p>
            <code>git init</code> if it isn't already a repository, write <code>.gitignore</code> before the first
            commit so build output and secrets never enter history, then <code>git add</code>/
            <code>git commit</code>. Create an <em>empty</em> repository on GitHub — no README, since that would
            give the remote a commit I don't have and my first push would be rejected as a non-fast-forward. Add it
            with <code>git remote add origin &lt;url&gt;</code> and push with <code>git push -u origin main</code>,
            where <code>-u</code> sets the upstream so later pushes need no arguments. If the remote does already
            have a commit, I'd <code>git pull --rebase origin main</code> (adding{" "}
            <code>--allow-unrelated-histories</code> if the histories share no ancestor) and push again.{" "}
            <code>gh repo create --source=. --push</code> does the whole thing in one step.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "Write .gitignore before the first commit — history is permanent.",
          "Create the GitHub repository empty to avoid a rejected first push.",
          "git remote add origin <url> then git push -u origin main.",
          "A rejected first push usually means GitHub's README commit — pull it in or force into a disposable remote.",
          "Before going public: scan history for secrets, check git ls-files, add a licence.",
        ]}
      />
    </>
  )
}
