import { AnalogyCard } from "@/components/lesson/analogy-card"
import { Callout } from "@/components/lesson/callout"
import { Challenge } from "@/components/lesson/challenge"
import { CodeBlock } from "@/components/lesson/code-block"
import { CommonMistake } from "@/components/lesson/common-mistake"
import { DifficultyLevels } from "@/components/lesson/difficulty-levels"
import { InterviewQuestion } from "@/components/lesson/interview-question"
import { KeyTakeaways } from "@/components/lesson/key-takeaways"
import { Quiz } from "@/components/lesson/quiz"

const orient = `git status              # which tree is everything in?
git log --oneline -5    # where am I in history?
git branch -vv          # which branch, tracking what, ahead/behind?
git remote -v           # which remotes exist?
git reflog -10          # what have I done recently?`

const scenarios = `# Committed to the wrong branch (not yet pushed)
git reset --soft HEAD~1          # undo the commit, keep changes staged
git stash
git switch correct-branch
git stash pop
git commit -m "..."

# Or move it wholesale:
git switch correct-branch
git cherry-pick <hash>
git switch wrong-branch
git reset --hard HEAD~1

# Pushed a secret
# 1. ROTATE THE CREDENTIAL. Immediately. It's compromised.
# 2. git rm --cached .env && echo ".env" >> .gitignore && commit
# 3. Optionally rewrite history with git filter-repo, then force-push
#    and have everyone re-clone.

# Detached HEAD with commits you want to keep
git switch -c rescue-branch      # names the commits before you leave

# Push rejected (non-fast-forward)
git pull --rebase && git push

# "refusing to merge unrelated histories"
git pull --allow-unrelated-histories origin main

# Accidentally deleted a branch
git reflog                       # find its last commit
git switch -c restored <hash>

# Merge going badly
git merge --abort

# Rebase going badly
git rebase --abort

# Wrong author on the last commit
git commit --amend --author="Name <email@example.com>"

# Committed a huge file, not yet pushed
git rm --cached big-file.zip
git commit --amend --no-edit

# Everything is a mess and it isn't pushed
git fetch origin
git reset --hard origin/main     # discards local work — be sure`

const messages = `"Your branch is ahead of 'origin/main' by 2 commits"
  -> You have local commits not yet pushed. git push.

"Updates were rejected because the remote contains work you do not have"
  -> The remote moved. git pull --rebase, then push.

"Your local changes would be overwritten by checkout"
  -> Commit, stash, or discard before switching.

"fatal: not a git repository"
  -> You're outside a repo. cd into it, or git init.

"fatal: refusing to merge unrelated histories"
  -> Two independent histories. Add --allow-unrelated-histories if intended.

"error: failed to push some refs ... protected branch"
  -> Branch protection is working. Open a pull request.

"You are in 'detached HEAD' state"
  -> HEAD points at a commit, not a branch. Fine to look around;
     git switch -c <name> before committing anything you want to keep.`

