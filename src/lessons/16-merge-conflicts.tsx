import { AnalogyCard } from "@/components/lesson/analogy-card"
import { Callout } from "@/components/lesson/callout"
import { Challenge } from "@/components/lesson/challenge"
import { CodeBlock } from "@/components/lesson/code-block"
import { CommonMistake } from "@/components/lesson/common-mistake"
import { DifficultyLevels } from "@/components/lesson/difficulty-levels"
import { InterviewQuestion } from "@/components/lesson/interview-question"
import { KeyTakeaways } from "@/components/lesson/key-takeaways"
import { Quiz } from "@/components/lesson/quiz"
import { MergeConflictDemo } from "@/components/lesson/merge-conflict-demo"
import { TerminalDemo, type TerminalStep } from "@/components/lesson/terminal-demo"

const conflictFlow: TerminalStep[] = [
  {
    command: "git merge feature/login-copy",
    output: [
      "Auto-merging login.html",
      "CONFLICT (content): Merge conflict in login.html",
      "Automatic merge failed; fix conflicts and then commit the result.",
    ],
    note: "Nothing is broken. Git merged everything it could and stopped at the one place it needs a human decision.",
  },
  {
    command: "git status",
    output: [
      "You have unmerged paths.",
      "  (fix conflicts and run \"git commit\")",
      "  (use \"git merge --abort\" to abort the merge)",
      "",
      "Unmerged paths:",
      "        both modified:   login.html",
    ],
    note: "'both modified' is the conflict list. Everything not listed here merged cleanly and is already staged.",
  },
  {
    command: "code login.html",
    note: "Open the file and edit it until it says what it should say. The markers are ordinary text — delete them.",
  },
  {
    command: "git add login.html",
    note: "Staging a conflicted file is how you tell Git 'this one is resolved'. There's no separate resolve command.",
  },
  {
    command: "git commit",
    output: ["[main 5e9a1c3] Merge branch 'feature/login-copy'"],
    note: "Git pre-fills the merge message. Add a line about how you resolved it if the choice was non-obvious — future readers will thank you.",
  },
]

const tools = `git merge --abort            # undo the merge, back to before you started
git diff                     # during a conflict: shows the conflicting hunks
git checkout --ours file     # take your side wholesale
git checkout --theirs file   # take the incoming side wholesale
git mergetool                # open a configured three-way merge tool
git log --merge -p file      # the commits from each side that touched this file`

const rerere = `# Reuse Recorded Resolution: remember how you resolved
# a conflict, and apply the same fix automatically next time
git config --global rerere.enabled true`

