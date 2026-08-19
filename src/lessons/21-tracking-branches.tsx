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
    note: "A purely local branch. The remote has never heard of it.",
  },
  {
    command: "git push",
    output: [
      "fatal: The current branch feature/search has no upstream branch.",
      "To push the current branch and set the remote as upstream, use",
      "",
      "    git push --set-upstream origin feature/search",
    ],
    note: "Git won't guess where to send it. The error message contains the exact command you need — this is one to read rather than panic at.",
  },
  {
    command: "git push -u origin feature/search",
    output: [
      "remote: Create a pull request for 'feature/search' on GitHub by visiting:",
      "remote:      https://github.com/me/shop/pull/new/feature/search",
      "branch 'feature/search' set up to track 'origin/feature/search'.",
    ],
    note: "-u is short for --set-upstream. It pushes and records the pairing, so from now on plain push and pull work.",
  },
  {
    command: "git status -sb",
    output: ["## feature/search...origin/feature/search"],
    note: "The '...origin/feature/search' part is the upstream. When they diverge, this line also shows [ahead 2] or [behind 1].",
  },
]

const commands = `git push -u origin feature          # push and set upstream in one go
git branch -u origin/main           # set upstream for an existing branch
git branch --unset-upstream         # remove the pairing
git branch -vv                      # list branches with their upstreams
git switch feature                  # auto-creates a local branch tracking origin/feature`

const vvOutput = `git branch -vv

* feature/search 8c1d4e2 [origin/feature/search: ahead 2] Add search endpoint
  main          3f8b0aa [origin/main] Fix typo in README
  experiment    a91f4c2 Try the new router`

const config = `# Make -u automatic for every new branch you push
git config --global push.autoSetupRemote true`

