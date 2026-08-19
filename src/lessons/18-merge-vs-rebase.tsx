import { AnalogyCard } from "@/components/lesson/analogy-card"
import { Callout } from "@/components/lesson/callout"
import { Challenge } from "@/components/lesson/challenge"
import { CodeBlock } from "@/components/lesson/code-block"
import { CommonMistake } from "@/components/lesson/common-mistake"
import { DifficultyLevels } from "@/components/lesson/difficulty-levels"
import { InterviewQuestion } from "@/components/lesson/interview-question"
import { KeyTakeaways } from "@/components/lesson/key-takeaways"
import { Quiz } from "@/components/lesson/quiz"

const decision = `# Bringing main's latest into MY unshared branch?
git rebase main            # keeps my branch linear

# Delivering my finished branch into main?
git merge --no-ff feature  # preserves the branch's shape
# (or use the platform's squash/merge button)

# Someone else has commits based on mine?
git merge main             # never rebase shared history

# Just syncing my own branch with the remote?
git pull --rebase          # no pointless merge commits`

const squashResult = `# On the branch: five messy commits
8c1d4e2 fix lint
5a3b9f1 actually fix the test
2e7c0d4 wip
9b4f6a8 add search endpoint
3f8b0aa start search work

# After a squash merge: one commit on main
a91f4c2 Add product search endpoint (#482)`

export default function MergeVsRebaseLesson() {
  return (
    <>
      <p>
        This is the argument every team has at least once. It's usually framed as a matter of taste, but the real
        question is concrete: <strong>what should history look like when someone reads it in a year?</strong>
      </p>

      <h2>The trade-off in one line each</h2>
      <ul>
        <li>
          <strong>Merge</strong> preserves exactly what happened, including the fact that two lines of work existed
          in parallel. It never rewrites anything, so it's always safe. The cost is a graph with a lot of branching
          and merge commits.
        </li>
        <li>
          <strong>Rebase</strong> produces a clean, linear history that's easy to read and bisect. The cost is
          rewritten commits, which is unsafe on anything shared, and losing the record that the work happened
          alongside something else.
        </li>
      </ul>

      <AnalogyCard title="A ship's log versus a published account.">
        The log records events as they occurred, including the two days the crew spent going the wrong way. The
        published account presents a clear narrative in the order that makes sense to a reader. Both are legitimate;
        they answer different questions. The mistake is editing the log after other people have copied it.
      </AnalogyCard>

      <h2>The golden rule</h2>
      <Callout variant="warning" title="Don't rebase anything someone else might have">
        Once commits are pushed to a shared branch and someone may have based work on them, rebasing them creates a
        parallel reality: your new commits and their old ones contain the same changes with different hashes.
        Reconciling that means duplicate commits and conflicts that shouldn't exist. Your own unshared feature
        branch is yours to rebase as often as you like.
      </Callout>

      <h2>A decision table you can actually use</h2>
      <CodeBlock language="bash" filename="which one, when" code={decision} />

      <h2>What most teams settle on</h2>
      <p>
        The common convergence point, regardless of which side people argued for:
      </p>
      <ul>
        <li>
          <strong>Rebase locally</strong> to keep your feature branch current and tidy before review.
        </li>
        <li>
          <strong>Never rebase <code>main</code></strong>, or any branch others build on.
        </li>
        <li>
          <strong>Merge into <code>main</code> through a pull request</strong>, using whichever of the three
          platform buttons the team has agreed on.
        </li>
      </ul>

      <h2>The three merge buttons</h2>
      <ul>
        <li>
          <strong>Merge commit</strong> — every commit from the branch lands on <code>main</code>, plus a merge
          commit. Full fidelity, busier graph.
        </li>
        <li>
          <strong>Squash and merge</strong> — the branch becomes exactly one commit on <code>main</code>. The most
          popular default: <code>main</code> stays readable and each entry maps to one pull request. You lose the
          intermediate commits, which is usually a feature rather than a loss.
        </li>
        <li>
          <strong>Rebase and merge</strong> — each commit is replayed onto <code>main</code> individually, no merge
          commit. Linear and detailed, but only pleasant if the branch's commits were curated.
        </li>
      </ul>
      <CodeBlock language="bash" filename="what squash merge does" code={squashResult} />

      <DifficultyLevels
        simple={
          <p>
            Merge keeps a record of both paths. Rebase rewrites your work to look like it came last. Use rebase on
            your own branch; use merge to deliver it.
          </p>
        }
        developer={
          <p>
            Merge adds a commit with two parents and mutates nothing, so it's safe on shared refs. Rebase creates
            new commit objects with new parents and abandons the originals, so it requires a force push once the
            branch has been pushed. Squash merge collapses a branch into a single commit — clean <code>main</code>,
            but the branch's individual commits only survive in the pull request.
          </p>
        }
        interview={
          <p>
            Don't take a dogmatic side; describe the trade-off and the rule. Preserving true history helps auditing
            and understanding parallel work; linear history helps <code>bisect</code>, <code>revert</code>, and
            reading <code>git log</code>. The invariant is that shared history is never rewritten. Mentioning the
            three merge strategies and what each costs shows you've worked on a real team.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="rebasing a branch two people are working on"
        wrong={`# both of you are on feature/checkout
git rebase main
git push --force
# your colleague's next pull is a mess`}
        right={`git merge main
git push
# or: agree who owns the branch,
# and coordinate before rewriting`}
        explanation={
          <p>
            A shared branch is shared history. If a rebase is genuinely needed — say, to clean up before a release —
            tell everyone first, have them push their work, and give them the recovery command (
            <code>git reset --hard origin/feature/checkout</code>) afterwards. Surprise force-pushes are how people
            lose a day.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="Your feature branch is pushed to your fork and nobody else has touched it. main has moved on. What's the cleanest way to update it?"
        options={[
          { id: "a", text: "git merge main — rebasing is always unsafe" },
          { id: "b", text: "git rebase main, then push with --force-with-lease" },
          { id: "c", text: "Delete the branch and start again" },
          { id: "d", text: "git pull without arguments" },
        ]}
        correctId="b"
        explanation="The golden rule is about commits others have built on. Nobody has based work on this branch, so rebasing gives you a clean linear history and a reviewable diff — just push it with --force-with-lease."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Build the same feature twice"
        hint={
          <p>
            <code>git log --oneline --graph --all</code> after each, and compare the shapes side by side.
          </p>
        }
      >
        In a scratch repository, create a branch with two commits while <code>main</code> also gains one. Integrate
        it once with merge and once with rebase (reset in between). Look at both graphs and decide which one you'd
        rather read at 2am with an incident open.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="Merge or rebase — which do you prefer?"
        answer={
          <p>
            Both, for different jobs. I rebase my own feature branch onto the latest <code>main</code> while I'm
            working, so the branch stays current, the diff a reviewer sees contains only my changes, and CI tests
            against current code. I never rebase a branch someone else has based work on, because rebasing creates
            new commits and abandons the originals, which leaves collaborators with a divergent history. For
            delivering work into <code>main</code> I use whatever the team agreed — usually squash-and-merge, which
            keeps <code>main</code> readable with one commit per pull request while the detailed history stays
            visible in the PR. The principle underneath is simple: rewrite freely while work is private, never once
            it's shared.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "Merge preserves what actually happened and is always safe; rebase produces linear history but rewrites commits.",
          "Golden rule: never rebase commits other people may have based work on.",
          "Common workflow: rebase your own branch to stay current, merge into main via a pull request.",
          "Squash and merge keeps main readable — one commit per pull request.",
          "The choice is about what history should say, not about which command is better.",
        ]}
      />
    </>
  )
}
