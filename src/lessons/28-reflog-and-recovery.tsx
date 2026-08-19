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

const recovery: TerminalStep[] = [
  {
    command: "git reset --hard HEAD~3",
    output: ["HEAD is now at 3f8b0aa Fix typo in README"],
    note: "Three commits of work just left the branch. This is the moment people panic.",
  },
  {
    command: "git reflog",
    output: [
      "3f8b0aa HEAD@{0}: reset: moving to HEAD~3",
      "a91f4c2 HEAD@{1}: commit: Add search filters",
      "8c1d4e2 HEAD@{2}: commit: Add search endpoint",
      "5a3b9f1 HEAD@{3}: commit: Scaffold search module",
      "3f8b0aa HEAD@{4}: checkout: moving from main to feature/search",
    ],
    note: "Every position HEAD has held, newest first. a91f4c2 is the tip of the work you just 'lost' — it's right there.",
  },
  {
    command: "git reset --hard a91f4c2",
    output: ["HEAD is now at a91f4c2 Add search filters"],
    note: "All three commits are back. You can also use the shorthand: git reset --hard HEAD@{1}.",
  },
  {
    command: "git log --oneline -3",
    output: ["a91f4c2 Add search filters", "8c1d4e2 Add search endpoint", "5a3b9f1 Scaffold search module"],
    note: "Nothing was ever actually deleted — the branch label had just stopped pointing at it.",
  },
]

const reflogCommands = `git reflog                       # HEAD's history
git reflog show main             # one branch's history
git reflog --date=iso            # with real timestamps

# Reflog entries are usable anywhere a commit is
git show HEAD@{2}
git diff HEAD@{yesterday}
git switch -c rescue HEAD@{5}`

const lostCommits = `# Deleted a branch without merging it?
git reflog                        # find its last commit
git switch -c restored <hash>

# Reflog doesn't have it either? Search the object database:
git fsck --lost-found
# Dangling commit a91f4c2c4d7e2f5a8b9c0d1e2f3a4b5c6d7e8f9`