export default function TrackingBranchesLesson() {
  return (
    <>
      <p>
        An <strong>upstream</strong> is a pairing: this local branch corresponds to that remote branch. It's what
        lets you type <code>git push</code> with no arguments, and what makes "ahead 2, behind 1" possible.
      </p>

      <h2>The error everyone meets on day one</h2>
      <TerminalDemo steps={flow} title="From local-only to tracking" prompt="~/shop" />

      <AnalogyCard title="A forwarding address.">
        Without one, the post office can't deliver — not because your letter is wrong, but because nobody told it
        where the letter goes. Setting the upstream files the address once; after that, "send it" is enough
        information.
      </AnalogyCard>

      <h2>Seeing and setting upstreams</h2>
      <CodeBlock language="bash" filename="upstream commands" code={commands} />
      <CodeBlock language="bash" filename="git branch -vv" code={vvOutput} />
      <p>
        In that output, <code>feature/search</code> tracks <code>origin/feature/search</code> and is two commits
        ahead; <code>main</code> tracks <code>origin/main</code> and is in sync; <code>experiment</code> has no
        upstream at all, so it exists only on this machine.
      </p>

      <Callout variant="tip" title="Stop typing -u forever">
        <code>git config --global push.autoSetupRemote true</code> makes a plain <code>git push</code> on a new
        branch create the remote branch and set the upstream automatically. It's the single best quality-of-life
        setting in Git.
      </Callout>
      <CodeBlock language="bash" filename="the setting" code={config} />

      <h2>Where ahead and behind come from</h2>
      <p>
        "Ahead 2, behind 1" is a comparison between your branch and its upstream <em>as of your last fetch</em>:
      </p>
      <ul>
        <li>
          <strong>Ahead</strong> — commits you have that the remote-tracking branch doesn't. Push to resolve.
        </li>
        <li>
          <strong>Behind</strong> — commits the remote-tracking branch has that you don't. Pull to resolve.
        </li>
        <li>
          <strong>Both</strong> — the branches have diverged. Merge or rebase, then push.
        </li>
      </ul>
      <p>
        Because it's measured against the cached remote-tracking branch, the count is only as fresh as your last{" "}
        <code>git fetch</code>.
      </p>

      <h2>Checking out someone else's branch</h2>
      <p>
        If the remote has a branch you don't, <code>git switch feature/their-work</code> just works: Git sees a
        single matching remote-tracking branch, creates a local branch from it, and sets the upstream for you. No
        need for the long <code>git checkout -b feature --track origin/feature</code> form you'll see in older
        documentation.
      </p>

      <DifficultyLevels
        simple={
          <p>
            The upstream is where a branch pushes to and pulls from. Set it once with <code>-u</code>, then plain{" "}
            <code>push</code> and <code>pull</code> know what you mean.
          </p>
        }
        developer={
          <p>
            An upstream is stored in <code>.git/config</code> as <code>branch.&lt;name&gt;.remote</code> and{" "}
            <code>branch.&lt;name&gt;.merge</code>. It drives argument-less push/pull, the ahead/behind counts in{" "}
            <code>status</code> and <code>branch -vv</code>, and the <code>@{"{"}upstream{"}"}</code> revision
            shorthand.
          </p>
        }
        interview={
          <p>
            Distinguish clearly: a remote-tracking branch (<code>origin/main</code>) is a local read-only cache of
            remote state; an upstream is a configured association between a local branch and one of those. The first
            is a ref, the second is config. Ahead/behind counts compare against the cache, so they're stale until you
            fetch.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="pushing a branch to the wrong name"
        wrong={`git push origin main
# while standing on feature/search
# — pushes feature's commits
# into the remote's main`}
        right={`git push -u origin feature/search
# or just: git push
# once the upstream is set`}
        explanation={
          <p>
            <code>git push origin main</code> means "push my current commit to the remote branch called main",
            regardless of which branch you're on. On a protected <code>main</code> it'll be rejected; on an
            unprotected one it quietly delivers unreviewed work. Set the upstream and let plain <code>push</code> do
            the right thing.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="git status says 'ahead 3'. What does that mean?"
        options={[
          { id: "a", text: "The remote has 3 commits you don't have" },
          { id: "b", text: "You have 3 commits that your remote-tracking branch doesn't have" },
          { id: "c", text: "There are 3 merge conflicts waiting" },
          { id: "d", text: "3 files have uncommitted changes" },
        ]}
        correctId="b"
        explanation="Ahead means local commits not yet on the remote — push to resolve. And since it's measured against origin/... as of your last fetch, run git fetch if you want the number to be current."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Inspect the config Git writes"
        hint={
          <p>
            <code>git config --get-regexp branch</code> prints every branch-related setting in the current
            repository.
          </p>
        }
      >
        Push a new branch with <code>-u</code>, then open <code>.git/config</code> and find the{" "}
        <code>[branch "..."]</code> section it created. Seeing that an upstream is two lines of config removes the
        last of its mystery.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="What does git push -u actually do, and why is it needed?"
        answer={
          <p>
            <code>-u</code> (<code>--set-upstream</code>) pushes the branch and records an association between it and
            the remote branch, written into <code>.git/config</code> as{" "}
            <code>branch.&lt;name&gt;.remote</code> and <code>branch.&lt;name&gt;.merge</code>. It's needed because a
            newly created local branch has no counterpart anywhere — Git deliberately refuses to guess which remote
            or which name you meant. Once set, bare <code>git push</code> and <code>git pull</code> work, ahead/behind
            counts appear in <code>git status</code>, and <code>@{"{"}upstream{"}"}</code> becomes usable in
            revision expressions. Setting <code>push.autoSetupRemote true</code> makes this automatic for new
            branches.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "An upstream pairs a local branch with a remote branch; it's two lines in .git/config.",
          "git push -u origin <branch> sets it on the first push; push.autoSetupRemote makes that automatic.",
          "git branch -vv lists every branch with its upstream and ahead/behind counts.",
          "Ahead/behind is measured against the cached remote-tracking branch — fetch to refresh it.",
          "git switch <name> auto-creates a tracking branch when the remote has a matching one.",
        ]}
      />
    </>
  )
}
