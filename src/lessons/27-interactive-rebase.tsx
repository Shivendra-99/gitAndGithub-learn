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

const todo = `pick 3f8b0aa Start search work
squash 9b4f6a8 add search endpoint
fixup 2e7c0d4 wip
reword 5a3b9f1 actually fix the test
drop 8c1d4e2 fix lint

# Rebase 7d20e1b..8c1d4e2 onto 7d20e1b (5 commands)
#
# Commands:
# p, pick   = use commit
# r, reword = use commit, but edit the message
# e, edit   = use commit, but stop for amending
# s, squash = meld into previous commit, keep both messages
# f, fixup  = like squash, but discard this commit's message
# d, drop   = remove commit`

const todoSteps: WalkthroughStep[] = [
  {
    id: "t1",
    label: "pick — keep it as is",
    detail: "The default for every line. The first line must be a pick (or edit) — there's nothing before it to squash into.",
    lines: 1,
  },
  {
    id: "t2",
    label: "squash — merge into the line above",
    detail: "This commit's changes fold into the previous one, and Git opens an editor with both messages so you can write a combined one.",
    lines: 2,
  },
  {
    id: "t3",
    label: "fixup — merge and discard the message",
    detail: "Same as squash, but throws this commit's message away. Perfect for 'wip' and 'oops forgot a file' commits.",
    lines: 3,
  },
  {
    id: "t4",
    label: "reword — keep the changes, fix the message",
    detail: "Git stops and opens the editor for this commit's message only. The changes are untouched.",
    lines: 4,
  },
  {
    id: "t5",
    label: "drop — remove it entirely",
    detail: "The commit's changes are removed from the branch. Deleting the line does the same thing. Expect a conflict if later commits depended on it.",
    lines: 5,
  },
  {
    id: "t6",
    label: "Order matters — and you can change it",
    detail: "Rebase applies the lines top to bottom, oldest first. Reordering lines reorders history, which is occasionally exactly what you need.",
    range: [1, 5],
  },
]

const commands = `git rebase -i HEAD~5           # the last five commits
git rebase -i origin/main      # every commit not yet on main
git rebase -i --autosquash origin/main   # fold --fixup commits automatically

# While it's running
git rebase --continue
git rebase --abort
git rebase --skip`

const softReset = `# The simplest squash of all: no editor, no todo list
git reset --soft origin/main
git commit -m "Add product search"
# every commit on the branch, collapsed into one`

