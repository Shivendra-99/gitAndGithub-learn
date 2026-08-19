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

const flow: TerminalStep[] = [
  {
    command: 'git commit -m "Add serach endpoint"',
    output: ["[main 8c1d4e2] Add serach endpoint", " 1 file changed, 24 insertions(+)"],
    note: "Committed with a typo in the message, and you forgot to include the test file.",
  },
  {
    command: "git add src/search.test.js",
    note: "Stage what should have been in the commit. Amending uses whatever is staged right now.",
  },
  {
    command: 'git commit --amend -m "Add search endpoint"',
    output: ["[main a91f4c2] Add search endpoint", " 2 files changed, 61 insertions(+)"],
    note: "Notice the hash changed from 8c1d4e2 to a91f4c2. This is not the old commit edited — it's a new commit that replaced it.",
  },
  {
    command: "git log --oneline -2",
    output: ["a91f4c2 Add search endpoint", "3f8b0aa Fix typo in README"],
    note: "One commit, correct message, both files. The original 8c1d4e2 is now unreferenced — still findable in the reflog, but no longer part of the branch.",
  },
]

const forms = `# Fix the message only
git commit --amend -m "Add search endpoint"

# Add forgotten files, keep the existing message
git add forgotten-file.js
git commit --amend --no-edit

# Fix the author (e.g. wrong email configured)
git commit --amend --author="Ada Lovelace <ada@example.com>"

# Open the editor to rewrite the message properly
git commit --amend`

const fixup = `# Prepare a fix for an OLDER commit
git add .
git commit --fixup 3f8b0aa

# Then fold every fixup into its target automatically
git rebase -i --autosquash 3f8b0aa~1`

export default function AmendingCommitsLesson() {
  return (
    <>
      <p>
        You commit, and half a second later you see the typo in the message, or realise you forgot a file.{" "}
        <code>git commit --amend</code> replaces the last commit with a corrected one.
      </p>

      <h2>Amend in action</h2>
      <TerminalDemo steps={flow} title="Fix a message and add a missing file" prompt="~/shop" />

      <h2>What amend really does</h2>
      <p>
        It does <strong>not</strong> edit the existing commit — commits are immutable. Git builds a new commit from
        the current staging area with the parent of the old one, then moves the branch label to it. The original is
        left unreferenced.
      </p>
      <CodeBlock language="bash" filename="the forms" code={forms} />

      <AnalogyCard title="Reprinting the page, not correcting it in ink.">
        The corrected page looks like a fix, but it's a fresh sheet with a new page number. If nobody has copied the
        old sheet, that's invisible and ideal. If a colleague already filed the original, you now have two versions
        of "the same" page in circulation — which is exactly the problem with amending a pushed commit.
      </AnalogyCard>

      <Callout variant="warning" title="Only amend commits you haven't shared">
        Amending rewrites history. If the commit has been pushed and anyone has pulled it, your amended version and
        their original are different commits containing the same work. Pushing yours needs a force push, and theirs
        needs a manual reset. On your own unpushed commits, amend freely.
      </Callout>

      <h2>Amending something already pushed</h2>
      <p>
        Sometimes it's justified — a personal feature branch under review, where you'd rather not add a "fix typo"
        commit. The safe sequence:
      </p>
      <CodeBlock
        language="bash"
        filename="if you must"
        code={`git commit --amend --no-edit
git push --force-with-lease
# --with-lease refuses if the remote moved
# since your last fetch`}
      />
      <p>
        Never do this on <code>main</code>, or on a branch someone else is working on, without telling them first.
      </p>

      <h2>Fixing an older commit: --fixup</h2>
      <p>
        Amend only reaches the most recent commit. For an older one, make a fixup commit and let an interactive
        rebase fold it in:
      </p>
      <CodeBlock language="bash" filename="fixup + autosquash" code={fixup} />
      <p>
        This keeps your work-in-progress honest: each fix is committed immediately and lands in the right place when
        you tidy up before opening a pull request. Lesson 27 covers interactive rebase in full.
      </p>

      <DifficultyLevels
        simple={
          <p>
            <code>git commit --amend</code> replaces your last commit — useful for fixing the message or adding a
            file you forgot. Only do it before pushing.
          </p>
        }
        developer={
          <p>
            Amend creates a new commit object from the current index with the same parent as HEAD, then updates the
            branch ref. The old commit becomes unreachable but stays in the object database until garbage collection,
            and the reflog records where the branch pointed before.
          </p>
        }
        interview={
          <p>
            The key insight to state: amend doesn't modify a commit, because commit objects are immutable and
            hash-addressed. It creates a replacement and moves the branch. That's why the hash changes, why a push
            afterwards must be forced, and why the original is still recoverable from the reflog.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="amending with unrelated changes accidentally staged"
        wrong={`git add .                 # stages everything
git commit --amend --no-edit
# your last commit now also
# contains three unrelated files`}
        right={`git add src/search.test.js
git commit --amend --no-edit
git show --stat           # verify what's in it`}
        explanation={
          <p>
            Amend takes whatever is staged at that moment. <code>git add .</code> before amending quietly absorbs
            every other change in your working directory into a commit that claims to be about one thing. Stage
            deliberately, and check with <code>git show --stat</code> afterwards.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="After git commit --amend, why does git log show a different hash for that commit?"
        options={[
          { id: "a", text: "Git renumbers commits after every change" },
          { id: "b", text: "Amend created a new commit object; the original is no longer referenced" },
          { id: "c", text: "The hash includes the current time, so it always changes" },
          { id: "d", text: "It's a display quirk — the commit is the same underneath" },
        ]}
        correctId="b"
        explanation="Commits are immutable and named by a hash of their content. Changing the message or the tree produces a different object, so amend builds a replacement and moves the branch label to it."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Find the commit you replaced"
        hint={
          <p>
            <code>git reflog</code> lists where HEAD has been. The pre-amend commit is one entry above the amended
            one.
          </p>
        }
      >
        Make a commit, note its hash, then amend it. Find the original hash in <code>git reflog</code> and run{" "}
        <code>git show &lt;old-hash&gt;</code> to prove the original still exists. That's the safety net that makes
        history rewriting less frightening than it sounds.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="What does git commit --amend do, and when shouldn't you use it?"
        answer={
          <p>
            It replaces the most recent commit with a new one built from the current index, reusing the original's
            parent — so you can fix the message, add a forgotten file, or correct the author. It doesn't edit
            anything: commits are immutable and content-addressed, so the result is a new object with a new hash and
            the original becomes unreferenced (though the reflog still knows it). Don't use it on commits that have
            been pushed and pulled by others, because their history now contains a commit yours doesn't, and
            reconciling that needs a force push on your side and a manual reset on theirs. On a personal branch under
            review it's often fine with <code>--force-with-lease</code>; on <code>main</code> it isn't. For older
            commits, <code>--fixup</code> plus <code>rebase --autosquash</code> is the equivalent tool.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "--amend replaces the last commit with a new one built from what's staged now.",
          "The hash changes because commits are immutable — this is a history rewrite.",
          "Amend freely before pushing; after pushing it needs --force-with-lease and coordination.",
          "--no-edit keeps the existing message when you're only adding files.",
          "For older commits, use git commit --fixup <hash> plus rebase -i --autosquash.",
        ]}
      />
    </>
  )
}
