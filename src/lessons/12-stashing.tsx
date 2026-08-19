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

const stashFlow: TerminalStep[] = [
  {
    command: "git status --short",
    output: [" M src/checkout.js", " M src/cart.js"],
    note: "Half-finished work, and an urgent bug report just landed for a different branch.",
  },
  {
    command: 'git stash push -m "checkout rewrite, half done"',
    output: ["Saved working directory and index state On feature/checkout: checkout rewrite, half done"],
    note: "Your changes are saved away and the working directory is back to a clean HEAD. Always add -m — 'WIP on feature/checkout' tells you nothing next week.",
  },
  {
    command: "git switch main",
    output: ["Switched to branch 'main'"],
    note: "Now the switch is clean, because there were no local modifications to carry over or block it.",
  },
  {
    command: "git stash list",
    output: ["stash@{0}: On feature/checkout: checkout rewrite, half done"],
    note: "The stash is a stack. The newest entry is always stash@{0}, and older ones shift down as you add more.",
  },
  {
    command: "git switch feature/checkout && git stash pop",
    output: [
      "Auto-merging src/checkout.js",
      "On branch feature/checkout",
      "Changes not staged for commit:",
      "        modified:   src/cart.js",
      "        modified:   src/checkout.js",
      "Dropped refs/stash@{0}",
    ],
    note: "pop reapplies the changes and deletes the stash entry. Use apply instead if you want to keep the entry around.",
  },
]

const stashCommands = `git stash push -m "message"     # stash tracked modifications
git stash -u                    # ...including untracked files
git stash -a                    # ...including ignored files too
git stash list                  # what's stashed
git stash show -p stash@{1}     # the full diff of one entry
git stash pop                   # reapply the newest and delete it
git stash apply stash@{2}       # reapply a specific one, keep the entry
git stash drop stash@{0}        # delete one entry
git stash clear                 # delete all of them (no undo prompt)
git stash branch fix-it         # create a branch from a stash and apply it`