export default function GitTroubleshootingLesson() {
  return (
    <>
      <p>
        The final lesson is a reference you'll come back to. Before any of it: <strong>almost nothing in Git is
        unrecoverable once it's been committed.</strong> The exceptions are uncommitted changes and untracked files,
        which is why "commit early" is the only real safety rule.
      </p>

      <h2>Step one, always: find out where you are</h2>
      <CodeBlock language="bash" filename="orientation" code={orient} />
      <p>
        Most Git panic comes from acting before knowing the state. Those five commands take ten seconds and change
        nothing, and they answer nearly every "what happened?" question on their own.
      </p>

      <AnalogyCard title="Read the instruments before pulling levers.">
        A pilot who feels something wrong doesn't start flipping switches — they read the instruments first,
        because the corrective action depends entirely on what's actually happening. Git has instruments too, and
        they're all read-only.
      </AnalogyCard>

      <h2>The scenario cookbook</h2>
      <CodeBlock language="bash" filename="fixes by situation" code={scenarios} />

      <Callout variant="warning" title="Two commands to think twice about">
        <code>git reset --hard</code> and <code>git clean -fd</code> destroy uncommitted work with no recovery path.
        Before either, ask whether <code>git stash -u</code> would do — it gives you the same clean state and keeps
        the work.
      </Callout>

      <h2>Translating Git's messages</h2>
      <CodeBlock language="bash" filename="what it's actually telling you" code={messages} />
      <p>
        Git's error messages are unusually good: most of them name the exact command that fixes the situation. The
        habit worth building is reading the whole message, including the hint lines, before searching the internet
        for it.
      </p>

      <h2>The recovery ladder</h2>
      <ol>
        <li>
          <strong><code>git status</code></strong> — what state am I in?
        </li>
        <li>
          <strong><code>git reflog</code></strong> — where was I before this went wrong?
        </li>
        <li>
          <strong>A backup branch</strong> — <code>git branch backup-now</code> before attempting a fix.
        </li>
        <li>
          <strong><code>git fsck --lost-found</code></strong> — for orphaned commits the reflog missed.
        </li>
        <li>
          <strong>A colleague's clone</strong> — distributed version control means someone else may still have it.
        </li>
      </ol>

      <DifficultyLevels
        simple={
          <p>
            When something goes wrong: run <code>git status</code>, then <code>git reflog</code>. Between them
            they'll tell you what happened and how to get back.
          </p>
        }
        developer={
          <p>
            Diagnose by tree: is the problem in the working tree, the index, the local refs, or the remote? Working
            tree and index issues are fixed with <code>restore</code>/<code>clean</code>; ref issues with{" "}
            <code>reset</code>, <code>switch</code>, or the reflog; remote issues with <code>fetch</code> and a
            deliberate integration. Anything committed is recoverable while its reflog entry lives.
          </p>
        }
        interview={
          <p>
            What interviewers listen for is method rather than memorised commands: orient first, prefer the
            non-destructive option, take a backup ref before risky operations, and know that reflog covers commits
            but not uncommitted state. Being explicit that a leaked secret must be rotated — not just deleted from
            history — is the answer that separates experience from theory.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="re-cloning as a first response"
        wrong={`# delete the folder, clone again,
# redo two days of work by hand`}
        right={`git status
git reflog
# the commits are almost certainly
# still there`}
        explanation={
          <p>
            A fresh clone has an empty reflog, so it destroys the exact mechanism that would have recovered your
            work. Re-cloning is a reasonable last resort and a terrible first one. Diagnose before you delete
            anything.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="Which of these situations is genuinely unrecoverable?"
        options={[
          { id: "a", text: "git reset --hard removing three committed commits" },
          { id: "b", text: "Deleting a branch that had unmerged commits" },
          { id: "c", text: "git clean -fd deleting untracked files you never committed" },
          { id: "d", text: "A rebase that produced the wrong result" },
        ]}
        correctId="c"
        explanation="Untracked files were never in the object database, so there's nothing for Git to restore. The other three all touched commits, which the reflog can still find."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Build your own cheat sheet"
        hint={
          <p>
            Include the exact error text you saw — that's what you'll search for next time it happens.
          </p>
        }
      >
        Write a personal Git troubleshooting file covering the three situations that have cost you the most time.
        For each: the symptom, the diagnosis command, the fix, and how to avoid it. Keep it where you'll find it at
        6pm on a Friday.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="You've made a mess in a repository and you're not sure what happened. Talk me through it."
        answer={
          <p>
            Stop and diagnose before doing anything else. <code>git status</code> tells me which trees have changes
            and whether a merge or rebase is in progress. <code>git log --oneline -5</code> and{" "}
            <code>git branch -vv</code> tell me where I am and how that compares to the remote.{" "}
            <code>git reflog</code> shows every recent position of HEAD, which is usually where the answer is. Then,
            before attempting a fix, I create a backup branch at the current commit so the attempt itself is
            reversible. From there the fix depends on the tree: <code>restore</code> for working-tree and index
            problems, <code>reset</code> or a branch at an old reflog entry for ref problems, <code>revert</code> if
            the bad commit is already shared. The one thing I don't do is re-clone — a fresh clone has an empty
            reflog, which throws away the tool most likely to recover the work.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "Diagnose first: status, log, branch -vv, remote -v, reflog — all read-only.",
          "Anything committed is recoverable while its reflog entry lives (~30–90 days).",
          "Uncommitted changes and untracked files are the genuinely unrecoverable cases.",
          "Create a backup branch before attempting a risky fix.",
          "Never re-clone as a first response — it destroys the reflog that would have saved you.",
        ]}
      />
    </>
  )
}
