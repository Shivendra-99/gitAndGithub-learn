/**
 * The standalone interview question bank powering /interview-questions.
 *
 * `answer` is a plain string rather than JSX for two reasons: it doubles as the
 * text for the FAQPage structured data, and it stays searchable. Wrap an
 * identifier in backticks to have it rendered as inline code.
 *
 * `points`, `code`, and `table` are optional extras rendered below the prose —
 * use them where a list, a snippet, or a side-by-side comparison genuinely
 * explains more than another paragraph would.
 */

export type InterviewCategory =
  | "fundamentals"
  | "internals"
  | "branching"
  | "remotes"
  | "undo"
  | "github"
  | "workflow"
  | "troubleshooting"
  | "commands"

export const INTERVIEW_CATEGORIES: Record<InterviewCategory, string> = {
  fundamentals: "Fundamentals",
  internals: "How Git Works",
  branching: "Branching & Merging",
  remotes: "Remotes & Collaboration",
  undo: "Undo & Recovery",
  github: "GitHub Platform",
  workflow: "Team Workflow",
  troubleshooting: "Troubleshooting Scenarios",
  commands: "Command Round",
}

export interface ComparisonTable {
  columns: [string, string]
  rows: Array<[string, string]>
}

export interface CodeSample {
  caption?: string
  snippet: string
}

export interface InterviewQuestionEntry {
  id: string
  category: InterviewCategory
  question: string
  /** the spoken answer — also used verbatim for FAQPage structured data */
  answer: string
  /** supporting bullets, shown under the prose */
  points?: string[]
  code?: CodeSample
  table?: ComparisonTable
  /** slug of the lesson that covers this in depth, if there is one */
  related?: string
}