export default function StashingLesson() {
  return (
    <>
      <p>
        You're halfway through something, nothing works yet, and you need to switch branches right now. Committing
        broken work pollutes history; throwing it away is worse. <code>git stash</code> is the third option.
      </p>

      <h2>The flow</h2>
      <TerminalDemo steps={stashFlow} title="Park work, switch away, come back" prompt="~/shop" />

      <AnalogyCard title="Sweeping the desk into a drawer.">
        Someone important walks in and you need a clear desk immediately. You sweep everything into a drawer, deal
        with them, then tip the drawer back out. It works perfectly — as long as you don't end up with fourteen
        drawers and no idea what's in any of them.
      </AnalogyCard>

      <h2>The commands</h2>
      <CodeBlock language="bash" filename="git stash" code={stashCommands} />

      <Callout variant="warning" title="Untracked files are not stashed by default">
        Plain <code>git stash</code> saves modifications to <em>tracked</em> files only. A brand-new file stays in
        your working directory — which is fine until you assumed it was safely stashed and ran something
        destructive. Use <code>-u</code> when new files are part of the work.
      </Callout>

      <h2>pop versus apply</h2>
      <ul>
        <li>
          <code>git stash pop</code> — reapply the changes and remove the entry from the stash. The everyday choice.
        </li>
        <li>
          <code>git stash apply</code> — reapply but keep the entry. Useful when you want the same changes on two
          branches, or when you're not yet sure the reapply worked.
        </li>
      </ul>
      <p>
        If <code>pop</code> hits a conflict, the entry is <strong>kept</strong> rather than dropped, so you can't
        lose the work by resolving badly. Resolve the conflict, then remove the entry yourself with{" "}
        <code>git stash drop</code>.
      </p>

      <h2>When not to stash</h2>
      <p>
        The stash is for minutes and hours, not days. It's invisible in the branch graph, it isn't pushed anywhere,
        and it has no message discipline — three stashes deep, nobody knows what's in them. For anything longer,
        make a real commit on a branch:
      </p>
      <ul>
        <li>
          A work-in-progress commit you amend later, or squash before opening a pull request.
        </li>
        <li>
          A throwaway branch: <code>git switch -c wip/checkout</code> then commit. It's visible, named, and safe
          from an accidental <code>git stash clear</code>.
        </li>
      </ul>

      <DifficultyLevels
        simple={
          <p>
            <code>git stash</code> puts your unfinished changes in a drawer so your working directory is clean, and{" "}
            <code>git stash pop</code> takes them back out again.
          </p>
        }
        developer={
          <p>
            A stash entry is actually a commit object (two or three parents: HEAD, the index state, and optionally
            untracked files) recorded under <code>refs/stash</code>, with older entries reachable through that ref's
            reflog. That's why <code>stash@{"{"}n{"}"}</code> is reflog syntax, and why a dropped stash can sometimes
            still be recovered with <code>git fsck --unreachable</code>.
          </p>
        }
        interview={
          <p>
            Points that land: stashes are commits under <code>refs/stash</code>, not a magic side-channel; untracked
            files need <code>-u</code>; <code>pop</code> keeps the entry if the reapply conflicts; and stashes are
            local-only, so they're a poor place for anything you'd be upset to lose — a WIP commit on a branch is
            strictly safer.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="a stash pile with no messages"
        wrong={`git stash
git stash
git stash
git stash list
# WIP on main: 3f8b0aa Fix typo
# WIP on main: 3f8b0aa Fix typo
# WIP on main: 3f8b0aa Fix typo`}
        right={`git stash push -m "cart: quantity rounding"
git stash push -m "spike: try new router"
git stash list
# stash@{0}: On main: spike: try new router
# stash@{1}: On main: cart: quantity rounding`}
        explanation={
          <p>
            The default message names the commit you were sitting on, which is identical for every stash you take
            from the same place. Ten minutes later that's fine; a week later you're popping stashes one by one to
            find out what they are. <code>-m</code> costs three seconds.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="You run git stash, switch branches, and your new file untitled.js is still sitting in the working directory. Why?"
        options={[
          { id: "a", text: "The stash failed silently" },
          { id: "b", text: "git stash only saves tracked files unless you pass -u" },
          { id: "c", text: "Files must be committed before they can be stashed" },
          { id: "d", text: "The file was in .gitignore" },
        ]}
        correctId="b"
        explanation="By default the stash covers modifications to tracked files. Untracked files need git stash -u (and ignored files need -a), otherwise they simply stay where they are."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Stash with a conflict, on purpose"
        hint={
          <p>
            After stashing, edit the same line on the branch before popping. Then check <code>git stash list</code>{" "}
            after resolving — the entry will still be there.
          </p>
        }
      >
        Make a change, stash it, then change the same lines differently and commit. Now <code>git stash pop</code>{" "}
        and resolve the conflict. Confirm for yourself that the stash entry survived the conflicted pop, then drop
        it deliberately.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="When would you use git stash, and when would you not?"
        answer={
          <p>
            Use it for short interruptions: you're mid-change, a hotfix or a review comes in, and you need a clean
            working directory to switch branches or pull. Stash, deal with it, pop, carry on. Avoid it as storage.
            Stashes are local, invisible to teammates, absent from the branch graph, and easy to lose track of once
            there are several — so anything you'd be upset to lose belongs in a commit on a branch, even a scruffy
            WIP commit you amend or squash later. Two details worth knowing: untracked files need <code>-u</code>,
            and a stash entry is really a commit under <code>refs/stash</code>, which is why <code>pop</code> can
            conflict and why it keeps the entry when it does.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "git stash parks uncommitted changes and leaves a clean working directory.",
          "Always use -m: default stash messages are identical and tell you nothing later.",
          "Untracked files need -u; ignored files need -a.",
          "pop reapplies and deletes the entry; apply keeps it. A conflicting pop keeps the entry too.",
          "Stash for minutes, not days — long-lived work belongs in a commit on a branch.",
        ]}
      />
    </>
  )
}