export default function MergeConflictsLesson() {
  return (
    <>
      <p>
        A conflict is not an error and nothing is broken. It means two branches changed the same lines, and Git —
        correctly — refuses to guess which version you meant. The file is waiting for you to decide.
      </p>

      <h2>When conflicts actually happen</h2>
      <p>
        Only when both sides changed <strong>the same region</strong> of the same file relative to their common
        ancestor. Two people editing opposite ends of a 2,000-line file merge cleanly. Two people editing the same
        line do not. Conflicts also arise when one side deletes a file the other modified, or when both add a
        different file with the same name.
      </p>

      <h2>The markers, and what to do with them</h2>
      <p>
        Try the three resolutions below. The point to internalise: the conflicted file is just text, and resolving
        means editing it until it's correct.
      </p>
      <MergeConflictDemo />

      <AnalogyCard title="Two people edited the same sentence in a shared document.">
        The software can't know whose wording is better, so it shows you both and asks. That's not a failure — a
        tool that silently picked one would be far more dangerous. Your job is to read both, decide, and write the
        final sentence.
      </AnalogyCard>

      <h2>The full sequence</h2>
      <TerminalDemo steps={conflictFlow} title="Resolve a conflict end to end" prompt="~/site" />

      <Callout variant="tip" title="git merge --abort is always available">
        Until you commit, you can undo the whole merge and return to exactly where you were. There's no state you
        can get into during a conflict that this doesn't rescue you from — which makes experimenting completely
        safe.
      </Callout>

      <h2>Tools that help</h2>
      <CodeBlock language="bash" filename="conflict tooling" code={tools} />
      <p>
        <code>--ours</code> and <code>--theirs</code> are quick, but be careful with the naming: during a{" "}
        <em>merge</em>, "ours" is the branch you're on. During a <em>rebase</em> they swap round, because your
        commits are being replayed onto the other branch. When in doubt, read the file rather than trusting the
        label.
      </p>
      <CodeBlock language="bash" filename="a setting worth having" code={rerere} />
      <p>
        <code>rerere</code> records how you resolved a conflict and replays that resolution if the same conflict
        appears again. It pays for itself the first time you rebase a long-running branch twice.
      </p>

      <h2>How to have fewer conflicts</h2>
      <ul>
        <li>
          <strong>Short-lived branches.</strong> A branch alive for two days conflicts far less than one alive for
          two months.
        </li>
        <li>
          <strong>Integrate often.</strong> Merge or rebase <code>main</code> into your branch regularly, so you
          resolve small conflicts instead of one enormous one.
        </li>
        <li>
          <strong>Agree on formatting.</strong> A shared formatter removes an entire category of whitespace-only
          conflicts.
        </li>
        <li>
          <strong>Split large files.</strong> One file everyone edits is a conflict factory.
        </li>
      </ul>

      <DifficultyLevels
        simple={
          <p>
            Git found two different versions of the same lines and can't choose. Open the file, delete the marker
            lines, leave the version you want, then <code>git add</code> and <code>git commit</code>.
          </p>
        }
        developer={
          <p>
            During a conflict the index holds three entries for the file — stage 1 (base), 2 (ours), 3 (theirs) —
            and the working tree has the marked-up version. Staging the file collapses those to a single resolved
            entry, which is why <code>git add</code> is the "mark as resolved" command. <code>git checkout --ours</code>{" "}
            and <code>--theirs</code> pull stage 2 or 3 wholesale.
          </p>
        }
        interview={
          <p>
            Strong answers mention: conflicts occur only where both sides changed the same region relative to the
            merge base; <code>git add</code> is what marks a resolution; <code>--abort</code> makes the whole thing
            reversible; ours/theirs invert during a rebase; and the real fix is process — short branches, frequent
            integration, shared formatting — rather than better conflict-resolution technique.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="committing the conflict markers"
        wrong={`<<<<<<< HEAD
  const timeout = 2000
=======
  const timeout = 10000
>>>>>>> feature/timeouts`}
        right={`  const timeout = 10000`}
        explanation={
          <p>
            Git doesn't check whether you removed the markers — it only cares that the file is staged. Committed
            markers break the build in a way that's obvious in hindsight and baffling at the time. Search your diff
            for <code>{"<<<<<<<"}</code> before committing, or add a pre-commit hook that rejects them.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="You've edited a conflicted file so it's correct. How do you tell Git it's resolved?"
        options={[
          { id: "a", text: "git resolve <file>" },
          { id: "b", text: "git merge --continue immediately" },
          { id: "c", text: "git add <file>" },
          { id: "d", text: "Nothing — Git detects it automatically when you save" },
        ]}
        correctId="c"
        explanation="Staging the file is the resolution signal: it collapses the three conflict stages in the index into one resolved entry. After every conflicted file is staged, git commit finishes the merge."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Create a conflict on purpose, twice"
        hint={
          <p>
            Two branches, same line, different edits. Then <code>git merge</code> the second into the first.
          </p>
        }
      >
        Manufacture a conflict in a scratch repository. Resolve it once by keeping your side, then use{" "}
        <code>git merge --abort</code>... except you can't after committing — so redo the conflict from scratch and
        this time abort before resolving. Knowing which escape hatch is available when is the point of the exercise.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="Walk me through resolving a merge conflict."
        answer={
          <p>
            First, read what Git told you: it merged everything it could and listed the files it couldn't. Run{" "}
            <code>git status</code> to see the unmerged paths. Open each one — the conflict markers show your side
            between <code>{"<<<<<<< HEAD"}</code> and <code>=======</code>, and the incoming side below it. Edit the
            file to the correct final content, removing the markers entirely; sometimes that's one side, sometimes
            both, sometimes something new. Stage each resolved file with <code>git add</code>, which is how Git
            records the resolution, then <code>git commit</code> to complete the merge. If it goes wrong at any
            point before committing, <code>git merge --abort</code> returns you to the pre-merge state. Worth adding:
            conflicts are a process signal, not a Git problem — frequent integration and short-lived branches are
            what actually reduce them.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "A conflict means both sides changed the same region — Git refuses to guess, which is correct behaviour.",
          "Edit the file until it's right and delete every marker; the markers are plain text.",
          "git add marks a file resolved; git commit finishes the merge.",
          "git merge --abort undoes everything up until the commit.",
          "ours/theirs mean the opposite during a rebase — read the content rather than trusting the label.",
        ]}
      />
    </>
  )
}