export default function ReflogAndRecoveryLesson() {
  return (
    <>
      <p>
        The reflog is Git's flight recorder. It logs every time <code>HEAD</code> or a branch moved — every commit,
        checkout, merge, rebase, and reset — for around 90 days. It's local, it's private, and it is the answer to
        almost every "I've destroyed everything" moment.
      </p>

      <h2>Recovering from a hard reset</h2>
      <TerminalDemo steps={recovery} title="Undo a reset --hard" prompt="~/shop" />

      <AnalogyCard title="The building's entry log.">
        Even after someone's name is removed from the staff list, the entry log still shows they came in at 09:12 on
        Tuesday. Deleting a branch or resetting it removes the label, not the record of where it pointed — and the
        commits themselves are still in the building.
      </AnalogyCard>

      <h2>Reading and using it</h2>
      <CodeBlock language="bash" filename="git reflog" code={reflogCommands} />
      <p>
        <code>HEAD@{"{"}n{"}"}</code> means "where HEAD was n moves ago" and works anywhere a commit hash does. So{" "}
        <code>git diff HEAD@{"{"}2{"}"}</code> shows what's changed since two moves back, and{" "}
        <code>git switch -c rescue HEAD@{"{"}5{"}"}</code> creates a branch at that point.
      </p>

      <h2>What the reflog can and can't save</h2>
      <p>
        <strong>Can recover:</strong>
      </p>
      <ul>
        <li>Commits removed by <code>reset --hard</code></li>
        <li>Commits abandoned by a rebase or an amend</li>
        <li>Commits on a branch you deleted</li>
        <li>The state before a merge you regret</li>
      </ul>
      <p>
        <strong>Cannot recover:</strong>
      </p>
      <ul>
        <li>Uncommitted changes discarded by <code>git restore</code> or <code>reset --hard</code></li>
        <li>Untracked files deleted by <code>git clean</code></li>
        <li>Anything in a fresh clone — the reflog is local and never transferred</li>
      </ul>
      <p>The pattern is simple: <strong>if it was ever committed, it's recoverable.</strong> If it wasn't, it isn't.</p>

      <Callout variant="tip" title="Take a snapshot before anything scary">
        Before a big rebase or a history rewrite, run <code>git branch backup-$(date +%F)</code>. It costs nothing
        and gives you a named ref to return to, which beats hunting through the reflog under pressure.
      </Callout>

      <h2>When the reflog isn't enough</h2>
      <CodeBlock language="bash" filename="last resort" code={lostCommits} />
      <p>
        <code>git fsck --lost-found</code> lists unreachable objects still in the database — useful when a commit
        was orphaned in a way that never touched HEAD. It's messier than the reflog, but it has rescued plenty of
        people.
      </p>

      <Callout variant="warning" title="The expiry clock is real">
        Reachable reflog entries expire after 90 days by default, unreachable ones after 30, and{" "}
        <code>git gc --prune=now</code> deletes the orphaned objects immediately. Recovery is measured in weeks, not
        years — and an aggressive <code>gc</code> right after the mistake is one of the few ways to make loss
        permanent.
      </Callout>

      <DifficultyLevels
        simple={
          <p>
            <code>git reflog</code> lists everywhere your branch has been recently. Find the commit from before the
            mistake and <code>git reset --hard</code> to it.
          </p>
        }
        developer={
          <p>
            Reflogs are per-ref logs stored in <code>.git/logs/</code>, recording every ref update with the old and
            new hashes, the command, and a timestamp. They make otherwise-unreachable commits reachable again, which
            also protects them from garbage collection until the reflog entry expires.
          </p>
        }
        interview={
          <p>
            Two things to be precise about: the reflog covers <em>commits</em>, not working-tree state, so{" "}
            <code>reset --hard</code> with uncommitted changes is still a real loss; and it's strictly local — it's
            not pushed, not cloned, and gone if the machine is. Mentioning <code>git fsck --lost-found</code> and the
            expiry defaults shows depth.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="assuming reset --hard is unrecoverable and starting over"
        wrong={`# panic, re-clone the repository,
# rewrite two days of work by hand`}
        right={`git reflog
git reset --hard HEAD@{1}
# thirty seconds`}
        explanation={
          <p>
            The overwhelmingly common case is that the commits still exist and only the branch label moved. Before
            assuming anything is gone, look at the reflog — and remember a fresh clone has an empty one, which is
            exactly why re-cloning is the worst possible first response.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="You ran git reset --hard HEAD~2 with a clean working directory. Can you get the two commits back?"
        options={[
          { id: "a", text: "No — --hard is permanent" },
          { id: "b", text: "Yes, via git reflog, as long as the entry hasn't expired" },
          { id: "c", text: "Only if you pushed them first" },
          { id: "d", text: "Only by re-cloning from the remote" },
        ]}
        correctId="b"
        explanation="The commits are still in the object database; only the branch pointer moved. git reflog shows where it was, and reset --hard to that hash restores it. Uncommitted changes would be a different story."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Break it and fix it"
        hint={
          <p>
            <code>git reflog</code> immediately after the reset. The entry you want is <code>HEAD@{"{"}1{"}"}</code>.
          </p>
        }
      >
        In a scratch repository, make three commits, then <code>git reset --hard HEAD~3</code>. Recover them from
        the reflog. Then delete a branch with <code>-D</code> and recreate it at the right commit. Doing this once,
        deliberately, removes the fear for good.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="Someone force-pushed over your branch and your commits are gone. What now?"
        answer={
          <p>
            Check whether my local clone still has them, which it usually does — my <code>reflog</code> records where
            my branch pointed before the last fetch, so <code>git reflog show my-branch</code> or a plain{" "}
            <code>git reflog</code> gives me the old tip. From there I can create a branch at that commit and push it
            back, or reset my branch to it. If my local copy was already updated and the reflog entry has expired,{" "}
            <code>git fsck --lost-found</code> can surface dangling objects, and failing that, anyone else who
            fetched before the force push has them in their clone. Prevention matters more than recovery here:{" "}
            <code>--force-with-lease</code> instead of <code>--force</code>, and branch protection on shared
            branches so a force push isn't possible in the first place.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "git reflog records every position of HEAD and branches for ~90 days.",
          "Anything ever committed is recoverable: find the hash, reset or branch to it.",
          "Uncommitted changes and cleaned untracked files are not in the reflog — they're gone.",
          "The reflog is local and never cloned or pushed, so re-cloning destroys your safety net.",
          "Before risky operations, create a backup branch — it's cheaper than searching under pressure.",
        ]}
      />
    </>
  )
}
