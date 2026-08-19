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

const logForms = `git log                        # full entries, newest first
git log --oneline              # one line per commit
git log --oneline --graph      # plus an ASCII branch graph
git log -5                     # the last five commits
git log --stat                 # which files each commit touched
git log -p                     # the full diff of each commit`

const filters = `git log --author="Ada"                  # by author
git log --since="2 weeks ago"           # by date
git log --grep="login"                  # by commit message
git log -S"validateToken"               # commits that added or removed this string
git log -- src/auth/                    # commits touching this path
git log main..feature                   # on feature, not yet on main`

const blameOutput = `git blame -L 40,44 src/auth.js

a91f4c2 (Ada Lovelace 2026-03-11 14:02:19 +0000 40) function validateToken(token) {
a91f4c2 (Ada Lovelace 2026-03-11 14:02:19 +0000 41)   if (!token) return false
7d20e1b (Grace Hopper 2026-01-08 09:41:55 +0000 42)   const [header, payload] = token.split(".")
7d20e1b (Grace Hopper 2026-01-08 09:41:55 +0000 43)   if (!payload) return false
3f8b0aa (Ada Lovelace 2025-11-22 16:30:02 +0000 44)   return verify(payload)`

const bisect: TerminalStep[] = [
  {
    command: "git bisect start",
    note: "Begins a binary search through history. Git will now check out commits for you to test.",
  },
  {
    command: "git bisect bad",
    note: "The current commit is broken. That's one end of the search range.",
  },
  {
    command: "git bisect good v1.4.0",
    output: ["Bisecting: 63 revisions left to test after this (roughly 6 steps)"],
    note: "This tag was fine. Git now checks out a commit halfway between the two — 128 candidates become 7 tests.",
  },
  {
    command: "npm test",
    output: ["FAIL  src/auth.test.js"],
    note: "Test whatever proves the bug is present. Anything works: a test suite, a script, or clicking through the app.",
  },
  {
    command: "git bisect bad",
    output: ["Bisecting: 31 revisions left to test after this (roughly 5 steps)"],
    note: "Broken here too, so the culprit is in the earlier half. Repeat: test, then say good or bad.",
  },
  {
    command: "git bisect reset",
    output: ["Previous HEAD position was 7d20e1b... Switched to branch 'main'"],
    note: "When Git names the first bad commit, this puts you back where you started. Never skip it — bisect leaves you on a detached HEAD.",
  },
]

