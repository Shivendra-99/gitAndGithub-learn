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
  { at: "c2", name: "v1.0.0", tone: "tag" },
  { at: "c4", name: "v1.1.0", tone: "tag" },
  { at: "c4", name: "main" },
]

const tagCommands = `# Annotated tag — has an author, date, and message. Use this one.
git tag -a v1.2.0 -m "Add product search"

# Lightweight tag — just a name pointing at a commit
git tag v1.2.0-rc1

# Tag a commit from the past
git tag -a v1.1.0 8c1d4e2 -m "Retroactive tag"

git tag                       # list
git show v1.2.0               # what it points at, plus the message
git push origin v1.2.0        # tags are NOT pushed by git push
git push origin --tags        # push all of them
git tag -d v1.2.0             # delete locally
git push origin --delete v1.2.0`

const semver = `MAJOR.MINOR.PATCH   e.g. 2.4.1

MAJOR  breaking change — existing users must do something
MINOR  new functionality, backwards compatible
PATCH  bug fix, backwards compatible

Pre-release: 2.5.0-beta.1, 2.5.0-rc.2`

const releaseWorkflow = `name: Release
on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22
      - run: npm ci && npm run build
      - run: gh release create \${{ github.ref_name }} dist/* --generate-notes
        env:
          GH_TOKEN: \${{ github.token }}`

const pagesWorkflow = `name: Deploy Pages
on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    environment: github-pages
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: npm
      - run: npm ci && npm run build
      - uses: actions/upload-pages-artifact@v4
        with:
          path: dist
      - uses: actions/deploy-pages@v4`

