import { AnalogyCard } from "@/components/lesson/analogy-card"
import { Callout } from "@/components/lesson/callout"
import { Challenge } from "@/components/lesson/challenge"
import { CodeBlock } from "@/components/lesson/code-block"
import { CommonMistake } from "@/components/lesson/common-mistake"
import { DifficultyLevels } from "@/components/lesson/difficulty-levels"
import { InterviewQuestion } from "@/components/lesson/interview-question"
import { KeyTakeaways } from "@/components/lesson/key-takeaways"
import { Quiz } from "@/components/lesson/quiz"
import { ThreeTreesDiagram } from "@/components/diagram/three-trees-diagram"

const statusOutput = `git status

On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   index.html

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
        modified:   styles.css

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        notes.txt`

const partialStage = `# Stage only the finished part of your work
git add src/login.js

# Leave the experiment unstaged
# (styles.css stays in the working directory)

git commit -m "Add login form validation"`

export default function TheThreeTreesLesson() {
  return (
    <>
      <p>
        If one idea in this course is worth memorising, it's this one. Git moves your changes through three places,
        and every command you'll learn moves them between exactly two of them. Once you can name which place a
        change is sitting in, Git's error messages stop being cryptic.
      </p>

      <h2>The three places</h2>
      <ul>
        <li>
          <strong>Working directory</strong> — the actual files on disk, the ones your editor opens.
        </li>
        <li>
          <strong>Staging area</strong> (also called the <strong>index</strong>) — a draft of your next commit. It
          holds what will be recorded when you next run <code>git commit</code>.
        </li>
        <li>
          <strong>Repository</strong> — the committed history inside <code>.git</code>. Permanent, and the only one
          of the three that's safe.
        </li>
      </ul>
      <p>
        A fourth place matters once you're collaborating: the <strong>remote</strong> (GitHub). Play with all four
        below — notice that each command moves work exactly one step to the right.
      </p>
      <ThreeTreesDiagram />

      <AnalogyCard title="Writing a letter, packing an envelope, posting it.">
        The working directory is your desk, covered in drafts. The staging area is the envelope: you choose which
        pages go in, and you can take one out again. Committing is sealing the envelope — from then on, that exact
        set of pages is a permanent record. Pushing is walking it to the postbox.
      </AnalogyCard>

      <h2>Why have a staging area at all?</h2>
      <p>
        Beginners often see staging as pointless ceremony — why not just commit everything? Because you routinely
        end up with two unrelated changes in your working directory at once: the bug fix you meant to make, and the
        typo you fixed on the way. The staging area lets you commit them separately, so history stays readable.
      </p>
      <CodeBlock language="bash" filename="staging a subset" code={partialStage} />
      <p>
        You can go further and stage <em>part</em> of a file with <code>git add -p</code>, which walks you through
        each chunk and asks whether it belongs in this commit. That's the feature that turns the staging area from
        ceremony into a genuinely useful tool.
      </p>

      <h2>Reading git status through this lens</h2>
      <p>
        Now <code>git status</code> reads as a map of the three trees. Each heading is one of them:
      </p>
      <CodeBlock language="bash" filename="git status" code={statusOutput} />
      <ul>
        <li>
          <strong>Changes to be committed</strong> — in the staging area. These go into your next commit.
        </li>
        <li>
          <strong>Changes not staged for commit</strong> — in the working directory only. Git knows the file, but
          this version isn't in the envelope.
        </li>
        <li>
          <strong>Untracked files</strong> — Git has never seen this file and won't include it until you{" "}
          <code>git add</code> it once.
        </li>
      </ul>

      <Callout variant="warning" title="Only the third tree is safe">
        Work in the working directory or staging area can be destroyed by a careless command, and Git can't get it
        back because it was never recorded. Committed work is extremely hard to lose permanently. "Commit early,
        commit often" isn't a style preference — it's the difference between recoverable and gone.
      </Callout>

      <DifficultyLevels
        simple={
          <p>
            Your changes live in three places: the files you're editing, a list of changes you've marked as ready,
            and the saved history. <code>git add</code> moves the first to the second; <code>git commit</code> moves
            the second to the third.
          </p>
        }
        developer={
          <p>
            The index is a real file (<code>.git/index</code>) holding a staged tree: paths, modes, and blob
            hashes.
            <code>git add</code> writes blobs into the object database and updates the index;{" "}
            <code>git commit</code> turns the index into a tree object and a commit pointing at it, then moves the
            current branch forward. HEAD, index, and working tree are the three states that <code>git reset</code>'s
            three modes correspond to.
          </p>
        }
        interview={
          <p>
            The precise framing: HEAD is the commit the current branch points at, the index is the proposed next
            commit, and the working tree is what's on disk. <code>git reset --soft</code> moves HEAD only;{" "}
            <code>--mixed</code> (the default) moves HEAD and resets the index; <code>--hard</code> moves all three
            and discards working-tree changes. Being able to explain reset in terms of the three trees is a strong
            signal that you understand Git rather than memorised commands.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="editing a file after staging it, then wondering why the change is missing"
        wrong={`git add app.js
# ...edit app.js again...
git commit -m "Fix bug"
# the later edit is NOT in the commit`}
        right={`git add app.js
# ...edit app.js again...
git add app.js      # re-stage
git commit -m "Fix bug"`}
        explanation={
          <p>
            Staging captures the file <em>as it was at that moment</em>, not a live link to it. Edit it afterwards
            and you now have two versions: the staged one and the newer working-directory one — which is exactly why{" "}
            <code>git status</code> can list the same file under both "to be committed" and "not staged".
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="git status lists index.html under both 'Changes to be committed' and 'Changes not staged for commit'. What happened?"
        options={[
          { id: "a", text: "Git is confused — run git status again" },
          { id: "b", text: "The file was staged, then edited again afterwards" },
          { id: "c", text: "The file is untracked" },
          { id: "d", text: "The file has a merge conflict" },
        ]}
        correctId="b"
        explanation="Staging snapshots the file at that instant. Editing it afterwards creates a newer working-directory version, so the file legitimately appears in both lists — the staged version and the newer unstaged one."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Make one file appear in both lists"
        hint={
          <p>
            Stage the file with <code>git add</code>, edit it once more without staging, then run{" "}
            <code>git status</code>.
          </p>
        }
      >
        In a scratch repository, deliberately produce the state from the quiz: one file listed as both staged and
        unstaged. Then commit, and predict which version ends up in the commit before you check with{" "}
        <code>git show</code>.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="What is the staging area for, and could Git work without it?"
        answer={
          <p>
            The staging area (the index) is a proposed next commit that you assemble deliberately. It lets you split
            a messy working directory into several focused commits — including staging individual hunks with{" "}
            <code>git add -p</code> — and it's what makes it possible to review exactly what you're about to record.
            Git <em>could</em> work without it (<code>git commit -a</code> effectively skips it for tracked files,
            and some VCSs have no equivalent), but you'd lose the ability to commit a subset of your work cleanly.
            It's also the mechanism behind conflict resolution: during a merge, marking a file resolved literally
            means staging it.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "Three trees: working directory (on disk), staging area/index (next commit), repository (history).",
          "git add moves work from the first to the second; git commit from the second to the third.",
          "git status is a map of the three trees — each heading names one of them.",
          "Staging captures a file at that instant; edit it again and you have two versions in play.",
          "Only committed work is safe. Uncommitted work has no history to recover from.",
        ]}
      />
    </>
  )
}