export default function ReadingHistoryLesson() {
  return (
    <>
      <p>
        History is only worth recording if you can search it. These are the commands that turn a wall of commits
        into an answer — who changed this line, when did this break, and what happened on this branch last week.
      </p>

      <h2>git log, in the shapes you'll actually use</h2>
      <CodeBlock language="bash" filename="git log" code={logForms} />
      <p>
        <code>git log --oneline --graph --decorate --all</code> is the one worth committing to muscle memory: every
        branch, drawn as a graph, one line per commit, with branch and tag labels shown. It's the fastest way to
        see the shape of a repository you've just walked into.
      </p>

      <Callout variant="tip" title="log opens a pager">
        Long output goes through <code>less</code>: scroll with arrows or space, and press <code>q</code> to quit.
        People who don't know this often think their terminal has frozen.
      </Callout>

      <h2>Finding the commit you actually want</h2>
      <CodeBlock language="bash" filename="filtering history" code={filters} />
      <p>
        <code>-S</code> deserves special attention. It searches for commits where the <em>number of occurrences</em>{" "}
        of a string changed — in other words, the commits that introduced or removed it. When someone asks "when did
        we add this flag?", that's the command.
      </p>

      <AnalogyCard title="log is the index; blame is the margin note.">
        <code>git log</code> is the book's index — it answers "where is this topic discussed?". <code>git blame</code>{" "}
        is a note in the margin of one line saying who wrote it and when. You use the index to explore, and the
        margin note when you're staring at one specific line wondering why it's there.
      </AnalogyCard>

      <h2>git blame — who wrote this line, and why</h2>
      <CodeBlock language="bash" filename="git blame" code={blameOutput} />
      <p>
        The name is unfortunate — the point isn't fault, it's context. Take the commit hash from the left column and
        run <code>git show a91f4c2</code> to read the full message and the rest of that change. Nine times out of
        ten the message explains the line you were confused by.
      </p>

      <h2>git bisect — find the commit that broke it</h2>
      <p>
        When something worked in an old version and doesn't now, bisect finds the exact commit that changed that by
        binary search. Ten commits take four tests; a thousand take ten.
      </p>
      <TerminalDemo steps={bisect} title="Bisect a regression" />

      <Callout variant="info" title="Bisect can be automated">
        If you can write a command that exits non-zero when the bug is present, <code>git bisect run npm test</code>{" "}
        does the whole search unattended and prints the guilty commit.
      </Callout>

      <DifficultyLevels
        simple={
          <p>
            <code>log</code> lists past changes, <code>blame</code> says who last touched a line, and{" "}
            <code>bisect</code> finds the change that broke something by playing a guessing game with you.
          </p>
        }
        developer={
          <p>
            <code>log</code> walks the commit DAG from a starting ref, so <code>main..feature</code> means "commits
            reachable from feature but not from main". <code>-S</code> (pickaxe) finds commits where a string's
            occurrence count changed, <code>-G</code> matches the diff text by regex, and <code>--follow</code>{" "}
            tracks a file across renames. <code>bisect</code> is a binary search over that same DAG.
          </p>
        }
        interview={
          <p>
            Good things to have ready: the difference between <code>-S</code> (occurrence count changed) and{" "}
            <code>-G</code> (diff matches a regex); that <code>git blame -w -C</code> ignores whitespace and follows
            code moved between files, which makes it far more honest after a reformat; and that{" "}
            <code>git bisect run</code> automates the search given any command with a meaningful exit code.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="reading blame after a big reformat"
        wrong={`git blame src/app.js
# every line: "Prettier run, 2026-02-01"`}
        right={`git blame -w -C src/app.js
# ignores whitespace-only changes and
# follows code moved between files`}
        explanation={
          <p>
            A formatting sweep rewrites every line, so plain blame credits the whole file to whoever ran the
            formatter. <code>-w</code> ignores whitespace changes and <code>-C</code> detects code moved or copied
            from elsewhere. Repositories can also record a <code>.git-blame-ignore-revs</code> file listing bulk
            reformat commits for tools to skip.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question='Which command finds the commits that introduced or removed the string "featureFlag"?'
        options={[
          { id: "a", text: 'git log --grep="featureFlag"' },
          { id: "b", text: 'git log -S"featureFlag"' },
          { id: "c", text: "git blame featureFlag" },
          { id: "d", text: 'git diff --search="featureFlag"' },
        ]}
        correctId="b"
        explanation="--grep searches commit messages, which only helps if someone mentioned the flag when writing them. -S (the pickaxe) searches the changes themselves for commits where that string's occurrence count changed."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Trace one line back to its reason"
        hint={
          <p>
            <code>git blame</code> gives you a hash; <code>git show &lt;hash&gt;</code> gives you the message and
            the full change it belonged to.
          </p>
        }
      >
        In any repository with real history, find a line that looks odd — a strange condition, an unexplained magic
        number. Blame it, open the commit it came from, and see whether the message explains it. Then decide what
        that commit message <em>should</em> have said.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="A bug appeared somewhere in the last 200 commits. How do you find it?"
        answer={
          <p>
            <code>git bisect</code>. Mark the current commit bad and a known-good commit (often a release tag) good;
            Git then checks out the midpoint and you test it, answering good or bad each time. Because it's a binary
            search, 200 commits take about eight tests rather than 200. If the check can be scripted,{" "}
            <code>git bisect run ./test.sh</code> does it unattended. Two practical notes: always finish with{" "}
            <code>git bisect reset</code>, since bisect leaves you on a detached HEAD; and <code>git bisect skip</code>{" "}
            handles commits that can't be tested because they don't build. It's also a strong argument for small,
            individually-working commits — bisect can only narrow a bug down to one commit, so a huge commit leaves
            you with a huge suspect.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "git log --oneline --graph --decorate --all shows the whole repository's shape at a glance.",
          "Filter history by author, date, message (--grep), content (-S), or path.",
          "git blame answers 'who last changed this line' — use -w -C to see past reformats and moves.",
          "git bisect binary-searches history to find the commit that introduced a bug.",
          "git bisect run automates the search entirely when the check can be scripted.",
        ]}
      />
    </>
  )
}
