import { AnalogyCard } from "@/components/lesson/analogy-card"
import { Callout } from "@/components/lesson/callout"
import { Challenge } from "@/components/lesson/challenge"
import { CodeBlock } from "@/components/lesson/code-block"
import { CommonMistake } from "@/components/lesson/common-mistake"
import { DifficultyLevels } from "@/components/lesson/difficulty-levels"
import { InterviewQuestion } from "@/components/lesson/interview-question"
import { KeyTakeaways } from "@/components/lesson/key-takeaways"
import { Quiz } from "@/components/lesson/quiz"

const ignoreFile = `# Dependencies
node_modules/
vendor/

# Build output
dist/
build/
*.log

# Environment and secrets
.env
.env.local
*.pem

# Editor and OS noise
.vscode/
.idea/
.DS_Store
Thumbs.db

# ...but keep this one file, despite the rule above
!.vscode/extensions.json`

const patterns = `logs/           # a directory anywhere in the tree
/logs/          # only a directory named logs at the repo root
*.log           # any file ending in .log
debug?.log      # debug1.log, debugA.log — ? is exactly one character
temp/**/cache   # ** spans any number of directories
!important.log  # negate: track this one despite an earlier rule`

const alreadyTracked = `# Ignoring a file does nothing if it's already tracked.
# Stop tracking it, but keep it on disk:
git rm --cached .env
echo ".env" >> .gitignore
git commit -m "Stop tracking .env"

# Same for a whole directory:
git rm -r --cached node_modules
git commit -m "Stop tracking node_modules"`

const debugIgnore = `# Why is this file being ignored?
git check-ignore -v config/local.json

.gitignore:12:*.json    config/local.json`