export const interviewQuestions: InterviewQuestionEntry[] = [
  // ---------------------------------------------------------------- fundamentals
  {
    id: "git-vs-github",
    category: "fundamentals",
    question: "What is the difference between Git and GitHub?",
    answer:
      "Git is a distributed version control system — a program that runs on your machine and stores your project's history in a local `.git` directory. GitHub is a hosting platform for Git repositories that adds collaboration features Git has no concept of: pull requests, issues, code review, permissions, and CI through Actions. Git works entirely offline and needs no account anywhere; GitHub is one of several interchangeable hosts alongside GitLab, Bitbucket, and self-hosted options.",
    points: [
      "Pull requests are a platform feature, not a Git command — which is why they differ between hosts.",
      "Your commits are portable between hosts; issues, review history, and CI configuration are not.",
      "Committing, branching, merging, and reading history all work with no network connection.",
    ],
    related: "what-is-git",
  },
  {
    id: "distributed-vcs",
    category: "fundamentals",
    question: "What does it mean that Git is 'distributed'?",
    answer:
      "Every clone contains the complete repository — all commits, all branches, the entire history — not just a checkout of the latest files. That means committing, branching, diffing, and searching history all happen locally at disk speed, and every clone is a viable backup. Centralised systems like Subversion keep history on one server, so most operations need the network and losing the server is catastrophic.",
    points: [
      "The network is only needed for clone, fetch, pull, and push.",
      "Cheap local branching is the practical consequence that changed how teams work.",
      "A shallow clone (`--depth`) deliberately gives up this property for speed.",
    ],
    related: "why-version-control",
  },
  {
    id: "what-is-a-commit",
    category: "fundamentals",
    question: "What exactly is a commit?",
    answer:
      "A commit is an immutable object recording a complete snapshot of the project at one moment, plus metadata: a pointer to the tree describing the file structure, one or more parent commits, an author, a committer, timestamps, and a message. Its identity is the SHA hash of that content, so changing anything about a commit — including its parent — produces a different commit rather than modifying the existing one.",
    code: {
      caption: "The entire contents of a commit object",
      snippet: `$ git cat-file -p HEAD
tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904
parent 7d20e1b8c3a5f2e1d9b0a4c6e8f0a2b4c6d8e0f2
author Ada Lovelace <ada@example.com> 1717171717 +0100
committer Ada Lovelace <ada@example.com> 1717171717 +0100

Add password strength meter`,
    },
    related: "how-git-stores-data",
  },
  {
    id: "staging-area-purpose",
    category: "fundamentals",
    question: "What is the staging area and why does Git have one?",
    answer:
      "The staging area (the index) is a proposed next commit that you assemble deliberately. It lets you split a messy working directory into several focused commits — including staging individual hunks of one file with `git add -p` — so history reflects logical changes rather than whatever happened to be on disk. It's also the mechanism for conflict resolution: marking a conflicted file resolved literally means staging it.",
    points: [
      "`git commit -a` bypasses it for tracked files, but never picks up untracked ones.",
      "Staging captures the file at that instant — editing afterwards creates a second, unstaged version.",
      "The index is a real file at `.git/index` holding paths, modes, and blob hashes.",
    ],
    related: "the-three-trees",
  },
  {
    id: "three-trees",
    category: "fundamentals",
    question: "Explain Git's three trees.",
    answer:
      "The working directory is the files on disk; the index (staging area) is the proposed next commit; and HEAD is the commit the current branch points at. `git add` moves content from the working directory to the index, and `git commit` turns the index into a new commit. Nearly every Git command is best understood as moving content between two of these three, which is also exactly what `git reset`'s three modes correspond to.",
    table: {
      columns: ["Command", "What it moves"],
      rows: [
        ["git add", "Working directory → index"],
        ["git commit", "Index → repository (new commit)"],
        ["git restore --staged", "HEAD → index (unstage, edits kept)"],
        ["git restore", "Index → working directory (edits destroyed)"],
        ["git reset --soft/--mixed/--hard", "Moves HEAD, then index, then working directory"],
      ],
    },
    related: "the-three-trees",
  },
  {
    id: "gitignore-tracked",
    category: "fundamentals",
    question: "Why doesn't adding a file to .gitignore stop Git tracking it?",
    answer:
      "Ignore rules are only consulted for untracked paths. Once a file is in the index, Git keeps tracking it regardless of `.gitignore`, so you have to remove it from tracking explicitly with `git rm --cached <file>` — which leaves the file on disk — and commit that removal. If the file contained a secret, untracking it does not undo the leak: the credential is in every clone's history and must be rotated.",
    code: {
      snippet: `git rm --cached .env
echo ".env" >> .gitignore
git commit -m "Stop tracking .env"
# ...then rotate the credential`,
    },
    related: "gitignore",
  },
  {
    id: "good-commit-message",
    category: "fundamentals",
    question: "What makes a good commit message?",
    answer:
      "A short imperative subject line (around 50 characters, completing the sentence 'if applied, this commit will…'), a blank line, then a body explaining why the change was made and what alternatives were rejected. The diff already shows what changed; the message exists to record intent. It matters operationally: when something breaks, `git log --oneline` is what you scan for the suspicious change, and the body is what tells you whether reverting it is safe.",
    points: [
      "Message quality follows commit size — a commit doing one thing is easy to describe.",
      "Conventional Commits (`feat:`, `fix:`, `BREAKING CHANGE:`) let tools derive changelogs and versions.",
      "Avoid 'fix', 'update', and 'address review comments' — meaningless within a week.",
    ],
    related: "commit-messages",
  },
  {
    id: "clone-vs-fork",
    category: "fundamentals",
    question: "What's the difference between cloning and forking?",
    answer:
      "Cloning is a Git operation: it copies a repository — full history included — onto your machine and sets up `origin` pointing back at the source. Forking is a platform feature with no Git command behind it: GitHub creates a server-side copy of someone else's repository under your account, which you then clone. The reason forks exist is permissions — you can clone any public repository, but you can only push to one you have write access to, and the fork is what gives you that.",
    points: [
      "A clone of a repository you can't push to is still complete and fully usable — you just can't publish back to it.",
      "Fork-then-clone is the open-source contribution path; with write access inside a company you usually just clone and branch.",
      "Forks don't sync themselves — you add the original as `upstream` and pull from it.",
    ],
    related: "forks-and-syncing",
  },
  {
    id: "clone-under-the-hood",
    category: "fundamentals",
    question: "What does git clone actually do?",
    answer:
      "Several things as one command: it creates the target directory and initialises a repository, adds the source URL as a remote named `origin`, fetches every object and ref, creates remote-tracking branches such as `origin/main`, then checks out the remote's default branch and sets it to track its counterpart. The consequence worth stating is that you receive the complete object database — a clone is a self-sufficient repository and a genuine backup, not a checkout of a server.",
    code: {
      caption: "What clone does, spelled out",
      snippet: `git init <dir>
git remote add origin <url>
git fetch origin
git switch main            # plus upstream tracking`,
    },
    points: [
      "`--depth N` makes a shallow clone — much faster for CI, but breaks commands that need full history.",
      "`--bare` and `--mirror` clone without a working tree, for hosting or migration.",
      "A ZIP download from GitHub has no history and no remote, so it can't contribute anything back.",
    ],
    related: "init-and-clone",
  },
  {
    id: "git-vs-svn",
    category: "fundamentals",
    question: "How is Git different from SVN?",
    answer:
      "SVN is centralised: one server holds the history and your checkout is just the current files, so committing, viewing history, and branching all need the network. Git is distributed — every clone holds the complete history, so those operations are local and instant and every clone is a full backup. The consequence that actually changed how teams work is branching: SVN implemented branches as server-side directory copies, expensive enough that teams avoided them, while a Git branch is a 41-byte file. Branch-per-change with review before merge only became normal practice once branching was free.",
    table: {
      columns: ["Git", "SVN"],
      rows: [
        ["Distributed — every clone has the full history", "Centralised — history lives on one server"],
        ["Commit, log, diff, and branch work offline", "Most operations need the server"],
        ["Branches are pointers, created instantly", "Branches are directory copies on the server"],
        ["Merging is a first-class graph operation", "Merging historically manual and error-prone"],
        ["Every clone is a viable backup", "The server is a single point of failure"],
      ],
    },
    points: [
      "'Distributed' doesn't mean no central server — teams still designate one by convention, not by protocol.",
      "SVN's partial checkouts and file locking still suit large binary assets, which Git handles poorly without LFS.",
    ],
    related: "why-version-control",
  },

  // ------------------------------------------------------------------ internals
  {
    id: "snapshots-vs-diffs",
    category: "internals",
    question: "Does Git store diffs or snapshots?",
    answer:
      "Snapshots. Each commit points at a tree representing the complete state of the project. Files that didn't change aren't stored again — the new tree references the existing blob by hash — so snapshots are cheap without being deltas. Diffs are computed on demand, which is why comparing two arbitrary commits costs no more than comparing adjacent ones. Delta compression does exist inside packfiles, but as a storage optimisation applied afterwards, not as the data model.",
    related: "how-git-stores-data",
  },
  {
    id: "git-objects",
    category: "internals",
    question: "What object types does Git store?",
    answer:
      "Four. A blob holds the contents of one file with no name attached. A tree is a directory listing mapping names to blobs and other trees — this is where filenames actually live. A commit points at one root tree, at its parents, and carries author, timestamp, and message. An annotated tag is a named, described pointer to another object. Every object is keyed by the hash of its content.",
    table: {
      columns: ["Object", "Contains"],
      rows: [
        ["blob", "File contents (no filename)"],
        ["tree", "Directory listing: names → blobs and trees"],
        ["commit", "Root tree + parent(s) + author + message"],
        ["tag", "Pointer to an object + tagger + message"],
      ],
    },
    related: "how-git-stores-data",
  },
  {
    id: "content-addressing",
    category: "internals",
    question: "Why does Git name objects by a hash of their contents?",
    answer:
      "Content-addressable storage gives three properties for free: identical content is stored exactly once no matter how many files or commits contain it; corruption is detectable because the content no longer matches its name; and history is tamper-evident, since a commit's hash covers its parent's hash, so altering an old commit changes every hash after it. That last point is also why rebasing and amending necessarily produce new commits.",
    related: "how-git-stores-data",
  },
  {
    id: "what-is-head",
    category: "internals",
    question: "What is HEAD, and what does detached HEAD mean?",
    answer:
      "HEAD is a symbolic ref recording where you are — normally it points at a branch, which points at a commit. Detached HEAD means it points straight at a commit instead, which happens when you check out a hash or a tag. Looking around is completely safe; the risk is committing there, because those commits belong to no branch and become unreachable once you switch away. `git switch -c <name>` before leaving keeps them.",
    code: {
      snippet: `$ cat .git/HEAD
ref: refs/heads/main        # attached

$ git switch --detach a91f4c2
$ cat .git/HEAD
a91f4c2c4d7e2f5a8b9c0d1e2f3a  # detached`,
    },
    related: "branches-explained",
  },
  {
    id: "branch-implementation",
    category: "internals",
    question: "How is a branch implemented, and why is branching so cheap?",
    answer:
      "A branch is a file under `.git/refs/heads/` containing a single commit hash — 41 bytes. Creating one copies nothing and contacts no server; committing simply rewrites that file with the new hash. Older centralised systems implemented branches as server-side directory copies, which is why branching was slow and rare there and why the whole industry practice of one short-lived branch per change only became normal with Git.",
    related: "branches-explained",
  },
  {
    id: "why-hash-changes",
    category: "internals",
    question: "Why do commit hashes change after a rebase or an amend?",
    answer:
      "Because a commit's hash is derived from its full content, including its parent pointer and message. Rebasing gives commits a new parent and amending changes the tree or message, so in both cases the result is a different object rather than a modified one. The originals become unreferenced but still exist in the object database and the reflog, which is why recovery is possible — and why pushing a rewritten branch requires a force push.",
    related: "rebasing",
  },
  {
    id: "head-tilde-vs-caret",
    category: "internals",
    question: "What's the difference between HEAD~1 and HEAD^?",
    answer:
      "On an ordinary commit with one parent, nothing — both mean the previous commit. They diverge at merge commits, which have two parents. `^` chooses which parent: `HEAD^1` is the first parent (the branch you were standing on when you merged) and `HEAD^2` is the second (the branch that was merged in). `~` walks backwards along first parents, so `HEAD~2` means two commits back. That makes `HEAD~2` identical to `HEAD^^`, and the two can be combined, as in `HEAD^2~1`.",
    table: {
      columns: ["Expression", "Means"],
      rows: [
        ["HEAD^ / HEAD^1", "First parent of HEAD"],
        ["HEAD^2", "Second parent — only exists on a merge commit"],
        ["HEAD~1", "One commit back, following first parents"],
        ["HEAD~3", "Three commits back, following first parents"],
        ["HEAD^^", "The same commit as HEAD~2"],
      ],
    },
    points: [
      "`git revert -m 1 <merge>` uses the same parent numbering — it says which side to keep.",
      "`git log --first-parent` follows the same rule, which makes a merge-heavy history read as one entry per merged branch.",
      "Everyday use is almost always the `~` form; `^n` mainly appears when dealing with merges.",
    ],
    related: "reading-history",
  },
  {
    id: "bare-repository",
    category: "internals",
    question: "What is a bare repository, and why do servers use them?",
    answer:
      "A bare repository contains only the Git data — what would normally sit inside `.git` — with no working tree checked out. You create one with `git init --bare`, conventionally naming the directory `project.git`. Servers host bare repositories because pushing into a repository that has a checked-out working tree would move the branch out from under whoever is working in it, leaving the files on disk disagreeing with HEAD. With no working tree, there is nothing to disagree.",
    code: {
      snippet: `git init --bare /srv/git/project.git
git clone /srv/git/project.git      # clone it like any other remote

# Git refuses the unsafe case by default:
# "refusing to update checked out branch"  (receive.denyCurrentBranch)`,
    },
    points: [
      "`git clone --bare` and `--mirror` are how you take a full server-side copy for a migration or backup.",
      "GitHub, GitLab, and friends are hosting bare repositories with a web interface on top.",
    ],
    related: "init-and-clone",
  },
  {
    id: "annotated-vs-lightweight-tags",
    category: "internals",
    question: "What's the difference between an annotated and a lightweight tag?",
    answer:
      "A lightweight tag is just a ref — a file holding a commit hash, exactly like a branch that never moves. An annotated tag is a real object in the database with its own hash, storing the tagger's name and email, a date, a message, and optionally a GPG or SSH signature. Use annotated tags for anything you'd call a release: you'll want to know who cut it and when, `git describe` only considers annotated tags by default, and only they can be signed.",
    code: {
      snippet: `git tag v1.0.0                        # lightweight — just a ref
git tag -a v1.0.0 -m "First release"  # annotated — a real object
git show v1.0.0                       # tagger, date, message, target`,
    },
    points: [
      "Neither kind travels with a plain `git push` — use `git push origin <tag>`, `--tags`, or set `push.followTags true`.",
      "Tags aren't meant to move: if a release was wrong, cut a new patch version rather than retagging.",
    ],
    related: "releases-and-pages",
  },

  // ------------------------------------------------------------------ branching
  {
    id: "fast-forward-vs-three-way",
    category: "branching",
    question: "What's the difference between a fast-forward and a three-way merge?",
    answer:
      "A fast-forward happens when the target branch's tip is an ancestor of the branch being merged — nothing new happened on the target, so Git just moves its pointer forward, creating no merge commit and leaving history linear. A three-way merge happens when both branches moved after diverging: Git finds their common ancestor, compares each side against it, combines the changes, and records a commit with two parents. Conflicts only arise where both sides changed the same region relative to that base.",
    points: [
      "`--no-ff` forces a merge commit even when a fast-forward was possible, keeping the feature grouped.",
      "`--ff-only` refuses anything but a fast-forward, which is useful as a pull setting.",
      "A change made on only one side never conflicts, however large it is.",
    ],
    related: "merging",
  },
  {
    id: "merge-vs-rebase",
    category: "branching",
    question: "Merge or rebase — which do you use?",
    answer:
      "Both, for different jobs. I rebase my own feature branch onto the latest main while working, so the branch stays current and the reviewer's diff contains only my changes. I never rebase a branch others have based work on, because rebasing creates new commits and abandons the originals, leaving collaborators with a divergent history. For delivering work into main I use whatever the team agreed — usually squash-and-merge, which keeps main readable at one commit per pull request.",
    table: {
      columns: ["Merge", "Rebase"],
      rows: [
        ["Preserves exactly what happened", "Produces linear, readable history"],
        ["Never rewrites commits — always safe", "Rewrites commits — unsafe once shared"],
        ["Adds a merge commit with two parents", "Replays commits with new hashes"],
        ["Normal push", "Requires --force-with-lease"],
      ],
    },
    related: "merge-vs-rebase",
  },
  {
    id: "golden-rule-rebase",
    category: "branching",
    question: "What is the golden rule of rebasing?",
    answer:
      "Never rebase commits that other people have based work on. Rebasing replaces commits with new objects and abandons the originals, so if someone else holds the originals, your history and theirs silently diverge — the next merge produces duplicated commits and conflicts that shouldn't exist. Private, unshared branches can be rebased as often as you like; anything published should be integrated with merge instead.",
    related: "merge-vs-rebase",
  },
  {
    id: "resolve-conflict",
    category: "branching",
    question: "Walk me through resolving a merge conflict.",
    answer:
      "Git merges everything it can and stops at the files it can't, listing them under 'Unmerged paths' in `git status`. I open each one: my side sits between `<<<<<<< HEAD` and `=======`, the incoming side below it. I edit the file to the correct final content and delete the markers entirely — sometimes that's one side, sometimes both, sometimes something new. `git add` on each file is what marks it resolved, then `git commit` completes the merge. If it goes wrong at any point, `git merge --abort` restores the pre-merge state.",
    points: [
      "`git add` is the resolve command — there is no `git resolve`.",
      "'ours' and 'theirs' swap meaning during a rebase, so read the content rather than trusting the label.",
      "`rerere.enabled` records resolutions and replays them when the same conflict recurs.",
    ],
    related: "merge-conflicts",
  },
  {
    id: "why-conflicts-happen",
    category: "branching",
    question: "Why do merge conflicts happen, and how do you reduce them?",
    answer:
      "A conflict occurs when both branches changed the same region of a file relative to their common ancestor, or when one side deleted a file the other modified. Git refuses to guess, which is correct behaviour. Reducing them is a process question rather than a technique one: short-lived branches, integrating main frequently so you resolve small conflicts instead of one enormous one, a shared auto-formatter to eliminate whitespace conflicts, and splitting files that everyone edits.",
    related: "merge-conflicts",
  },
  {
    id: "interactive-rebase-cleanup",
    category: "branching",
    question: "How do you clean up a messy branch before opening a pull request?",
    answer:
      "`git rebase -i origin/main` — naming the upstream rather than counting commits, so the range is exactly what's unique to my branch. In the todo list I `fixup` throwaway commits into real ones, `reword` poor messages, drop dead ends, and occasionally reorder. Conflicts pause it once per commit; `--abort` restores everything mid-way and the reflog covers me afterwards. If I just want one commit, `git reset --soft origin/main` followed by a single commit is quicker than the todo list.",
    code: {
      snippet: `pick 3f8b0aa Start search work
squash 9b4f6a8 Add search endpoint
fixup 2e7c0d4 wip
reword 5a3b9f1 Fix the pagination test
drop 8c1d4e2 fix lint`,
    },
    related: "interactive-rebase",
  },
  {
    id: "squash-vs-fixup",
    category: "branching",
    question: "In an interactive rebase, what's the difference between squash and fixup?",
    answer:
      "Both fold a commit's changes into the commit above it. `squash` opens an editor containing both messages so you can write a combined one; `fixup` discards the second message silently, which is what you want for 'wip' and 'forgot a file' commits. Pairing `git commit --fixup <hash>` with `git rebase -i --autosquash` positions those fixups under their targets automatically.",
    related: "interactive-rebase",
  },
  {
    id: "cherry-pick",
    category: "branching",
    question: "When would you use git cherry-pick?",
    answer:
      "To apply one specific commit's changes onto a different branch — typically backporting a hotfix from main onto a release branch, or rescuing a single commit from a branch you're otherwise abandoning. It creates a new commit with a new hash, so the same change now exists twice in the graph; that's fine for deliberate backports but a poor substitute for merging, since repeated cherry-picking makes it hard to tell what has actually been applied where.",
    code: {
      snippet: `git switch release/1.4
git cherry-pick a91f4c2
git cherry-pick -x a91f4c2   # records the original hash in the message`,
    },
    related: "branching-strategies",
  },

  // -------------------------------------------------------------------- remotes
  {
    id: "fetch-vs-pull",
    category: "remotes",
    question: "What's the difference between git fetch and git pull?",
    answer:
      "`git fetch` downloads new objects and updates remote-tracking branches like `origin/main`, without touching your local branches, index, or working directory — so it can never conflict and is always safe to run. `git pull` is a fetch followed immediately by an integration step, merge by default or rebase with `--rebase`, and that second half is what can conflict or create an unwanted merge commit. I usually fetch first, look at `git log HEAD..origin/main`, then decide how to integrate.",
    related: "push-fetch-pull",
  },
  {
    id: "origin-main-meaning",
    category: "remotes",
    question: "What is origin/main?",
    answer:
      "A remote-tracking branch — and despite the name it's stored locally. It records where the remote's `main` pointed the last time you fetched, pulled, or cloned. Git never contacts the network on its own, so it can be days out of date, which is the whole explanation for stale 'ahead/behind' counts and for pushes that are rejected unexpectedly. `git fetch` refreshes it without touching your work.",
    related: "remotes-explained",
  },
  {
    id: "rejected-push",
    category: "remotes",
    question: "Your push is rejected as non-fast-forward. What happened and what do you do?",
    answer:
      "The remote branch has commits your branch doesn't, so moving its pointer to your commit would discard them — Git requires pushes to be fast-forwards. It's not a permissions problem. The fix is to integrate first: `git pull --rebase` to replay your commits on top of theirs, resolve any conflicts, then push. Force-pushing makes the message go away by deleting someone else's work, so it's only appropriate on a branch you own and have deliberately rewritten.",
    related: "push-fetch-pull",
  },
  {
    id: "force-with-lease",
    category: "remotes",
    question: "What's the difference between --force and --force-with-lease?",
    answer:
      "`--force` overwrites the remote branch unconditionally, discarding anything pushed since you last looked. `--force-with-lease` first checks that the remote is still where your last fetch said it was, and refuses if someone has pushed in the meantime. Since the legitimate reason to force-push is 'I rewrote my own branch', the lease version does exactly what you meant while catching the race you didn't anticipate.",
    related: "rebasing",
  },
  {
    id: "upstream-tracking",
    category: "remotes",
    question: "What does git push -u actually do?",
    answer:
      "It pushes the branch and records an upstream association in `.git/config` as `branch.<name>.remote` and `branch.<name>.merge`. That's needed because a new local branch has no counterpart anywhere and Git deliberately refuses to guess which remote or name you meant. Once set, bare `push` and `pull` work, ahead/behind counts appear in `git status`, and `@{upstream}` becomes usable. Setting `push.autoSetupRemote true` makes it automatic.",
    related: "tracking-branches",
  },
  {
    id: "fork-workflow",
    category: "remotes",
    question: "How do you contribute to a project you don't have write access to?",
    answer:
      "Fork it on GitHub, which gives you a server-side copy you can push to. Clone your fork — `origin` points there — and add the original as a second remote named `upstream`. Sync your `main` from `upstream/main` before starting, then branch; never commit to your fork's `main`, so it stays a clean mirror. Push the branch to your fork and open a pull request against the upstream repository, following its `CONTRIBUTING.md`.",
    code: {
      snippet: `git clone git@github.com:me/project.git
git remote add upstream https://github.com/original/project.git
git fetch upstream
git switch main && git merge upstream/main
git switch -c fix/handle-empty-input`,
    },
    related: "forks-and-syncing",
  },
  {
    id: "managing-remotes",
    category: "remotes",
    question: "Is origin a special word, and how do you manage remotes?",
    answer:
      "`origin` isn't reserved or magic — it's simply the name `git clone` gives the remote it cloned from, so you don't retype the URL every time. You can rename it, remove it, keep several remotes at once, or choose a different name up front with `git clone -o upstream <url>`. A remote is nothing more than a name mapped to a URL, stored in `.git/config` alongside the refspec that says which branches it fetches.",
    code: {
      snippet: `git remote -v                                    # list remotes and URLs
git remote add upstream https://github.com/original/project.git
git remote rename origin github
git remote set-url origin git@github.com:me/project.git
git remote remove backup
git remote show origin                           # branches, tracking, push config`,
    },
    points: [
      "Fork convention: `origin` is your fork, `upstream` is the project you forked from.",
      "Switching between HTTPS and SSH is just `set-url` — commits and branches are untouched.",
      "A remote URL can also be a local path or an SSH host, not only a hosting platform.",
    ],
    related: "remotes-explained",
  },
  {
    id: "pull-origin-branch",
    category: "remotes",
    question: "What does git pull origin main do, and which branch does it affect?",
    answer:
      "It fetches `main` from the remote `origin` and integrates it into whichever branch you currently have checked out — not necessarily a branch called `main`. That's the part that catches people: standing on `feature` and running `git pull origin main` merges the remote's `main` into `feature`. That's a legitimate way to bring your branch up to date, but it isn't what someone means when they think they're updating their local `main`. It's equivalent to `git fetch origin main` followed by merging what was fetched, and it rebases instead if `pull.rebase` is set.",
    code: {
      snippet: `git switch main
git pull origin main      # updates local main

# On a feature branch, the same command
# merges main INTO feature:
git switch feature
git pull origin main`,
    },
    points: [
      "Naming the remote and branch explicitly works even when no upstream is configured.",
      "With an upstream set, a bare `git pull` does the same thing for the branch you're on.",
      "`pull.ff only` makes it stop rather than silently create a merge commit when the histories have diverged.",
    ],
    related: "push-fetch-pull",
  },

  // ----------------------------------------------------------------------- undo
  {
    id: "reset-vs-revert",
    category: "undo",
    question: "What's the difference between git reset and git revert?",
    answer:
      "`reset` moves the branch pointer to an earlier commit, so later commits are no longer part of the branch — a history rewrite. `revert` creates a new commit containing the inverse of a target commit, leaving all existing history intact. The rule is about who else has the commits: reset is fine for local, unpushed work, but anything already on a shared branch should be undone with revert, because rewriting published history forces everyone else to reconcile a divergence they didn't cause.",
    related: "reset-revert-restore",
  },
  {
    id: "reset-modes",
    category: "undo",
    question: "Explain git reset's three modes.",
    answer:
      "They map exactly onto Git's three trees. `--soft` moves HEAD only, leaving your changes staged — useful for recommitting differently or squashing. `--mixed`, the default, also resets the index, so changes become unstaged edits on disk. `--hard` additionally overwrites the working directory, discarding those edits. Committed work removed by any mode is recoverable through the reflog; uncommitted work destroyed by `--hard` is not.",
    table: {
      columns: ["Mode", "Resets"],
      rows: [
        ["--soft", "HEAD only (changes stay staged)"],
        ["--mixed (default)", "HEAD + index (changes unstaged on disk)"],
        ["--hard", "HEAD + index + working directory (changes gone)"],
      ],
    },
    related: "reset-revert-restore",
  },
  {
    id: "reflog-recovery",
    category: "undo",
    question: "You ran git reset --hard and lost three commits. Can you get them back?",
    answer:
      "Almost certainly. The commits still exist in the object database; only the branch pointer moved. `git reflog` lists every recent position of HEAD, including where the branch was before the reset, so `git reset --hard HEAD@{1}` or the commit hash restores them. The reflog keeps entries for around 90 days. What it cannot recover is uncommitted changes the reset destroyed, because they were never written to the object database.",
    code: {
      snippet: `$ git reflog
3f8b0aa HEAD@{0}: reset: moving to HEAD~3
a91f4c2 HEAD@{1}: commit: Add search filters

$ git reset --hard a91f4c2`,
    },
    related: "reflog-and-recovery",
  },
  {
    id: "amend-commit",
    category: "undo",
    question: "What does git commit --amend do, and when shouldn't you use it?",
    answer:
      "It replaces the most recent commit with a new one built from the current index, reusing the original's parent — so you can fix the message, add a forgotten file, or correct the author. It doesn't edit anything: the result is a new object with a new hash. Don't use it on commits that have been pushed and pulled by others, since their history now contains a commit yours doesn't. On a personal branch under review it's fine with `--force-with-lease`; on main it isn't.",
    related: "amending-commits",
  },
  {
    id: "undo-uncommitted",
    category: "undo",
    question: "How do you undo changes that haven't been committed?",
    answer:
      "It depends which tree they're in. `git restore --staged <file>` unstages while keeping your edits on disk. `git restore <file>` discards the edits themselves. `git clean` removes untracked files, always with `-n` first to see what it would delete. The important point is that discarding uncommitted work is genuinely irreversible — it was never in the object database, so the reflog can't help. When unsure, `git stash -u` gives the same clean state reversibly.",
    related: "undoing-uncommitted-changes",
  },
  {
    id: "committed-to-wrong-branch",
    category: "undo",
    question: "You committed to main by mistake and haven't pushed. How do you move it?",
    answer:
      "Create a branch at the current commit so the work has a home, then move main back. `git switch -c feature/thing` followed by `git switch main` and `git reset --hard origin/main` does it — the commit now lives only on the new branch. Alternatively, cherry-pick the commit onto the correct branch and then reset main. If it has already been pushed to a protected main, revert it instead of resetting.",
    code: {
      snippet: `git switch -c feature/thing   # branch keeps the commit
git switch main
git reset --hard origin/main  # main back to the remote's state`,
    },
    related: "git-troubleshooting",
  },
  {
    id: "leaked-secret",
    category: "undo",
    question: "Someone committed an API key and pushed it. What do you do?",
    answer:
      "Rotate the credential immediately — assume it's compromised the moment it reaches a shared repository, because it's in every clone and possibly in CI logs and scraper databases already. Then stop tracking the file: `git rm --cached .env`, add it to `.gitignore`, commit. Rewriting history with `git filter-repo` and force-pushing is damage limitation rather than a fix, since old objects survive in forks and caches, and it requires everyone to re-clone. Prevent recurrence with secret scanning and push protection.",
    related: "gitignore",
  },

  // --------------------------------------------------------------------- github
  {
    id: "what-is-pr",
    category: "github",
    question: "What is a pull request?",
    answer:
      "A GitHub feature — not a Git one — that proposes merging one branch into another, wrapping the diff in review, discussion, and status checks. It tracks a branch rather than a snapshot, so pushing new commits updates it in place and re-runs CI. Branch protection can require approvals, passing checks, and code owner review before the merge button unlocks, which is what turns it into an actual quality gate rather than a formality.",
    related: "pull-requests",
  },
  {
    id: "pr-merge-strategies",
    category: "github",
    question: "Merge commit, squash, or rebase — which merge button do you use?",
    answer:
      "It's a decision about what main's history should look like. A merge commit keeps every commit from the branch plus a merge commit, giving full fidelity and a busier graph. Squash collapses the branch into one commit on main, which keeps main readable at one entry per pull request while the detailed history stays visible in the PR — the most common default. Rebase-and-merge replays each commit individually with no merge commit, which is only pleasant when the branch's commits were curated.",
    related: "pull-requests",
  },
  {
    id: "pr-size",
    category: "github",
    question: "How large should a pull request be?",
    answer:
      "Small enough to actually be read — realistically a couple of hundred changed lines. Under that, reviewers go line by line; around five hundred they skim; over a thousand they approve without meaningful scrutiny. When a change is genuinely large, split it: a refactor pull request that changes no behaviour, then the feature on top. Mixing formatting with logic is the worst case, because the reviewer can't see which lines actually do anything.",
    related: "pull-requests",
  },
  {
    id: "review-approach",
    category: "github",
    question: "What do you look for when reviewing code?",
    answer:
      "In order: correctness including edge cases and error paths; whether the new behaviour is tested and the test would fail without the change; security implications like missing validation or authorisation; and readability for someone reading it in a year. Style I don't review — a formatter and linter in CI should settle it first. I write comments naming the line, the input that breaks it, and the consequence, prefixed to show whether they block the merge.",
    points: [
      "Review latency matters as much as depth — a stale PR blocks a person and accumulates conflicts.",
      "'Request changes' blocks a merge, so reserve it for things that are actually wrong.",
      "Review quality is capped by PR size, so pushing back on size beats reviewing harder.",
    ],
    related: "code-review",
  },
  {
    id: "actions-ci",
    category: "github",
    question: "How would you set up CI with GitHub Actions?",
    answer:
      "A workflow in `.github/workflows/` triggered on pull requests and pushes to main. The job checks out the code with `actions/checkout`, sets up the runtime with dependency caching, installs from the lockfile with `npm ci` for reproducibility, then runs lint, type checks, and tests. A matrix fans out across platforms or runtime versions where needed. Critically, the checks have to be marked required in branch protection — CI that merely reports failures isn't a gate.",
    code: {
      snippet: `name: CI
on:
  push: { branches: [main] }
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm test -- --run`,
    },
    related: "github-actions",
  },
  {
    id: "actions-security",
    category: "github",
    question: "What are the security considerations with GitHub Actions?",
    answer:
      "Pin third-party actions to a commit SHA rather than a mutable tag, because a compromised action runs with your secrets. Set an explicit least-privilege `permissions` block, since the default `GITHUB_TOKEN` scope is broader than most workflows need. Use environments with required approval for deploys. And avoid `pull_request_target` for anything that checks out and runs fork code — it runs with write permissions and secret access in the base repository's context.",
    related: "github-actions",
  },
  {
    id: "branch-protection",
    category: "github",
    question: "How do you stop unreviewed or broken code reaching main?",
    answer:
      "Branch protection, enforced server-side: require a pull request with at least one approval, dismiss stale approvals when new commits land, require the CI status checks to pass, require code owner review for sensitive paths, require conversation resolution, and block force pushes and deletions. Local hooks are useful for fast feedback but are not enforcement — they live in each clone and `--no-verify` skips them. The detail people miss is marking checks as required; a workflow that merely runs is decoration.",
    related: "protecting-main",
  },
  {
    id: "tags-releases",
    category: "github",
    question: "How do tags and releases work?",
    answer:
      "A tag is a ref pointing at a commit that isn't expected to move — that permanence is what makes a version number trustworthy. Annotated tags (`-a`) are real objects with a tagger, date, and message, and are what `git describe` uses; lightweight tags are bare refs. Tags aren't pushed by a normal `git push`, which catches people out. A GitHub Release wraps a tag with notes and downloadable assets, commonly automated by a workflow triggered on `v*` tags.",
    points: [
      "Never move a published tag — cut a new patch version instead.",
      "`git push origin <tag>` or `--tags`; `push.followTags true` automates it for annotated tags.",
      "`--generate-notes` drafts release notes from the merged pull requests since the last tag.",
    ],
    related: "releases-and-pages",
  },

  // ------------------------------------------------------------------- workflow
  {
    id: "branching-strategy",
    category: "workflow",
    question: "Which branching strategy would you recommend?",
    answer:
      "It depends on the release model more than team size. For a web app deployed continuously, GitHub Flow: main always deployable, short-lived branches, a pull request each with CI and review, merged and deleted within days. For versioned products that need patching after release, something closer to Git Flow with release branches. Trunk-based with feature flags suits high deployment frequency and large teams, given strong test coverage. Whatever the strategy, branch lifetime is what actually determines the pain.",
    table: {
      columns: ["Strategy", "Fits when"],
      rows: [
        ["GitHub Flow", "Continuous deployment, web apps, small-to-medium teams"],
        ["Git Flow", "Versioned releases, QA cycles, supported old versions"],
        ["Trunk-based", "Many deploys a day, strong tests, feature-flag discipline"],
      ],
    },
    related: "branching-strategies",
  },
  {
    id: "long-lived-branches",
    category: "workflow",
    question: "Why are long-lived feature branches a problem?",
    answer:
      "Every day a branch stays away from main, it diverges further: conflicts accumulate non-linearly, the work isn't exercised by CI against current code, and the eventual review is too large to be meaningful. It also hides progress from everyone else, so two people can solve the same problem twice. The fix is to break work into shippable increments — hidden behind a feature flag if it can't be user-visible yet — rather than to get better at merging.",
    related: "branching-strategies",
  },
  {
    id: "atomic-commits",
    category: "workflow",
    question: "Why does commit size matter?",
    answer:
      "Three concrete reasons. Reviewers genuinely read small diffs and rubber-stamp large ones. `git revert` on a focused commit undoes exactly one thing rather than dragging unrelated work with it. And `git bisect` can only narrow a bug down to one commit, so a huge commit leaves you with a huge suspect. The practical technique is `git add -p`, which builds focused commits even when your working directory has become a mixture of ideas.",
    related: "staging-and-committing",
  },
  {
    id: "hooks",
    category: "workflow",
    question: "What are Git hooks, and what are their limits?",
    answer:
      "Scripts Git runs at defined points — `pre-commit`, `commit-msg`, `pre-push` and others — typically managed by a tool like Husky and used to run formatters, linters, or fast tests. They give feedback seconds after a mistake, which is genuinely valuable. But they live in each person's `.git` directory, aren't cloned by default, and `--no-verify` skips them, so anything that must hold has to be a server-side rule such as a required status check.",
    related: "protecting-main",
  },
  {
    id: "monorepo",
    category: "workflow",
    question: "How does Git handle very large repositories or monorepos?",
    answer:
      "It struggles as history and working-tree size grow, because many operations scan the whole tree. The mitigations are partial clone (`--filter=blob:none`) to skip old file contents, sparse checkout to materialise only the directories you work in, shallow clones for CI, Git LFS for large binaries so blobs live outside the object database, and `git maintenance` for background repacking. Submodules and subtrees split repositories instead, at the cost of significant workflow complexity.",
    related: "git-troubleshooting",
  },
  {
    id: "signed-commits",
    category: "workflow",
    question: "Why would a team require signed commits?",
    answer:
      "Because commit author fields are unverified free text — Git will happily record any name and email, so authentication proves you were allowed to push, not who wrote the commit. Signing with GPG or an SSH key attaches a cryptographic signature that GitHub verifies and marks accordingly, and branch protection can require it. That matters for repositories where provenance is part of the security model, such as anything that gets built and shipped to users.",
    related: "ssh-and-authentication",
  },
  {
    id: "traceability",
    category: "workflow",
    question: "How do you keep issues, commits, and pull requests connected?",
    answer:
      "By using the shared reference namespace deliberately: issues get numbers, branch names carry them for humans, and the pull request description contains a closing keyword like `Fixes #482`, which links the two and closes the issue on merge. The payoff runs backwards — someone puzzled by a line runs `git blame`, follows the commit to its pull request, reads the review discussion, and finds the issue explaining why the behaviour was needed.",
    related: "issues-and-tracking",
  },

  // ------------------------------------------------------------ troubleshooting
  {
    id: "find-the-bug-commit",
    category: "troubleshooting",
    question: "A bug appeared somewhere in the last 200 commits. How do you find it?",
    answer:
      "`git bisect`. Mark the current commit bad and a known-good commit (often a release tag) good; Git checks out the midpoint and you answer good or bad each time. Because it's a binary search, 200 commits take about eight tests. If the check can be scripted, `git bisect run ./test.sh` does it unattended. Always finish with `git bisect reset`, since bisect leaves you on a detached HEAD, and use `git bisect skip` for commits that don't build.",
    code: {
      snippet: `git bisect start
git bisect bad
git bisect good v1.4.0
# test, then: git bisect good | bad
git bisect reset`,
    },
    related: "reading-history",
  },
  {
    id: "who-changed-this-line",
    category: "troubleshooting",
    question: "How do you find out why a particular line of code exists?",
    answer:
      "`git blame <file>` gives the commit that last touched each line; take that hash to `git show` for the full message and the rest of the change, and from there to the pull request and issue. After a bulk reformat, plain blame credits everything to whoever ran the formatter, so use `git blame -w -C` to ignore whitespace and follow code moved between files — and repositories can list reformat commits in `.git-blame-ignore-revs` for tools to skip.",
    related: "reading-history",
  },
  {
    id: "find-when-string-added",
    category: "troubleshooting",
    question: "How do you find the commit that introduced a particular string?",
    answer:
      "`git log -S\"searchString\"` — the pickaxe — finds commits where the number of occurrences of that string changed, which is precisely the commits that added or removed it. `git log -G` matches the diff text against a regex instead. `--grep` only searches commit messages, so it's the wrong tool unless someone happened to mention the string when writing them.",
    related: "reading-history",
  },
  {
    id: "detached-head-commits",
    category: "troubleshooting",
    question: "You made commits in detached HEAD state and switched away. Are they lost?",
    answer:
      "Not immediately. They're unreachable — no branch points at them — but they remain in the object database and the reflog records where HEAD was, so `git reflog` gives you the hash and `git switch -c rescue <hash>` brings them back onto a branch. Unreachable objects are pruned by garbage collection eventually (roughly 30 days by default, or immediately with `git gc --prune=now`), so it's worth doing promptly.",
    related: "reflog-and-recovery",
  },
  {
    id: "force-pushed-over",
    category: "troubleshooting",
    question: "A colleague force-pushed over your branch. How do you recover?",
    answer:
      "Check your own clone first — your reflog records where your branch pointed before the last fetch, so `git reflog show <branch>` gives the old tip, and you can branch from it and push it back. If your local copy was already updated and the entry has expired, `git fsck --lost-found` can surface dangling objects, and anyone who fetched before the force push still has them. Prevention is better: `--force-with-lease` and branch protection blocking force pushes on shared branches.",
    related: "reflog-and-recovery",
  },
  {
    id: "unrelated-histories",
    category: "troubleshooting",
    question: "Git says 'refusing to merge unrelated histories'. What does that mean?",
    answer:
      "The two branches share no common ancestor, so Git can't do a three-way merge and stops rather than guessing. It usually happens when a GitHub repository was created with a README and you then push a separate local history. If combining them is genuinely what you want, `git pull --allow-unrelated-histories origin main` proceeds; the safer habit is creating the remote repository empty in the first place.",
    related: "creating-and-pushing-a-repo",
  },
  {
    id: "large-file-committed",
    category: "troubleshooting",
    question: "Someone committed a 500MB file. How do you deal with it?",
    answer:
      "If it hasn't been pushed, `git rm --cached` plus `git commit --amend` removes it from the last commit. Once it's in shared history, the file exists in every clone forever and removing it means rewriting history with `git filter-repo` (or BFG), force-pushing, and having everyone re-clone. Going forward, Git LFS stores large binaries outside the object database with pointers in the repository, and a pre-receive hook or file-size check prevents recurrence.",
    related: "git-troubleshooting",
  },

  // ------------------------------------------------------------------- commands
  {
    id: "cmd-diff-variants",
    category: "commands",
    question: "What's the difference between git diff, git diff --staged, and git diff HEAD?",
    answer:
      "They compare different pairs of Git's three trees. `git diff` compares the working directory to the index — your unstaged changes. `git diff --staged` compares the index to HEAD, which is exactly what your next commit will contain. `git diff HEAD` compares the working directory to HEAD, so it shows staged and unstaged changes together. Running `git diff --staged` immediately before committing is the habit that catches stray debug lines.",
    related: "status-and-diff",
  },
  {
    id: "cmd-stash",
    category: "commands",
    question: "When would you use git stash, and when wouldn't you?",
    answer:
      "For short interruptions: you're mid-change, a hotfix comes in, and you need a clean working directory to switch branches. Stash, deal with it, pop, carry on. Not as storage — stashes are local, invisible to teammates, absent from the branch graph, and easy to lose track of. Anything you'd be upset to lose belongs in a commit on a branch. Two details: untracked files need `-u`, and a conflicting `pop` keeps the entry rather than dropping it.",
    related: "stashing",
  },
  {
    id: "cmd-switch-restore-checkout",
    category: "commands",
    question: "What's the difference between git checkout, git switch, and git restore?",
    answer:
      "`checkout` historically did everything: moving between branches, creating them, and overwriting files in the working tree — and that last job is destructive while sharing a command with harmless navigation, which caused real data loss. Git 2.23 split it into `git switch` for branch operations and `git restore` for file operations. `checkout` still works and appears throughout older documentation, so you need to read it, but new habits should use the split commands.",
    related: "creating-and-switching-branches",
  },
  {
    id: "cmd-clean",
    category: "commands",
    question: "What does git clean do, and what's the safe way to run it?",
    answer:
      "It deletes untracked files, which `git restore` won't touch because Git has never tracked them. Always run `git clean -n` first — a dry run listing exactly what would be removed. `-f` deletes files, `-fd` includes directories, and `-fdx` also removes ignored files, which means your local `.env` and `node_modules`. None of it is recoverable through Git, because those files were never in the object database.",
    related: "undoing-uncommitted-changes",
  },
  {
    id: "cmd-config-settings",
    category: "commands",
    question: "Which Git settings do you configure on a new machine?",
    answer:
      "Identity first, with an `includeIf` block so work directories use the work email automatically. Then the settings that prevent mistakes: `pull.ff only` so a pull on a diverged branch stops rather than silently merging, `fetch.prune` so deleted remote branches don't linger, `push.autoSetupRemote` to remove the 'no upstream' error, and `rerere.enabled` to replay conflict resolutions. `diff.algorithm histogram` gives much better diffs on refactored code.",
    code: {
      snippet: `git config --global pull.ff only
git config --global fetch.prune true
git config --global push.autoSetupRemote true
git config --global rerere.enabled true
git config --global diff.algorithm histogram`,
    },
    related: "git-config-and-aliases",
  },
  {
    id: "cmd-log-graph",
    category: "commands",
    question: "How do you get a useful view of a repository's history?",
    answer:
      "`git log --oneline --graph --decorate --all` — one line per commit, an ASCII graph of the branch structure, branch and tag labels, across every ref. It's the fastest way to understand a repository you've just walked into, and it's long enough that everyone aliases it. Narrow it with `-20`, a path, `--author`, or a range like `main..feature` to see only what's unique to a branch.",
    related: "reading-history",
  },
  {
    id: "delete-branch",
    category: "commands",
    question: "How do you delete a branch, locally and on the remote?",
    answer:
      "`git branch -d <name>` deletes a local branch and refuses if it still holds commits that aren't merged into its upstream or the current branch — that refusal is a safety check, and `-D` overrides it. Deleting the copy on the remote is a separate action: `git push origin --delete <name>`. Neither destroys the commits themselves; they stay in the object database and the reflog can still find them until garbage collection runs.",
    code: {
      snippet: `git branch -d feature/search            # safe — refuses if unmerged
git branch -D feature/search            # force
git push origin --delete feature/search # delete on the remote
git fetch --prune                       # clear stale origin/* refs
git branch --merged main                # what's safe to delete`,
    },
    points: [
      "You can't delete the branch you're standing on — switch away first.",
      "After someone deletes a branch on the remote, your `origin/*` ref lingers until you prune.",
      "`git branch --no-merged main` is the list to check before any bulk cleanup.",
    ],
    related: "branches-explained",
  },
  {
    id: "stash-lifecycle",
    category: "commands",
    question: "What's the difference between git stash pop, apply, drop, and clear?",
    answer:
      "`pop` reapplies the newest entry and removes it from the stack. `apply` reapplies it but keeps the entry, which is what you want when the same changes are needed on two branches or you're not yet sure the reapply worked. `drop` deletes one entry without applying it, and `clear` deletes every entry with no confirmation prompt. One detail worth knowing: if `pop` hits a conflict it keeps the entry rather than dropping it, so a badly resolved conflict can't cost you the work.",
    code: {
      snippet: `git stash list                  # what's stashed
git stash show -p stash@{1}     # full diff of one entry
git stash pop                   # reapply newest, remove entry
git stash apply stash@{2}       # reapply, keep entry
git stash drop stash@{0}        # delete one entry
git stash clear                 # delete all — no undo prompt
git stash branch fix-it         # new branch from a stash`,
    },
    points: [
      "Stash entries are commits under `refs/stash`, so a dropped stash is sometimes recoverable via `git fsck --unreachable`.",
      "Untracked files need `-u`; ignored files need `-a`.",
      "Always pass `-m \"message\"` — default stash messages are identical and tell you nothing a week later.",
    ],
    related: "stashing",
  },
]

/** Plain-text version of an answer, for FAQPage structured data. */
export function toPlainText(text: string): string {
  return text.replace(/`/g, "")
}

/** Concatenated searchable text for a question entry. */
export function searchableText(entry: InterviewQuestionEntry): string {
  return [entry.question, entry.answer, ...(entry.points ?? [])].join(" ").toLowerCase()
}