export default function ReleasesAndPagesLesson() {
  return (
    <>
      <p>
        A tag marks one commit as meaningful — "this is version 1.2.0". A GitHub Release wraps that tag with notes
        and downloadable files. GitHub Pages serves a website straight from the repository. All three turn a
        repository into something people can actually consume.
      </p>

      <h2>Tags: permanent labels on commits</h2>
      <p>
        Unlike branches, tags don't move. Once <code>v1.2.0</code> points at a commit, it points there forever —
        which is the entire reason they're trustworthy.
      </p>
      <CommitGraphDiagram
        commits={commits}
        refs={refs}
        laneLabels={{ 0: "main" }}
        title="Two releases on one branch"
        static
      />
      <CodeBlock language="bash" filename="git tag" code={tagCommands} />

      <Callout variant="warning" title="git push does not push tags">
        This surprises everyone once: you tag, you push, and the tag isn't on GitHub. Tags need{" "}
        <code>git push origin &lt;tag&gt;</code> or <code>--tags</code> explicitly. Setting{" "}
        <code>push.followTags true</code> makes annotated tags travel with a normal push.
      </Callout>

      <h2>Annotated versus lightweight</h2>
      <p>
        An annotated tag is a real Git object with a tagger, date, and message — and it can be signed. A lightweight
        tag is just a ref. For anything you'd call a release, use <code>-a</code>: you'll want to know who cut it
        and when, and <code>git describe</code> only considers annotated tags by default.
      </p>

      <AnalogyCard title="A tag is a bookmark glued in place.">
        A branch is a bookmark you move as you read. A tag is one glued to page 340 — the point of it is that it
        never moves, so "page 340" means the same thing to everyone, forever.
      </AnalogyCard>

      <h2>Semantic versioning</h2>
      <CodeBlock language="bash" filename="semver" code={semver} />
      <p>
        The contract is with your users: a patch bump should never require them to change anything, and a major bump
        warns them it will. Follow it loosely if you like, but be consistent — the number is only useful if it
        means something.
      </p>

      <h2>Releases</h2>
      <p>
        A Release attaches release notes and binary assets to a tag. <code>--generate-notes</code> writes a first
        draft from the merged pull requests since the previous tag, which is usually 80% of what you'd write by
        hand.
      </p>
      <CodeBlock language="yaml" filename=".github/workflows/release.yml" code={releaseWorkflow} />
      <p>
        Pushing a <code>v*</code> tag now builds the project and publishes a release with the built files attached —
        the entire release process reduced to <code>git push origin v1.2.0</code>.
      </p>

      <h2>GitHub Pages</h2>
      <p>
        Pages hosts static files on a public URL, free, with HTTPS. For a project repository the default URL is{" "}
        <code>username.github.io/repo-name</code>; a repository named <code>username.github.io</code> serves at the
        root instead. Custom domains are a CNAME away.
      </p>
      <CodeBlock language="yaml" filename=".github/workflows/pages.yml" code={pagesWorkflow} />

      <Callout variant="tip" title="The classic Pages bug: broken asset paths">
        A project site lives under a sub-path, so a build that assumes it's at the root loads nothing. In Vite set{" "}
        <code>base: "/repo-name/"</code>; other tools have an equivalent. If your deployed page is blank with 404s
        in the console, this is almost always why.
      </Callout>

      <DifficultyLevels
        simple={
          <p>
            Tag a commit to mark a version, push the tag, and GitHub can turn it into a release with notes and
            downloads. Pages publishes a website from the same repository.
          </p>
        }
        developer={
          <p>
            Annotated tags are objects with metadata and are what <code>git describe</code> uses; lightweight tags
            are bare refs. Tags need explicit pushing. Releases are a platform layer over tags carrying notes and
            assets, commonly automated by a workflow triggered on <code>v*</code>. Pages deploys an artifact through{" "}
            <code>upload-pages-artifact</code> and <code>deploy-pages</code> with OIDC permissions.
          </p>
        }
        interview={
          <p>
            Know the tag distinction and that tags aren't pushed by default; explain semver as a contract about
            breakage rather than a numbering aesthetic; and be able to describe a tag-triggered release pipeline. For
            Pages, the base-path gotcha and the fact that deployment now goes through Actions rather than a{" "}
            <code>gh-pages</code> branch are the current details.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="moving a tag that's already published"
        wrong={`git tag -f v1.2.0 <new-commit>
git push --force origin v1.2.0
# anyone who already fetched
# has a different v1.2.0`}
        right={`git tag -a v1.2.1 -m "Fix the packaging error"
git push origin v1.2.1`}
        explanation={
          <p>
            A published tag is a promise that a version means one specific commit. Moving it means two people can
            build "v1.2.0" and get different software, which is exactly the class of bug nobody can reproduce. Cut a
            new patch version instead.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="You created a tag and ran git push. The tag isn't on GitHub. Why?"
        options={[
          { id: "a", text: "Tags take time to appear" },
          { id: "b", text: "git push doesn't push tags — you need git push origin <tag> or --tags" },
          { id: "c", text: "Only annotated tags can be pushed" },
          { id: "d", text: "The tag needs a release first" },
        ]}
        correctId="b"
        explanation="Tags are refs outside the branch you're pushing, so a plain push ignores them. Push them explicitly, or set push.followTags true so annotated tags go along automatically."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Ship a release from a tag"
        hint={
          <p>
            <code>gh release create v0.1.0 --generate-notes</code> does it in one command once the tag is pushed.
          </p>
        }
      >
        Tag a project <code>v0.1.0</code> with an annotated tag, push it, and create a release with generated notes.
        If the project builds to static files, add the Pages workflow and get it live on a real URL.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="What's the difference between a tag and a branch, and how do you use tags for releases?"
        answer={
          <p>
            Both are refs pointing at a commit, but a branch is expected to move as you commit while a tag is meant
            to stay put — that permanence is what makes "v1.2.0" a reliable reference. I use annotated tags (
            <code>-a</code>) for releases because they're real objects with a tagger, date, and message, can be
            signed, and are what <code>git describe</code> uses. Tags aren't pushed by a normal{" "}
            <code>git push</code>, which catches people out. For releases I follow semantic versioning and automate
            the rest: a workflow triggered on <code>v*</code> tags builds the project and publishes a GitHub Release
            with generated notes and the build artifacts attached, so cutting a release is just pushing a tag. And I
            never move a published tag — if something's wrong, that's a new patch version, because a version number
            that means two different commits is an unreproducible bug waiting to happen.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "Tags mark a commit permanently; branches move, tags shouldn't.",
          "Use annotated tags (-a) for releases — they carry author, date, message, and can be signed.",
          "git push doesn't push tags; use --tags or set push.followTags true.",
          "A tag-triggered workflow can build and publish a GitHub Release automatically.",
          "GitHub Pages serves static files from a repo — set the correct base path for project sites.",
        ]}
      />
    </>
  )
}
