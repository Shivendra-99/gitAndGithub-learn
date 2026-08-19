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
    command: "git switch -c feature/search",
    output: ["Switched to a new branch 'feature/search'"],
    note: "Creates the branch at the current commit and moves onto it, in one step. -c is for 'create'.",
  },
  {
    command: "git status -sb",
    output: ["## feature/search"],
    note: "Same files, same content — you've only moved a label. Nothing has been copied.",
  },
  {
    command: 'git commit -am "Add search endpoint"',
    output: ["[feature/search 8c1d4e2] Add search endpoint", " 2 files changed, 31 insertions(+)"],
    note: "Now the branches genuinely diverge: feature/search has a commit that main doesn't.",
  },
  {
    command: "git switch main",
    output: ["Switched to branch 'main'"],
    note: "Your working directory just changed on disk — the new endpoint file is gone, because it only exists on the other branch.",
  },
  {
    command: "git switch -",
    output: ["Switched to branch 'feature/search'"],
    note: "A dash means 'the branch I was on before' — the same trick as cd - in a shell. It's the fastest way to bounce between two branches.",
  },
]

const commands = `# Modern commands (Git 2.23+) — clearer, and what you should use
git switch main                  # move to an existing branch
git switch -c feature/login      # create and move to a new one
git switch -c hotfix v1.4.0      # create it from a tag or any commit
git switch -                     # back to the previous branch
git restore src/app.js           # discard file changes (see lesson 24)

# The older command that does all of the above and more
git checkout main
git checkout -b feature/login
git checkout -- src/app.js`

const carryOver = `# Uncommitted changes come with you IF they don't conflict
git switch main            # works — your edits ride along

# If they'd be overwritten, Git refuses rather than losing them:
error: Your local changes to the following files would be
overwritten by checkout: src/app.js
Please commit your changes or stash them before you switch branches.`

const naming = `feature/user-profile      # new capability
fix/session-timeout       # bug fix
chore/bump-deps           # maintenance
docs/api-examples         # documentation
release/2.4.0             # release preparation
ada/spike-new-router      # personal experiment`