export default function InteractiveRebaseLesson() {
  return (
    <>
      <p>
        Your branch has eleven commits, four of which say "wip" and one of which is "fix lint". Nobody needs to read
        that. Interactive rebase lets you rewrite those commits into the handful you'd have made if you'd known
        where you were going.
      </p>

      <h2>The todo list</h2>
      <p>
        <code>git rebase -i HEAD~5</code> opens an editor with one line per commit, oldest first. You change the
        verb at the start of each line, save, and Git replays them accordingly.
      </p>
      <CodeWalkthrough
        steps={todoSteps}
        code={todo}
        filename="git-rebase-todo"
        language="bash"
        title="Reading the todo list"
        autoPlayMs={3200}
      />

      <AnalogyCard title="Editing the draft before anyone reads it.">
        A first draft has false starts, repeated paragraphs, and a section you decided against. You don't publish
        that — you edit it into the version that communicates the idea. Interactive rebase is that edit. The
        important word is <em>before</em>: once it's published, editing it under the reader is a different and much
        ruder act.
      </AnalogyCard>

      <h2>Running it</h2>
      <CodeBlock language="bash" filename="git rebase -i" code={commands} />
      <p>
        <code>git rebase -i origin/main</code> is usually the one you want: it covers exactly the commits your pull
        request would contain, without you having to count them.
      </p>

      <Callout variant="tip" title="--autosquash pays for itself">
        Commit fixes as <code>git commit --fixup &lt;hash&gt;</code> while you work, then run{" "}
        <code>git rebase -i --autosquash origin/main</code>. Git pre-fills the todo list with each fixup already
        positioned under its target. Set <code>rebase.autosquash true</code> to make it the default.
      </Callout>

      <h2>The shortcut for the common case</h2>
      <p>
        If all you want is "turn my whole branch into one commit", you don't need the todo list at all:
      </p>
      <CodeBlock language="bash" filename="squash without rebase -i" code={softReset} />
      <p>
        <code>--soft</code> moves the branch back to <code>origin/main</code> while leaving every change staged, so
        one <code>git commit</code> produces a single clean commit. Same result, no editor.
      </p>

      <h2>When it goes wrong</h2>
      <ul>
        <li>
          <strong>A conflict at some step</strong> — resolve it, <code>git add</code>, then{" "}
          <code>git rebase --continue</code>. This can happen once per commit.
        </li>
        <li>
          <strong>The commit is now empty</strong> — its changes were already included by an earlier step. Use{" "}
          <code>git rebase --skip</code>.
        </li>
        <li>
          <strong>Total confusion</strong> — <code>git rebase --abort</code> returns you exactly to where you
          started. Always available until you finish.
        </li>
        <li>
          <strong>Finished, and it's wrong</strong> — <code>git reflog</code>, find the pre-rebase entry, and{" "}
          <code>git reset --hard</code> to it.
        </li>
      </ul>

      <Callout variant="warning" title="Same golden rule as ordinary rebase">
        This rewrites commits. Do it on your own branch before others build on it. Afterwards you'll need{" "}
        <code>git push --force-with-lease</code>, which is fine on a personal feature branch and not fine on{" "}
        <code>main</code>.
      </Callout>

      <DifficultyLevels
        simple={
          <p>
            Interactive rebase opens a list of your recent commits and lets you combine, rename, reorder, or delete
            them before anyone else sees them.
          </p>
        }
        developer={
          <p>
            Git generates a todo list and replays each instruction, creating new commit objects. <code>squash</code>{" "}
            and <code>fixup</code> combine trees, <code>reword</code> changes only the message,{" "}
            <code>edit</code> pauses so you can amend, and <code>drop</code> omits the commit. Reordering lines
            reorders application, which is where most conflicts come from.
          </p>
        }
        interview={
          <p>
            Show you know the operations and the safety rails: <code>--autosquash</code> with{" "}
            <code>--fixup</code> commits, <code>--abort</code> before finishing and reflog after,{" "}
            <code>--force-with-lease</code> for the push, and the fact that <code>git reset --soft</code> is a
            simpler tool when the goal is just "one commit".
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="rebasing more commits than you own"
        wrong={`git rebase -i HEAD~20
# 14 of those are other people's
# commits already on main`}
        right={`git rebase -i origin/main
# exactly the commits unique
# to your branch`}
        explanation={
          <p>
            Counting back a fixed number of commits is easy to get wrong, and rewriting someone else's commits — even
            unintentionally, even if the content is identical — changes their hashes and creates duplicates on the
            next merge. Naming the upstream branch makes the boundary exact.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="What's the difference between squash and fixup in a rebase todo list?"
        options={[
          { id: "a", text: "squash keeps the commit separate; fixup deletes it entirely" },
          { id: "b", text: "Both merge into the previous commit; squash keeps both messages, fixup discards the second" },
          { id: "c", text: "fixup only works on the first commit" },
          { id: "d", text: "There is no difference" },
        ]}
        correctId="b"
        explanation="Both fold the commit's changes into the one above. squash opens an editor with both messages so you can write a combined one; fixup silently discards the message — ideal for 'wip' commits."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Turn five messy commits into two"
        hint={
          <p>
            Start with <code>git rebase -i HEAD~5</code>, use <code>fixup</code> for the junk commits and{" "}
            <code>reword</code> for the ones worth keeping.
          </p>
        }
      >
        In a scratch repository, make five commits with deliberately awful messages ("wip", "wip2", "fix", "fix
        again", "done"). Rebase them into two commits with messages you'd be happy to see in a pull request. Then
        run <code>git rebase --abort</code> on a second attempt to confirm the escape hatch works.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="How would you clean up a messy feature branch before opening a pull request?"
        answer={
          <p>
            <code>git rebase -i origin/main</code> — naming the upstream rather than counting commits, so the range
            is exactly what's unique to my branch. In the todo list I <code>fixup</code> the throwaway commits into
            the real ones, <code>reword</code> anything with a poor message, drop dead ends, and occasionally reorder
            so related changes sit together. If a conflict appears I resolve it, <code>git add</code>, and{" "}
            <code>git rebase --continue</code>; if it goes badly, <code>--abort</code> puts everything back, and the
            reflog covers me even after it finishes. Then <code>git push --force-with-lease</code>. If the goal is
            simply one commit, <code>git reset --soft origin/main</code> followed by a single commit is quicker than
            the whole todo list. And the rule throughout: only on a branch nobody else has built on.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "git rebase -i opens a todo list: pick, reword, edit, squash, fixup, drop — applied oldest first.",
          "Use origin/main as the base rather than counting commits, so you only rewrite your own.",
          "--autosquash plus git commit --fixup positions fixes automatically.",
          "git reset --soft origin/main is the shortcut when you just want one commit.",
          "--abort rescues you mid-rebase; the reflog rescues you after it finishes.",
        ]}
      />
    </>
  )
}
