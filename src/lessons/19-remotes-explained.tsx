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

const commits: GraphCommit[] = [
  { id: "c1", label: "c1", lane: 0 },
  { id: "c2", label: "c2", lane: 0, parents: ["c1"] },
  { id: "c3", label: "c3", lane: 0, parents: ["c2"] },
  { id: "c4", label: "c4", lane: 0, parents: ["c3"] },
]

const refs: GraphRef[] = [
  { at: "c2", name: "origin/main" },
  { at: "c4", name: "main" },
]

const remoteCommands = `git remote -v                                   # list remotes and their URLs
git remote add upstream https://github.com/original/repo.git
git remote rename origin github
git remote remove upstream
git remote show origin                          # detailed: branches, tracking, push config
git remote set-url origin git@github.com:me/repo.git`

const branchTypes = `git branch                # local branches
  main
  feature/search

git branch -r             # remote-tracking branches
  origin/main
  origin/feature/search
  origin/HEAD -> origin/main

git branch -a             # both`

export default function RemotesExplainedLesson() {
  return (
    <>
      <p>
        A <strong>remote</strong> is a nickname for a URL where another copy of this repository lives. That's the
        entire concept. <code>origin</code> isn't special or magic — it's just the name <code>git clone</code>{" "}
        happens to use by default.
      </p>

      <h2>Remotes are bookmarks for URLs</h2>
      <CodeBlock language="bash" filename="git remote" code={remoteCommands} />
      <p>
        You can have as many as you like: <code>origin</code> for your fork, <code>upstream</code> for the project
        you forked from, one pointing at a colleague's fork to test their branch. Each is just a label mapping to a
        URL.
      </p>

      <h2>Three kinds of branch</h2>
      <p>
        This is the part worth slowing down for, because it explains almost every confusing message about being
        "ahead" or "behind".
      </p>
      <ul>
        <li>
          <strong>Local branches</strong> — <code>main</code>, <code>feature/search</code>. Yours, on your machine.
        </li>
        <li>
          <strong>Remote-tracking branches</strong> — <code>origin/main</code>. Also on your machine, but read-only:
          Git's record of where the remote's branch was <em>the last time you talked to it</em>.
        </li>
        <li>
          <strong>The actual branches on the server</strong> — which you can't see directly and which may have moved
          since.
        </li>
      </ul>
      <CodeBlock language="bash" filename="listing them" code={branchTypes} />
      <CommitGraphDiagram
        commits={commits}
        refs={refs}
        laneLabels={{ 0: "main" }}
        title="Two commits ahead of origin/main"
        static
      />
      <p>
        In that graph, <code>main</code> is two commits ahead of <code>origin/main</code>: you've committed twice
        since your last sync. That's exactly what "Your branch is ahead of 'origin/main' by 2 commits" means.
      </p>

      <AnalogyCard title="origin/main is a photograph, not a window.">
        Looking at <code>origin/main</code> shows you what the remote looked like when the photo was taken —
        typically your last <code>fetch</code>, <code>pull</code>, or <code>clone</code>. The remote may have moved a
        dozen commits since. Git doesn't poll in the background; the photo only updates when you ask for a new one.
      </AnalogyCard>

      <Callout variant="info" title="This is why git fetch exists">
        <code>git fetch</code> takes a fresh photograph: it updates your remote-tracking branches without touching
        your own work. It's completely safe to run at any time, which makes it the right first move whenever you're
        unsure what the remote looks like.
      </Callout>

      <h2>HTTPS or SSH?</h2>
      <ul>
        <li>
          <strong>HTTPS</strong> (<code>https://github.com/user/repo.git</code>) — works through firewalls and proxies
          everywhere, and needs a personal access token as the password. A credential helper stores it after the
          first time.
        </li>
        <li>
          <strong>SSH</strong> (<code>git@github.com:user/repo.git</code>) — set up a key once and never
          authenticate again. Occasionally blocked on restrictive networks.
        </li>
      </ul>
      <p>
        Switching between them is just <code>git remote set-url origin &lt;new-url&gt;</code>. Nothing about your
        commits or branches changes.
      </p>

      <DifficultyLevels
        simple={
          <p>
            A remote is a saved name for a URL where a copy of your project lives.{" "}
            <code>origin/main</code> is your local note of where that copy's <code>main</code> was last time you
            checked.
          </p>
        }
        developer={
          <p>
            Remotes are configured in <code>.git/config</code> with a URL and a refspec. Remote-tracking branches
            live under <code>refs/remotes/&lt;remote&gt;/</code> and are updated only by <code>fetch</code>,{" "}
            <code>pull</code>, or <code>clone</code>. They're read-only locally: you never commit onto{" "}
            <code>origin/main</code>, you commit onto <code>main</code> and push.
          </p>
        }
        interview={
          <p>
            The distinction to draw cleanly: a remote-tracking branch is a local cache of remote state, not a live
            view. "Ahead by 2, behind by 1" is computed against that cache, so the numbers can be stale — which is
            why the first debugging step for any confusing sync state is <code>git fetch</code>. Also worth noting
            that the number of remotes is unlimited, and <code>origin</code> is convention, not a keyword.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="trusting the ahead/behind count without fetching"
        wrong={`git status
# "up to date with origin/main"
# ...but you last fetched on Monday`}
        right={`git fetch
git status
# now the comparison is against
# the remote as it is right now`}
        explanation={
          <p>
            "Up to date" means "up to date with my last snapshot of the remote". Git never checks the network on its
            own. Fetch first, then read the status — especially before starting a new branch or wondering why your
            push was rejected.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="What is origin/main?"
        options={[
          { id: "a", text: "The main branch on the GitHub server, read live" },
          { id: "b", text: "A local, read-only record of where the remote's main was at your last fetch" },
          { id: "c", text: "A backup copy of your local main branch" },
          { id: "d", text: "The branch you're currently on" },
        ]}
        correctId="b"
        explanation="Remote-tracking branches live in your own .git directory and only change when you fetch, pull, or clone. Git never contacts the network by itself, so origin/main can be days out of date."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Add a second remote"
        hint={
          <p>
            <code>git remote add colleague &lt;their-fork-url&gt;</code>, then <code>git fetch colleague</code>, then{" "}
            <code>git branch -r</code>.
          </p>
        }
      >
        Take any repository with a public fork. Add that fork as a second remote, fetch it, and list remote-tracking
        branches. You now have two people's histories in one local repository — which is the mechanic behind every
        open-source contribution workflow.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="What's the difference between main, origin/main, and the main branch on GitHub?"
        answer={
          <p>
            <code>main</code> is your local branch — the one you commit to. <code>origin/main</code> is a
            remote-tracking branch, which despite the name is stored locally: it's Git's cached record of where the
            remote's <code>main</code> pointed the last time you fetched, pulled, or cloned. The branch on GitHub is
            the real thing, and Git has no idea what it's doing right now, because it never contacts the network
            unprompted. That's the whole explanation for stale "ahead/behind" counts and for rejected pushes that
            seem to come from nowhere: <code>git fetch</code> refreshes the cache without touching your work, and it
            should be the first command you run whenever the sync state looks wrong.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "A remote is a named URL; origin is just the default name clone uses.",
          "Remote-tracking branches like origin/main are local, read-only caches of remote state.",
          "They only update on fetch, pull, or clone — Git never polls the network.",
          "Ahead/behind counts are computed against that cache, so fetch before trusting them.",
          "You can have as many remotes as you like; switching HTTPS/SSH is just set-url.",
        ]}
      />
    </>
  )
}
