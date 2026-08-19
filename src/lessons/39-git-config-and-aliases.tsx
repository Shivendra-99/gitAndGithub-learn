import { AnalogyCard } from "@/components/lesson/analogy-card"
import { Callout } from "@/components/lesson/callout"
import { Challenge } from "@/components/lesson/challenge"
import { CodeBlock } from "@/components/lesson/code-block"
import { CommonMistake } from "@/components/lesson/common-mistake"
import { DifficultyLevels } from "@/components/lesson/difficulty-levels"
import { InterviewQuestion } from "@/components/lesson/interview-question"
import { KeyTakeaways } from "@/components/lesson/key-takeaways"
import { Quiz } from "@/components/lesson/quiz"

const safety = `# Refuse to pull if it would need a merge — you decide instead
git config --global pull.ff only

# Push tags that annotate the commits you're pushing
git config --global push.followTags true

# Set the upstream automatically on first push
git config --global push.autoSetupRemote true

# Delete stale origin/* refs on every fetch
git config --global fetch.prune true

# Remember how you resolved a conflict, and reuse it
git config --global rerere.enabled true

# Position --fixup commits automatically during rebase -i
git config --global rebase.autosquash true`

const quality = `# Noticeably better diffs on refactored code
git config --global diff.algorithm histogram

# Show which function each hunk is in, for common languages
git config --global diff.colorMoved zebra

# Sort branch listings by most recent activity
git config --global branch.sort -committerdate

# Use your editor for commit messages
git config --global core.editor "code --wait"`

const aliases = `[alias]
  s = status -sb
  lg = log --oneline --graph --decorate --all -20
  last = log -1 --stat
  unstage = restore --staged
  amend = commit --amend --no-edit
  wip = "!git add -A && git commit -m 'wip: work in progress'"
  undo = reset --soft HEAD~1
  branches = branch -vv --sort=-committerdate
  cleanup = "!git branch --merged main | grep -v ' main$' | xargs -r git branch -d"`

const conditional = `# ~/.gitconfig — use a different identity for work repositories
[user]
  name = Ada Lovelace
  email = ada@personal.dev

[includeIf "gitdir:~/work/"]
  path = ~/.gitconfig-work

# ~/.gitconfig-work
[user]
  email = ada@company.com`

