import { AnalogyCard } from "@/components/lesson/analogy-card"
import { Callout } from "@/components/lesson/callout"
import { Challenge } from "@/components/lesson/challenge"
import { CodeBlock } from "@/components/lesson/code-block"
import { CommonMistake } from "@/components/lesson/common-mistake"
import { DifficultyLevels } from "@/components/lesson/difficulty-levels"
import { InterviewQuestion } from "@/components/lesson/interview-question"
import { KeyTakeaways } from "@/components/lesson/key-takeaways"
import { Quiz } from "@/components/lesson/quiz"

const restoreCommands = `# Unstage a file — keeps your edits, just takes it out of the envelope
git restore --staged src/app.js

# Discard working-directory changes — THIS DELETES YOUR EDITS
git restore src/app.js

# Both at once: unstage AND discard
git restore --staged --worktree src/app.js

# Restore a file as it was in a specific commit
git restore --source=HEAD~2 src/app.js

# Everything, everywhere (careful)
git restore .`

const cleanCommands = `git clean -n            # dry run: list what WOULD be deleted
git clean -f            # delete untracked files
git clean -fd           # ...including untracked directories
git clean -fdx          # ...including ignored files (node_modules, .env — think first)`

const oldSyntax = `# Older equivalents you'll see in tutorials and Stack Overflow
git checkout -- src/app.js     ->  git restore src/app.js
git reset HEAD src/app.js      ->  git restore --staged src/app.js`

export default function UndoingUncommittedChangesLesson() {
  return (
    <>
      <p>
        This lesson covers the only truly dangerous corner of Git. Committed work is almost impossible to lose;
        uncommitted work has no history behind it, so a command that discards it discards it for good. Knowing which
        commands do that is the entire point.
      </p>

      <Callout variant="warning" title="The one rule">
        Nothing on this page can be undone by <code>git reflog</code> or anything else. Uncommitted changes were
        never recorded, so there is nothing to recover from. If you're not certain, <code>git stash</code> instead of
        discarding — it costs nothing and it's reversible.
      </Callout>

      <h2>Unstage versus discard</h2>
      <p>These are entirely different actions, and mixing them up is how people lose an afternoon:</p>
      <ul>
        <li>
          <strong>Unstaging</strong> takes a file out of the staging area. Your edits stay on disk. Harmless.
        </li>
        <li>
          <strong>Discarding</strong> overwrites the file on disk with the committed version. Your edits are gone.
        </li>
      </ul>
      <CodeBlock language="bash" filename="git restore" code={restoreCommands} />

      <AnalogyCard title="Taking a page out of the envelope, versus shredding it.">
        Unstaging removes the page from the envelope and puts it back on your desk — you can still read it, edit it,
        put it back in. Discarding feeds it to the shredder and prints a fresh copy of the last filed version. Same
        area of the desk, very different outcome.
      </AnalogyCard>

      <h2>Untracked files: git clean</h2>
      <p>
        <code>git restore</code> only touches files Git tracks. Brand-new files it has never seen are removed with{" "}
        <code>git clean</code> — which is unforgiving, so always dry-run it first.
      </p>
      <CodeBlock language="bash" filename="git clean" code={cleanCommands} />
      <p>
        <code>-n</code> is not optional in practice. <code>git clean -fdx</code> in the wrong directory removes your
        local <code>.env</code>, your <code>node_modules</code>, and anything else ignored — all of it unrecoverable
        by Git, because Git never had it.
      </p>

      <h2>The old syntax you'll still see</h2>
      <CodeBlock language="bash" filename="translation table" code={oldSyntax} />
      <p>
        <code>git checkout -- file</code> is the historical way to discard changes, and it's still all over the
        internet. It works identically — it's just spelled in a way that doesn't warn you what it does.
      </p>

      <h2>A safer default</h2>
      <p>
        When you want a clean working directory but aren't <em>certain</em> the changes are worthless:
      </p>
      <CodeBlock
        language="bash"
        filename="the reversible version"
        code={`git stash push -u -m "probably junk, 12 Aug"
# working directory is clean, and the work still exists
# ...if it really was junk:
git stash drop`}
      />

      <DifficultyLevels
        simple={
          <p>
            <code>git restore --staged file</code> takes a file out of the next commit but keeps your edits.{" "}
            <code>git restore file</code> throws the edits away. The second one can't be undone.
          </p>
        }
        developer={
          <p>
            <code>restore --staged</code> copies the file from HEAD into the index; <code>restore</code> (worktree)
            copies from the index into the working tree; <code>--source=&lt;commit&gt;</code> changes where the
            content comes from. <code>git clean</code> deletes untracked paths outright. Only working-tree and index
            state are at risk — nothing in the object database is touched.
          </p>
        }
        interview={
          <p>
            The framing that shows understanding: these commands move content <em>between the three trees</em>, and
            the destructive ones overwrite the working tree, which is the only tree with no backing store. That's
            why "commit early, commit often" is a safety practice — a commit puts the work in the object database,
            after which the reflog can always find it.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="git restore . to 'clean up' before a demo"
        wrong={`git restore .
# every uncommitted edit in the
# repository, gone`}
        right={`git stash push -u -m "pre-demo cleanup"
# same clean directory,
# fully reversible`}
        explanation={
          <p>
            <code>git restore .</code> is instant and total. Stashing achieves the identical visible result and
            keeps the work retrievable, so there's very little reason to reach for the destructive version — and the
            one time it matters, it matters a lot.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="You staged app.js, then realised it shouldn't be in this commit. Which command removes it from the commit while keeping your edits?"
        options={[
          { id: "a", text: "git restore app.js" },
          { id: "b", text: "git restore --staged app.js" },
          { id: "c", text: "git clean -f app.js" },
          { id: "d", text: "git reset --hard" },
        ]}
        correctId="b"
        explanation="--staged operates on the index only, so the file leaves the staging area with your edits intact on disk. Without --staged, restore overwrites the file itself and your edits are lost."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Prove to yourself which is which"
        hint={
          <p>
            Use a throwaway repository with a file containing something you can recognise, and check the file's
            contents after each command.
          </p>
        }
      >
        Edit a tracked file and stage it. Run <code>git restore --staged</code> and confirm the edit survives. Redo
        the edit, run <code>git restore</code>, and confirm it doesn't. Then try <code>git clean -n</code> with an
        untracked file present and read exactly what it says it would delete.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="How do you undo changes that haven't been committed yet?"
        answer={
          <p>
            It depends which tree the change is in. To unstage but keep the edit,{" "}
            <code>git restore --staged &lt;file&gt;</code> — that copies the file from HEAD into the index and
            touches nothing on disk. To discard the edit itself, <code>git restore &lt;file&gt;</code>, which
            overwrites the working copy from the index. For untracked files, <code>git clean</code>, always with{" "}
            <code>-n</code> first to see what it would remove. The critical distinction is that discarding
            uncommitted work is genuinely irreversible — it was never written to the object database, so the reflog
            can't help. When I'm not certain, I stash with <code>-u</code> instead: identical clean working
            directory, fully recoverable.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "Unstaging (--staged) keeps your edits; discarding (plain restore) destroys them.",
          "git clean removes untracked files — always run git clean -n first.",
          "Uncommitted work has no history, so nothing here is recoverable via reflog.",
          "git checkout -- <file> is the old spelling of git restore <file>; same danger, worse name.",
          "When unsure, git stash -u instead of discarding: same result, reversible.",
        ]}
      />
    </>
  )
}