export default function GitignoreLesson() {
  return (
    <>
      <p>
        Not everything in your project folder belongs in history. Dependencies can be reinstalled, build output can
        be rebuilt, and secrets should never have been there in the first place. <code>.gitignore</code> is how you
        tell Git what to leave alone.
      </p>

      <h2>What it looks like</h2>
      <p>
        A <code>.gitignore</code> is a plain text file, one pattern per line, committed alongside your code so the
        whole team shares the same rules.
      </p>
      <CodeBlock language="bash" filename=".gitignore" code={ignoreFile} />

      <h2>The pattern rules</h2>
      <CodeBlock language="bash" filename="patterns" code={patterns} />
      <ul>
        <li>
          A trailing <code>/</code> means "directory only".
        </li>
        <li>
          A leading <code>/</code> anchors the pattern to the repository root; without it, the pattern matches at
          any depth.
        </li>
        <li>
          <code>!</code> negates an earlier rule — but it can't rescue a file whose <em>parent directory</em> is
          ignored.
        </li>
        <li>Lines starting with # are comments; blank lines are ignored.</li>
      </ul>

      <AnalogyCard title="A recipe, not the leftovers.">
        You share the recipe, not the meal you cooked from it. <code>package.json</code> is the recipe;{" "}
        <code>node_modules</code> is the meal — huge, machine-specific, and reproducible in seconds by anyone with
        the recipe. Committing it wastes everyone's time and disk.
      </AnalogyCard>

      <h2>The rule that catches everyone</h2>
      <p>
        <strong>.gitignore only affects untracked files.</strong> If a file is already tracked, adding it to{" "}
        <code>.gitignore</code> changes nothing at all — Git keeps tracking it, and keeps committing your changes to
        it. You have to explicitly stop tracking it first.
      </p>
      <CodeBlock language="bash" filename="untracking a file" code={alreadyTracked} />
      <p>
        <code>--cached</code> is the important flag: it removes the file from Git's tracking but leaves it on disk.
        Without it, <code>git rm</code> deletes the file for real.
      </p>

      <Callout variant="warning" title="A committed secret is a leaked secret">
        Removing a <code>.env</code> file in a new commit does not remove it from history — anyone can check out the
        earlier commit and read it. The only correct response is to <strong>rotate the credential</strong>{" "}
        immediately. Scrubbing history (with <code>git filter-repo</code> or the BFG) is a second step, and it
        rewrites every commit, so it needs coordinating with everyone who has a clone.
      </Callout>

      <h2>When it isn't behaving</h2>
      <CodeBlock language="bash" filename="debugging" code={debugIgnore} />
      <p>
        <code>git check-ignore -v</code> prints the exact file, line number, and pattern responsible for ignoring a
        path. It turns "why won't Git see my file?" from guesswork into a one-line answer.
      </p>

      <h2>Where ignore rules can live</h2>
      <ul>
        <li>
          <strong><code>.gitignore</code></strong> in the repository — committed, shared by the team. This is the
          default choice.
        </li>
        <li>
          <strong><code>.git/info/exclude</code></strong> — same syntax, but local to your clone and never
          committed. The right place for your own quirks.
        </li>
        <li>
          <strong>A global ignore file</strong> (<code>core.excludesFile</code>) — for things that follow you between
          projects, like <code>.DS_Store</code> or your editor's folder.
        </li>
      </ul>

      <DifficultyLevels
        simple={
          <p>
            <code>.gitignore</code> is a list of files Git should pretend it can't see — build output, downloaded
            dependencies, and anything secret.
          </p>
        }
        developer={
          <p>
            Ignore rules apply only to untracked paths. Precedence runs from the most deeply nested{" "}
            <code>.gitignore</code> outwards, then <code>.git/info/exclude</code>, then the global excludes file,
            with later matching rules winning within a file. A negation can't re-include a file inside an ignored
            directory, because Git never descends into it.
          </p>
        }
        interview={
          <p>
            The two answers worth having ready: adding a tracked file to <code>.gitignore</code> does nothing until
            you <code>git rm --cached</code> it; and deleting a committed secret in a later commit does not remove it
            from history, so the credential must be rotated. Mentioning <code>git check-ignore -v</code> for
            debugging and <code>.git/info/exclude</code> for personal rules shows day-to-day fluency.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="adding a tracked file to .gitignore and expecting it to stop"
        wrong={`echo ".env" >> .gitignore
git commit -m "Ignore .env"
# .env is still tracked, still
# committing changes`}
        right={`git rm --cached .env
echo ".env" >> .gitignore
git commit -m "Stop tracking .env"
# ...then rotate the credential`}
        explanation={
          <p>
            Ignore rules are only consulted for files Git isn't already tracking. Once a file is in the index, it
            stays there until you remove it. And if the file held a secret, the untracking step doesn't undo the
            leak — the old commits still contain it.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="You add config.json to .gitignore, but Git keeps showing your edits to it. Why?"
        options={[
          { id: "a", text: ".gitignore needs to be committed before it takes effect" },
          { id: "b", text: "The file is already tracked — ignore rules only apply to untracked files" },
          { id: "c", text: "JSON files can't be ignored" },
          { id: "d", text: "You need to restart your editor" },
        ]}
        correctId="b"
        explanation="Once a file is tracked, .gitignore is irrelevant to it. Run git rm --cached config.json to stop tracking it while keeping it on disk, then commit that removal."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Write the ignore file for your stack"
        hint={
          <p>
            github.com/github/gitignore has a maintained template for nearly every language — start there, then add
            your own project's build folder.
          </p>
        }
      >
        For a project you actually work on, list what should never be committed: dependency folders, build output,
        local environment files, editor settings, OS noise. Write the <code>.gitignore</code>, then verify one entry
        with <code>git check-ignore -v</code>.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="Someone committed an API key. What do you do?"
        answer={
          <p>
            First, <strong>rotate the key</strong> — assume it's compromised the moment it reaches a shared
            repository, because it's in every clone and possibly in CI logs and scraper databases already. Second,
            stop tracking the file: <code>git rm --cached .env</code>, add it to <code>.gitignore</code>, commit.
            Third, if the repository's history must be cleaned, rewrite it with <code>git filter-repo</code> (or
            BFG), force-push, and have every collaborator re-clone — but treat that as damage limitation, not a fix,
            since the old objects may survive in forks, caches, and CI. Longer term, prevent recurrence with secret
            scanning, push protection, and pre-commit hooks.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "Commit the recipe, not the leftovers: ignore dependencies, build output, secrets, and editor noise.",
          "Ignore rules apply only to untracked files — use git rm --cached to stop tracking something.",
          "A trailing / means directory, a leading / anchors to the root, and ! negates an earlier rule.",
          "git check-ignore -v tells you exactly which rule is ignoring a path.",
          "A committed secret is leaked: rotate it first, then clean up.",
        ]}
      />
    </>
  )
}