export default function CreatingAndSwitchingBranchesLesson() {
  return (
    <>
      <p>
        Two commands cover almost everything: <code>git switch</code> to move between branches, and{" "}
        <code>git switch -c</code> to create one and move onto it. The subtlety is what happens to work you haven't
        committed yet.
      </p>

      <h2>The everyday flow</h2>
      <TerminalDemo steps={flow} title="Create, commit, switch, come back" prompt="~/shop" />

      <h2>switch and restore, or checkout?</h2>
      <p>
        <code>git checkout</code> historically did several unrelated jobs: move between branches, create branches,
        and throw away file changes. Overloading one command that way is how people accidentally destroyed work.
        Git 2.23 split it into <code>git switch</code> (branches) and <code>git restore</code> (files).
      </p>
      <CodeBlock language="bash" filename="switch vs checkout" code={commands} />
      <p>
        <code>checkout</code> isn't deprecated and you'll see it everywhere in older documentation, so you need to
        recognise it. For your own typing, prefer <code>switch</code> and <code>restore</code> — the intent is
        visible in the command name.
      </p>

      <AnalogyCard title="Switching branches rearranges the room, not the building.">
        Moving to another branch doesn't create a second copy of the project; it rearranges the files in place to
        match that branch's latest commit. Files that only exist on the branch you left will disappear from view —
        not deleted, just not part of the scene you've switched to.
      </AnalogyCard>

      <h2>What happens to uncommitted work</h2>
      <p>
        Uncommitted changes are not attached to a branch. They live in your working directory, so they follow you
        when you switch — <em>unless</em> the switch would have to overwrite them, in which case Git stops and tells
        you.
      </p>
      <CodeBlock language="bash" filename="the carry-over rule" code={carryOver} />
      <p>Three ways out of that message, in rough order of preference:</p>
      <ul>
        <li>
          <strong>Commit</strong> the work on the branch it belongs to.
        </li>
        <li>
          <strong>Stash</strong> it (lesson 12) if you're coming straight back.
        </li>
        <li>
          <strong>Discard</strong> it with <code>git restore</code> — only when you're certain you don't want it.
        </li>
      </ul>

      <Callout variant="warning" title="Detached HEAD isn't an error">
        <code>git switch --detach a91f4c2</code> or checking out a tag puts you on a commit rather than a branch.
        Looking around is completely safe. The trap is <em>committing</em> there: those commits belong to no branch,
        and switching away leaves them unreferenced. If you've made commits and want to keep them, run{" "}
        <code>git switch -c keep-these</code> before moving.
      </Callout>

      <h2>Naming branches</h2>
      <CodeBlock language="bash" filename="conventions" code={naming} />
      <p>
        Any consistent scheme beats no scheme. Include a ticket number if your team uses one (
        <code>fix/PROJ-482-session-timeout</code>) — it makes the link between branch, pull request, and issue
        automatic.
      </p>

      <DifficultyLevels
        simple={
          <p>
            <code>git switch -c name</code> makes a new branch and moves you to it.{" "}
            <code>git switch name</code> moves to an existing one. Unfinished work usually comes with you.
          </p>
        }
        developer={
          <p>
            Switching updates HEAD to the target ref and rewrites the working tree and index to match that commit,
            preserving local modifications where they don't collide. When they would collide, Git aborts rather than
            overwriting. <code>switch</code>/<code>restore</code> replaced the overloaded <code>checkout</code> in
            Git 2.23 precisely because that overload made destructive mistakes easy.
          </p>
        }
        interview={
          <p>
            Points worth making: uncommitted changes live in the working tree, not on a branch, so they carry across
            switches; Git refuses the switch instead of clobbering them; detached HEAD means commits have no branch
            label and become unreachable when you leave; and <code>switch</code>/<code>restore</code> exist to
            separate "move between branches" from "throw away file changes", which used to be the same command.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="starting a feature branch from the wrong place"
        wrong={`# still on an old feature branch
git switch -c feature/new-thing
# inherits someone else's unmerged work`}
        right={`git switch main
git pull
git switch -c feature/new-thing`}
        explanation={
          <p>
            A new branch starts at whatever commit you're standing on. Branch from a stale or unrelated branch and
            its commits become part of yours — which shows up later as a pull request containing changes you didn't
            write. Switch to <code>main</code> and pull first, every time.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="You have uncommitted changes in app.js and run git switch main. Git refuses. Why?"
        options={[
          { id: "a", text: "You can never switch branches with uncommitted changes" },
          { id: "b", text: "app.js differs between the branches, so switching would overwrite your edits" },
          { id: "c", text: "main is protected" },
          { id: "d", text: "You need to run git fetch first" },
        ]}
        correctId="b"
        explanation="Uncommitted changes normally travel with you. Git only refuses when the target branch has a different version of a file you've modified, because completing the switch would destroy your work."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Make Git refuse, then get past it three ways"
        hint={
          <p>
            To trigger it, the same file must differ between the branches <em>and</em> be modified in your working
            directory.
          </p>
        }
      >
        Deliberately create the "local changes would be overwritten" error. Then resolve it three different ways —
        commit, stash, and discard — and note which one you'd want on a real Friday afternoon.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="What's the difference between git checkout, git switch, and git restore?"
        answer={
          <p>
            They overlap because <code>checkout</code> historically did everything: move HEAD to another branch,
            create a branch, check out a specific commit, and overwrite files in the working tree from the index or
            a commit. That last job is destructive and shared a command with harmless navigation, which caused real
            data loss. Git 2.23 introduced <code>git switch</code> for branch operations and <code>git restore</code>{" "}
            for file operations, so the dangerous action now has its own name. <code>checkout</code> still works and
            is all over older documentation, so you need to read it — but new code and new habits should use the
            split commands.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "git switch -c <name> creates a branch at the current commit and moves onto it.",
          "git switch - jumps back to the previous branch.",
          "Uncommitted changes travel with you unless the switch would overwrite them — then Git refuses.",
          "Prefer switch/restore over the overloaded checkout, but learn to read checkout in old docs.",
          "Branch from an up-to-date main, or your branch inherits work that isn't yours.",
        ]}
      />
    </>
  )
}
