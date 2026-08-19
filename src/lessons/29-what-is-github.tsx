import { AnalogyCard } from "@/components/lesson/analogy-card"
import { Callout } from "@/components/lesson/callout"
import { Challenge } from "@/components/lesson/challenge"
import { CodeBlock } from "@/components/lesson/code-block"
import { CommonMistake } from "@/components/lesson/common-mistake"
import { DifficultyLevels } from "@/components/lesson/difficulty-levels"
import { InterviewQuestion } from "@/components/lesson/interview-question"
import { KeyTakeaways } from "@/components/lesson/key-takeaways"
import { Quiz } from "@/components/lesson/quiz"

const notGit = `# Pure Git concepts — work offline, no account needed
commit  branch  merge  rebase  tag  remote  stash  reflog

# GitHub features — none of these exist in Git itself
pull request   issue      code review    Actions
Projects       Releases   Pages          Discussions
CODEOWNERS     branch protection         Dependabot`

const gitCli = `# The GitHub CLI: platform features from the terminal
gh auth login
gh repo create my-project --public --source=. --push
gh pr create --title "Add search" --body "Closes #12"
gh pr checkout 482        # check out someone's PR locally
gh pr status
gh issue list --assignee @me
gh run watch              # follow a running Actions workflow`

export default function WhatIsGitHubLesson() {
  return (
    <>
      <p>
        Git manages history. GitHub is where teams do everything <em>around</em> that history: discuss it, review
        it, test it, and ship it. Knowing which half you're using is what stops the two blurring together.
      </p>

      <h2>What belongs to which</h2>
      <CodeBlock language="bash" filename="the dividing line" code={notGit} />
      <p>
        Everything on the second list is a platform product. That's why pull requests behave slightly differently on
        GitLab or Bitbucket, and why Git's own documentation never mentions them.
      </p>

      <AnalogyCard title="Git is the word processor. GitHub is the shared drive with comments and approvals.">
        The word processor tracks every revision of the document; it's complete on its own. The shared drive adds
        the things a team needs around the document: who may edit it, a place to argue about a paragraph, a sign-off
        step before it's published, and a robot that spell-checks every draft.
      </AnalogyCard>

      <h2>What GitHub adds, and why each matters</h2>
      <ul>
        <li>
          <strong>Hosting</strong> — an always-available remote everyone can reach, which is also an off-site backup
          of the whole repository.
        </li>
        <li>
          <strong>Pull requests</strong> — a proposal to merge one branch into another, with a diff, a discussion,
          and an approval gate.
        </li>
        <li>
          <strong>Issues and Projects</strong> — the work backlog, living next to the code it describes.
        </li>
        <li>
          <strong>Actions</strong> — CI/CD triggered by repository events: run tests on every push, deploy on every
          tag.
        </li>
        <li>
          <strong>Permissions and protection</strong> — who can push where, what must pass before a merge, whose
          approval is required.
        </li>
        <li>
          <strong>Security tooling</strong> — dependency alerts, secret scanning, and push protection that blocks a
          credential before it lands.
        </li>
        <li>
          <strong>Releases and Pages</strong> — versioned downloads with notes, and static site hosting straight
          from a repository.
        </li>
      </ul>

      <h2>The alternatives</h2>
      <p>
        GitLab, Bitbucket, Codeberg, Gitea, Azure DevOps — all host Git and all offer their own take on the same
        surrounding features. Because the underlying protocol is identical, moving between them is mostly a matter
        of changing a remote URL and rewriting your CI configuration. Your commits are portable; the platform
        features are not.
      </p>

      <Callout variant="tip" title="gh brings the platform to your terminal">
        GitHub's official CLI covers pull requests, issues, releases, and Actions without leaving the shell — and{" "}
        <code>gh pr checkout 482</code> is the fastest way to run someone's proposed change locally.
      </Callout>
      <CodeBlock language="bash" filename="gh" code={gitCli} />

      <DifficultyLevels
        simple={
          <p>
            Git saves your project's history on your computer. GitHub stores it online and adds the tools a team
            needs: reviewing changes, tracking bugs, and running tests automatically.
          </p>
        }
        developer={
          <p>
            GitHub is a hosting platform plus a collaboration layer: pull requests as a review and merge gate,
            issues for tracking, Actions for CI/CD, and repository rules for enforcement. None of it is part of Git;
            it all sits on top of Git's branches, refs, and commits.
          </p>
        }
        interview={
          <p>
            A crisp answer separates the version control system from the platform, and names concrete examples of
            each. Bonus points for noting that pull requests are not a Git feature, that a repository can be pushed
            to several hosts at once because they all speak the same protocol, and that platform lock-in lives in CI
            configuration and issue data rather than in the code itself.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="treating GitHub as the only copy that matters"
        wrong={`# "It's on GitHub, so it's safe"
# — issues, PR discussions, CI config
# and Actions history live only there`}
        right={`# Code is replicated in every clone.
# Everything else is platform data:
# export issues, keep CI portable,
# know what you'd lose.`}
        explanation={
          <p>
            Every clone is a full backup of the <em>commits</em>. Nothing else — issues, review comments, Actions
            logs, releases, wikis — exists in Git. For anything you'd genuinely miss, know how to export it, and
            don't assume "distributed version control" means the whole project is backed up.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="Which of these is a Git feature rather than a GitHub feature?"
        options={[
          { id: "a", text: "Pull requests" },
          { id: "b", text: "Branch protection rules" },
          { id: "c", text: "Merging a branch" },
          { id: "d", text: "Issue labels" },
        ]}
        correctId="c"
        explanation="Merging is core Git and works offline with no account. Pull requests, branch protection, and issues are all platform features layered on top of Git's branches."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Sort your own workflow into two columns"
        hint={
          <p>
            The test: could you still do it with no internet connection and no account anywhere?
          </p>
        }
      >
        List every Git-or-GitHub action you took in the last week and sort each into "Git" or "platform". The
        surprises are usually the interesting part — most people find their mental model has quietly merged the two.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="If Git already handles version control, what does GitHub actually give you?"
        answer={
          <p>
            A hosted remote plus the collaboration layer Git deliberately doesn't have. Git gives you commits,
            branches, merges, and a complete local history. GitHub adds a permanent shared location for that
            history, pull requests as a review and approval gate before code enters <code>main</code>, issues and
            Projects for tracking work next to the code, Actions for CI/CD triggered by repository events,
            fine-grained permissions and branch protection, and security tooling like secret scanning and dependency
            alerts. None of that is part of Git — pull requests in particular are a platform invention, which is why
            they differ across GitHub, GitLab, and Bitbucket. The practical consequence is that your commits are
            fully portable between hosts, while CI configuration, issues, and review history are not.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "Git = version control on your machine; GitHub = hosting plus collaboration around it.",
          "Pull requests, issues, Actions, and branch protection are platform features, not Git features.",
          "Alternatives (GitLab, Bitbucket, Gitea) speak the same Git — your commits are portable.",
          "Clones back up commits only; issues, reviews, and CI history live solely on the platform.",
          "The gh CLI brings pull requests, issues, and Actions into the terminal.",
        ]}
      />
    </>
  )
}
