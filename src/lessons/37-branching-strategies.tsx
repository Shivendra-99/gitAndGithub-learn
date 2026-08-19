import { AnalogyCard } from "@/components/lesson/analogy-card"
import { Callout } from "@/components/lesson/callout"
import { Challenge } from "@/components/lesson/challenge"
import { CodeBlock } from "@/components/lesson/code-block"
import { CommonMistake } from "@/components/lesson/common-mistake"
import { DifficultyLevels } from "@/components/lesson/difficulty-levels"
import { InterviewQuestion } from "@/components/lesson/interview-question"
import { KeyTakeaways } from "@/components/lesson/key-takeaways"
import { Quiz } from "@/components/lesson/quiz"
import { CommitGraphDiagram, type GraphCommit, type GraphRef } from "@/components/diagram/commit-graph-diagram"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const githubFlow: GraphCommit[] = [
  { id: "m1", label: "main", lane: 0 },
  { id: "f1", label: "feat", lane: 1, parents: ["m1"] },
  { id: "m2", label: "merge", lane: 0, parents: ["m1", "f1"], tone: "merge" },
  { id: "g1", label: "fix", lane: 1, parents: ["m2"] },
  { id: "m3", label: "merge", lane: 0, parents: ["m2", "g1"], tone: "merge" },
]

const githubFlowRefs: GraphRef[] = [{ at: "m3", name: "main" }]

const gitFlow: GraphCommit[] = [
  { id: "m1", label: "v1.0", lane: 0 },
  { id: "d1", label: "develop", lane: 1, parents: ["m1"] },
  { id: "f1", label: "feature", lane: 2, parents: ["d1"] },
  { id: "d2", label: "merge", lane: 1, parents: ["d1", "f1"], tone: "merge" },
  { id: "r1", label: "release", lane: 2, parents: ["d2"] },
  { id: "m2", label: "v1.1", lane: 0, parents: ["m1", "r1"], tone: "merge" },
]

const gitFlowRefs: GraphRef[] = [
  { at: "m2", name: "main" },
  { at: "d2", name: "develop" },
]

const trunk = `# Trunk-based: everyone commits to main, many times a day.
# Long features hide behind a flag rather than a branch.

if (featureFlags.newCheckout) {
  return <NewCheckout />
}
return <LegacyCheckout />`