export default function GitConfigAndAliasesLesson() {
  return (
    <>
      <p>
        Git's defaults date from 2005 and are conservative for compatibility reasons. Twenty minutes of
        configuration removes a surprising amount of daily friction — and a couple of these settings prevent
        mistakes rather than just saving keystrokes.
      </p>

      <h2>The settings that prevent problems</h2>
      <CodeBlock language="bash" filename="safety settings" code={safety} />
      <p>
        <code>pull.ff only</code> is the standout. Without it, a <code>git pull</code> on a diverged branch silently
        creates a merge commit; with it, Git stops and makes you choose between rebasing and merging. That single
        setting removes most accidental merge commits from a team's history.
      </p>

      <h2>The settings that make output readable</h2>
      <CodeBlock language="bash" filename="quality of life" code={quality} />
      <p>
        <code>diff.algorithm histogram</code> is worth trying immediately: on code that's been reordered or
        refactored it produces diffs that match what a human would call the change, rather than a shifted-window
        mess.
      </p>

      <AnalogyCard title="Adjusting the seat before a long drive.">
        You can drive with the seat where the last person left it, and thousands of people do. Two minutes of
        adjustment doesn't make the car faster — it makes every hour after that less tiring. Git config is the same
        kind of investment.
      </AnalogyCard>

      <h2>Aliases</h2>
      <CodeBlock language="ini" filename="~/.gitconfig" code={aliases} />
      <ul>
        <li>
          A plain alias expands to a Git subcommand: <code>git s</code> becomes <code>git status -sb</code>.
        </li>
        <li>
          Prefixing with <code>!</code> runs a shell command instead, which is how <code>wip</code> and{" "}
          <code>cleanup</code> above chain several operations.
        </li>
        <li>
          Keep them few and memorable. Thirty aliases nobody remembers is worse than five you use constantly — and
          they make pairing painful, since your commands mean nothing on someone else's machine.
        </li>
      </ul>

      <Callout variant="tip" title="git lg is the one everyone keeps">
        <code>log --oneline --graph --decorate --all</code> is the single most useful invocation in Git, and far too
        long to type. Alias it and you'll use it ten times a day.
      </Callout>

      <h2>Different identities per directory</h2>
      <CodeBlock language="ini" filename="conditional includes" code={conditional} />
      <p>
        <code>includeIf</code> applies extra configuration based on where a repository lives, so everything under{" "}
        <code>~/work/</code> automatically uses your work email — no more commits attributed to the wrong account
        because you forgot to set it locally.
      </p>

      <h2>Debugging config</h2>
      <p>
        When a setting isn't doing what you expect, <code>git config --list --show-origin</code> prints every
        effective value with the file it came from. Local beats global beats system, and this is how you find out
        which layer is winning.
      </p>

      <DifficultyLevels
        simple={
          <p>
            A handful of settings make Git safer and less noisy, and aliases save typing. Set them once, globally,
            and forget about them.
          </p>
        }
        developer={
          <p>
            Config is layered (system, global, local, worktree) with per-command overrides via <code>-c</code>.{" "}
            <code>includeIf</code> supports directory- and branch-conditional includes. Aliases live under{" "}
            <code>[alias]</code>, with a leading <code>!</code> escaping to the shell from the repository root.
          </p>
        }
        interview={
          <p>
            Naming <code>pull.ff only</code>, <code>rerere.enabled</code>, and <code>fetch.prune</code> with a
            reason for each shows real day-to-day use. Conditional includes for multiple identities is a nice detail,
            as is the point that aliases are personal and shouldn't leak into team documentation — write the real
            commands when teaching someone.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="aliases that hide what's happening"
        wrong={`[alias]
  yolo = "!git add -A && git commit -m 'stuff' && git push --force"`}
        right={`[alias]
  s = status -sb
  lg = log --oneline --graph --decorate --all -20`}
        explanation={
          <p>
            An alias that chains a force push behind a three-letter word will eventually run at the wrong moment, on
            the wrong branch. Alias things that are <em>tedious</em>, never things that are <em>dangerous</em> — the
            friction of typing a destructive command in full is a feature.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="What does git config --global pull.ff only do?"
        options={[
          { id: "a", text: "Makes every pull a rebase" },
          { id: "b", text: "Makes pull fail rather than create a merge commit when the branch has diverged" },
          { id: "c", text: "Disables pull entirely" },
          { id: "d", text: "Automatically forces the pull through" },
        ]}
        correctId="b"
        explanation="It restricts pull to fast-forwards. If your branch and its upstream have diverged, Git stops and lets you choose explicitly — merge, or rebase — instead of quietly making a merge commit."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Set up your config properly, once"
        hint={
          <p>
            Paste the safety block, add three aliases, then run <code>git config --list --show-origin</code> to
            confirm they landed in the right file.
          </p>
        }
      >
        Apply the safety settings, add <code>s</code>, <code>lg</code>, and <code>unstage</code> as aliases, and set{" "}
        <code>core.editor</code> to an editor you can exit. If you have work and personal accounts, add a
        conditional include so the right email is used automatically.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="Which Git settings do you change on a new machine, and why?"
        answer={
          <p>
            Identity first — <code>user.name</code> and <code>user.email</code>, with a{" "}
            <code>includeIf</code> block so anything under my work directory uses the work address automatically.
            Then the settings that prevent mistakes: <code>pull.ff only</code>, so a pull on a diverged branch stops
            rather than silently creating a merge commit; <code>fetch.prune</code>, so deleted remote branches don't
            linger; <code>push.autoSetupRemote</code> to stop the "no upstream" error on every new branch; and{" "}
            <code>rerere.enabled</code>, which remembers conflict resolutions and pays for itself on any long-lived
            branch. For readability, <code>diff.algorithm histogram</code> produces much more sensible diffs on
            refactored code. Then a few aliases — <code>s</code> for a short status and <code>lg</code> for the
            graph log — while deliberately avoiding aliases for anything destructive.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "pull.ff only stops accidental merge commits by making you choose explicitly.",
          "fetch.prune, push.autoSetupRemote, and rerere.enabled remove recurring daily friction.",
          "diff.algorithm histogram gives noticeably better diffs on refactored code.",
          "Alias tedious commands (status, graph log) — never destructive ones.",
          "includeIf applies a different identity per directory, so work and personal accounts stay separate.",
        ]}
      />
    </>
  )
}