export default function BranchingStrategiesLesson() {
  return (
    <>
      <p>
        A branching strategy is a team agreement about which branches exist, what they mean, and how work travels
        between them. There are three you'll meet, and the differences come down to one thing: how long a change
        stays away from <code>main</code>.
      </p>

      <h2>The three</h2>
      <div className="not-prose">
        <Tabs defaultValue="github">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="github">GitHub Flow</TabsTrigger>
            <TabsTrigger value="gitflow">Git Flow</TabsTrigger>
            <TabsTrigger value="trunk">Trunk-based</TabsTrigger>
          </TabsList>

          <TabsContent value="github" className="mt-3 space-y-3">
            <CommitGraphDiagram
              commits={githubFlow}
              refs={githubFlowRefs}
              laneLabels={{ 0: "main", 1: "feature" }}
              title="GitHub Flow: main plus short-lived branches"
              static
            />
            <p className="text-sm text-muted-foreground">
              One long-lived branch. Every change is a short branch with a pull request, merged and deleted within
              days. <code>main</code> is always deployable. This is the default for most web teams, and the right
              starting point unless you have a specific reason otherwise.
            </p>
          </TabsContent>

          <TabsContent value="gitflow" className="mt-3 space-y-3">
            <CommitGraphDiagram
              commits={gitFlow}
              refs={gitFlowRefs}
              laneLabels={{ 0: "main", 1: "develop", 2: "feature/release" }}
              title="Git Flow: main, develop, and supporting branches"
              static
            />
            <p className="text-sm text-muted-foreground">
              <code>main</code> holds released versions only; <code>develop</code> is the integration branch, with{" "}
              <code>feature/*</code>, <code>release/*</code>, and <code>hotfix/*</code> around them. Built for
              software with versioned releases you can't hotfix instantly — desktop apps, firmware, anything with a
              QA gate. Heavy for continuous web deployment, and its own author has since said as much.
            </p>
          </TabsContent>

          <TabsContent value="trunk" className="mt-3 space-y-3">
            <CodeBlock language="jsx" filename="feature flags do the branching" code={trunk} />
            <p className="text-sm text-muted-foreground">
              Everyone commits to <code>main</code> directly or via branches lasting hours, several times a day.
              Incomplete work ships disabled behind a feature flag. Needs strong automated tests and flag
              discipline; in exchange, integration conflicts nearly disappear. Common at high-deployment-frequency
              organisations.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <AnalogyCard title="How long do you stay away from the group?">
        Three walking parties. In GitHub Flow people wander off for an hour and rejoin. In Git Flow a scouting group
        leaves for a week and reports back through a coordinator. In trunk-based everyone stays together and calls
        out as they go. None is wrong — they suit different terrain, and the cost of separation is always the same:
        the longer you're apart, the harder it is to reunite.
      </AnalogyCard>

      <h2>Choosing</h2>
      <ul>
        <li>
          <strong>Deploy continuously, small team, web app</strong> → GitHub Flow. Simplest thing that works.
        </li>
        <li>
          <strong>Versioned releases, QA cycles, must support old versions</strong> → Git Flow, or a trimmed-down
          version of it.
        </li>
        <li>
          <strong>Large team, excellent test coverage, deploying many times a day</strong> → trunk-based with feature
          flags.
        </li>
      </ul>
      <p>
        The most common mistake is adopting Git Flow because it looks professional, then maintaining{" "}
        <code>develop</code> as an exact copy of <code>main</code> forever. Pick the lightest structure that solves a
        problem you actually have.
      </p>

      <Callout variant="tip" title="Whatever you pick, keep branches short">
        Every strategy degrades the same way: long-lived branches. A branch alive for six weeks accumulates
        conflicts, hides work from CI, and turns review into archaeology. Days, not weeks — that single rule matters
        more than the strategy you name.
      </Callout>

      <h2>Release branches and hotfixes</h2>
      <p>
        Even on GitHub Flow, you may need to patch a released version while <code>main</code> has moved on. Cut a
        branch from the release tag, fix it there, tag a patch release, and cherry-pick or re-apply the fix on{" "}
        <code>main</code>:
      </p>
      <CodeBlock
        language="bash"
        filename="a hotfix on an old release"
        code={`git switch -c hotfix/1.4.1 v1.4.0
# ...fix, commit...
git tag -a v1.4.1 -m "Fix session leak"
git push origin hotfix/1.4.1 v1.4.1

git switch main
git cherry-pick <fix-commit>   # make sure main has it too`}
      />

      <DifficultyLevels
        simple={
          <p>
            GitHub Flow: <code>main</code> plus short branches. Git Flow: extra long-lived branches for versioned
            releases. Trunk-based: everyone on <code>main</code>, unfinished work hidden behind flags.
          </p>
        }
        developer={
          <p>
            The variable is integration frequency. Short-lived branches with CI on every PR keep merge cost near
            zero; long-lived branches defer it and pay compound interest. Git Flow's extra branches buy release
            isolation, which matters when you can't ship a fix instantly. Trunk-based moves the isolation from
            branches into runtime flags.
          </p>
        }
        interview={
          <p>
            Recommend based on constraints rather than fashion: deployment frequency, whether old versions need
            support, team size, and test coverage. Note that Git Flow's author has publicly recommended against it
            for continuously delivered web apps, and that trunk-based requires flag hygiene — including removing
            flags once they're permanent, or you accumulate dead branches in the code instead.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="a develop branch that does nothing"
        wrong={`main     <- identical to develop
develop  <- everything merges here,
            then straight to main`}
        right={`main     <- protected, always deployable
feature/* <- short-lived, PR, delete`}
        explanation={
          <p>
            If <code>develop</code> never holds anything <code>main</code> doesn't, it's an extra merge step and an
            extra thing to explain to new joiners. Git Flow earns its complexity only when you genuinely have
            release windows and versions to support.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="A five-person team deploys a web app several times a day. Which strategy fits best?"
        options={[
          { id: "a", text: "Git Flow, for the structure" },
          { id: "b", text: "GitHub Flow: main plus short-lived feature branches with PRs" },
          { id: "c", text: "A permanent branch per developer" },
          { id: "d", text: "No branches — commit to main from every machine" },
        ]}
        correctId="b"
        explanation="Continuous deployment with a small team doesn't need release or develop branches. Short branches, a PR each, CI on every one, and main always deployable is the lightest thing that works."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Write your team's rules down"
        hint={
          <p>
            One page: branch naming, who reviews, which merge button, when branches get deleted, how hotfixes work.
          </p>
        }
      >
        Document the branching strategy for a project you work on — including what actually happens, not what you
        wish happened. The gaps you find while writing it are usually the source of your team's recurring Git
        arguments.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="Which branching strategy would you recommend, and why?"
        answer={
          <p>
            It depends on release model more than team size. For a web app deployed continuously, GitHub Flow —{" "}
            <code>main</code> always deployable, short-lived branches, a pull request each with CI and review, merge
            and delete within days. If the product has versioned releases that need supporting after the fact —
            desktop software, embedded, anything with a QA gate — then something closer to Git Flow, with release
            branches so a patch can be cut against an older version. Trunk-based with feature flags works well at
            high deployment frequency and large scale, but it needs genuinely good automated tests and the
            discipline to remove flags afterwards. The thing I'd hold constant across all three is branch lifetime:
            most Git pain in teams comes from branches that lived for weeks, regardless of which strategy is written
            on the wiki.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "GitHub Flow: main plus short-lived branches — the sensible default for web teams.",
          "Git Flow: adds develop, release, and hotfix branches; worth it only with versioned releases.",
          "Trunk-based: commit to main constantly, hide unfinished work behind feature flags.",
          "Choose on deployment frequency, version support, and test coverage — not on which sounds professional.",
          "Whatever the strategy, short-lived branches are what actually prevent merge pain.",
        ]}
      />
    </>
  )
}
