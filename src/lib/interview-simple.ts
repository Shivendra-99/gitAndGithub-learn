/**
 * Plain-English versions of every interview answer, keyed by question id.
 *
 * Kept separate from interview-questions.ts purely so the two kinds of writing
 * stay easy to review side by side — the formal answer is what you'd say in the
 * room, this is the version you'd give a friend. Every id in the question bank
 * should appear here; `missingSimpleAnswers` below is used to check that.
 *
 * Backticks render as inline code, same as in the main answers.
 */

export const SIMPLE_ANSWERS: Record<string, string> = {
  // ------------------------------------------------------------ fundamentals
  "git-vs-github":
    "Git is the camera; GitHub is the photo-sharing site. The camera takes and stores the pictures and works fine with no account anywhere. The sharing site is where you upload them so other people can look, comment, and work on an album together. Swap the sharing site and your photos are unaffected.",

  "distributed-vcs":
    "When you copy a project with Git, you get the whole history — every version, every branch — not just today's files. So you can work on a train with no signal, and if the server burns down, everyone's laptop has a complete copy. Older systems kept everything on one machine, so no server meant no work.",

  "what-is-a-commit":
    "A commit is a labelled photo of your whole project at one moment, with your name, the time, and a note saying why. Each photo also remembers which photo came before it, so they form a chain. And the photo can't be edited — change anything and you've made a different photo.",

  "staging-area-purpose":
    "It's the envelope you put pages into before sealing it. You've fixed a bug and also corrected a typo somewhere else; the envelope lets you send just the bug fix now and the typo separately, so each record says one clear thing. You can even put in half of one page.",

  "three-trees":
    "Three places your work sits: the files you're editing, the envelope of things marked ready, and the sealed records. `git add` moves things from the desk into the envelope; `git commit` seals it. Almost every Git command is just moving something between two of these three places.",

  "gitignore-tracked":
    "The ignore list is a doorman who only checks people who haven't been let in before. Once a file is inside, it stays inside no matter what the list says — you have to walk it out yourself with `git rm --cached`. And if it was a password, walking it out doesn't help: everyone already saw it, so change the password.",

  "good-commit-message":
    "The photo already shows what changed. The note is for why. One short line saying what it does, and if the reason isn't obvious, a paragraph explaining it. 'Fix' and 'update' tell a future reader nothing — and that future reader is usually you at 2am wondering whether it's safe to undo.",

  "clone-vs-fork":
    "Cloning is taking a copy home. Forking is the website giving you your own copy on its shelves, under your name, that you're allowed to write in. You can copy anything public, but you can only send changes back to something you own — which is exactly what the fork is for. Fork first, then clone your fork.",

  "clone-under-the-hood":
    "One command doing five things: make a folder, start a repository in it, write down where it came from, download the entire history, and lay out the latest files. The key word is entire — you get every past version, not just today's, which is why your copy works on a train and would survive the server disappearing.",

  "git-vs-svn":
    "The old way kept everything on one server, so you needed it to look at history, and making a branch meant copying folders on that server — slow enough that people avoided it. Git gives everyone the whole history on their own machine, and a branch is a tiny file. Branching became free, and that's what changed how teams actually work.",

  // --------------------------------------------------------------- internals
  "snapshots-vs-diffs":
    "Git keeps whole frames of a film, not a list of edits. But it isn't wasteful: if a file didn't change, the new frame just points at the copy it already has. When you ask 'what changed?', it works out the difference on the spot rather than looking it up.",

  "git-objects":
    "Four kinds of thing. A blob is the contents of a file with no name attached. A tree is a folder listing that says which name goes with which blob — that's where filenames actually live. A commit ties one folder listing to a moment in time with a note. A tag is a permanent label.",

  "content-addressing":
    "Git names everything after a fingerprint of its contents. So two identical files are stored once, damage is obvious because the fingerprint stops matching, and you can't quietly edit old history — because each commit's fingerprint includes the one before it, changing anything old changes everything after it too.",

  "what-is-head":
    "`HEAD` is the 'you are here' arrow. Usually it points at a branch, which points at a commit. 'Detached' means it's pointing straight at a commit with no branch involved — fine for looking around, risky for working, because anything you make there has no name and gets forgotten when you walk away.",

  "branch-implementation":
    "A branch is a small file containing one commit's fingerprint. That's it. Making one writes 41 characters — no copying, no server. That's why Git users branch for a two-line fix without a second thought, while older tools made branching such a chore that teams avoided it.",

  "why-hash-changes":
    "A commit's name comes from its contents, and its contents include which commit came before it. So giving it a different parent, or changing its message, doesn't edit it — it makes a different commit. The old one is still lying around, just no longer part of the chain anyone follows.",

  "head-tilde-vs-caret":
    "On a normal commit they mean the same thing: the one before. The difference only appears at a merge, which has two previous commits instead of one. `^` picks which one — the branch you were on, or the branch you merged in. `~` counts backwards, always down the main line. So `HEAD~2` is 'two back' and `HEAD^2` is 'the other side of that merge'.",

  "bare-repository":
    "A normal repository has two halves: the history, and the actual files you edit. A bare one has only the history — no files lying around. That's what servers use, because if someone pushed into a repository you were working in, your files would suddenly disagree with what Git thinks is checked out.",

  "annotated-vs-lightweight-tags":
    "A lightweight tag is a sticky note with a name on it. An annotated tag is a proper label recording who made it, when, and why, and it can be signed. For releases use the proper one — you'll want to know who cut it. And neither goes to the server unless you push it on purpose.",

  // --------------------------------------------------------------- branching
  "fast-forward-vs-three-way":
    "If nothing happened on the main line while you were away, Git just slides the label forward — nothing to reconcile. If both sides moved, Git compares each side against where they split and combines them, recording that a join happened. Only that second case can produce a conflict.",

  "merge-vs-rebase":
    "Merge keeps a record of both paths, including the fact that they happened side by side. Rebase rewrites your work so it looks like you did it last, on top of everything else — tidier to read, but it genuinely replaces your commits with new ones. Rebase your own stuff; merge to deliver it.",

  "golden-rule-rebase":
    "Don't rewrite anything someone else already has. Rebasing swaps your commits for lookalikes, so if a colleague is holding the originals, you now have two versions of the same work in the world and Git can't tell they're the same. Your own private branch, rewrite as much as you like.",

  "resolve-conflict":
    "Git merged everything it could and stopped where two people changed the same lines. It shows you both versions with markers around them. Open the file, delete the markers, and leave the text saying what it should say. Then `git add` the file — that's how you say 'sorted' — and commit.",

  "why-conflicts-happen":
    "Only when both sides touched the same few lines. Two people working at opposite ends of a huge file merge perfectly. The real fix isn't getting better at conflicts, it's not disappearing for three weeks — short branches and frequent catching-up turn one enormous conflict into a few tiny ones.",

  "interactive-rebase-cleanup":
    "Before anyone reads your work, you can tidy the commits: combine the 'wip' ones into the real ones, fix bad messages, delete dead ends. Git shows you a list, you mark what to do with each line, and it replays them. If it goes wrong, one command puts everything back.",

  "squash-vs-fixup":
    "Both glue a commit into the one above it. `squash` asks you to write a combined message; `fixup` throws the second message in the bin. Use `fixup` for the 'wip' and 'forgot a file' commits — nobody needs to read those.",

  "cherry-pick":
    "Take one specific commit and apply it somewhere else — usually copying an urgent fix onto an older release. It makes a fresh copy rather than moving anything, so the same change now exists in two places. Fine occasionally; a mess if you rely on it instead of merging.",

  // ----------------------------------------------------------------- remotes
  "fetch-vs-pull":
    "Fetch collects the post and leaves it on your desk — nothing has been opened, nothing can go wrong. Pull collects it and immediately files everything into your current work, which is the part that can clash with what you were doing. Fetch first if you want to look before you leap.",

  "origin-main-meaning":
    "It's a photograph of the server, not a window onto it. It shows where the server's branch was the last time you asked — which might have been Monday. Git never checks by itself, so 'you're up to date' really means 'you were up to date when you last looked'.",

  "rejected-push":
    "Someone else pushed while you were working, and accepting yours would wipe theirs out — so Git says no. It's not a permissions problem. Get their work first (`git pull --rebase`), sort out any clashes, then push. Forcing it through is just deleting their commits on purpose.",

  "force-with-lease":
    "Plain `--force` says 'replace whatever's there, I don't care what it is'. `--force-with-lease` says 'replace it, but only if it's still what I last saw'. Since what you actually mean is the second one, use the second one — it catches the colleague who pushed while you weren't looking.",

  "upstream-tracking":
    "The first time you push a new branch, Git doesn't know where to send it, so you tell it once with `-u` and it writes that down. After that, plain `push` and `pull` work, and Git can tell you how far ahead or behind you are. One setting makes it happen automatically.",

  "fork-workflow":
    "You can't write in the library's copy, so you photocopy it. Your copy is `origin`; the library's is `upstream`. You make your change on a branch in your copy, then send the librarian a note asking them to take it. Keep your copy's main untouched, so it stays a clean mirror of theirs.",

  "managing-remotes":
    "`origin` is just the nickname Git gives the place you copied from, so you don't have to type the full web address every time. There's nothing special about the word — rename it, delete it, add five more. A remote is a name and a URL written down in a settings file, and that's the whole story.",

  "pull-origin-branch":
    "It goes and gets that branch from the server and folds it into whatever you're standing on right now — which is the bit that surprises people. If you're on your feature branch and you pull `main`, `main` gets merged into your feature, not into your own copy of `main`. Check where you are before you run it.",

  // -------------------------------------------------------------------- undo
  "reset-vs-revert":
    "Reset tears the page out of the notebook. Revert writes a new page saying 'the entry on page 12 was wrong, here's the correction'. Tearing pages out is fine in your private journal; in a shared logbook everyone else has already read, you write the correction.",

  "reset-modes":
    "Three depths. `--soft` just moves the bookmark back and leaves your work in the envelope. `--mixed` also empties the envelope, so the work is loose on your desk. `--hard` also wipes the desk. Committed work can be found again either way; work that was only on the desk cannot.",

  "reflog-recovery":
    "Almost certainly yes. Git keeps a log of everywhere you've been for about three months, so `git reflog` shows where the branch was before the accident, and you can point it back there. The one thing it can't rescue is work you never committed — that was never written down anywhere.",

  "amend-commit":
    "It swaps your last commit for a corrected one — handy for a typo in the message or a file you forgot. It doesn't edit the old one, it replaces it, which is invisible if nobody's seen it and annoying if they have. So: before pushing, freely; after pushing, only on your own branch and with warning.",

  "undo-uncommitted":
    "Depends what you want. `git restore --staged file` takes it out of the envelope but keeps your edits. `git restore file` throws the edits away — permanently, because they were never recorded. For brand-new files it's `git clean`, always with `-n` first to see what it would delete. When in doubt, stash instead.",

  "committed-to-wrong-branch":
    "Give the commit a home before moving anything: make a branch here, which keeps it, then send the branch you were on back to where it should be. If you've already pushed it to a shared branch, don't rewind — add a commit that undoes it instead.",

  "leaked-secret":
    "Change the password. Right now, before anything else — the moment it was pushed it was in everyone's copy and probably in a few automated scanners too. Then stop tracking the file. Scrubbing it out of history is possible but it's cleanup, not a fix; the key is already out there.",

  // ------------------------------------------------------------------ github
  "what-is-pr":
    "A pull request is a proposal: 'here's my branch, please look at it and put it in'. It shows the changes, gives people somewhere to comment, and runs the tests automatically. It follows the branch, so pushing more commits updates it — you never open a second one.",

  "pr-merge-strategies":
    "Three ways to land it. Keep every commit plus a join marker; squash everything into one tidy commit; or replay each commit in a straight line. Most teams squash, so the main history reads as one entry per change, with the messy detail still visible in the proposal itself.",

  "pr-size":
    "Small enough that someone actually reads it. A couple of hundred lines gets a real review; a thousand gets a thumbs-up and no scrutiny at all. If it's genuinely big, split it — do the tidying-up as one change that alters no behaviour, then the actual feature on top of it.",

  "review-approach":
    "Does it do what it says, including the awkward cases? Is it tested? Could it be abused? Will anyone understand it next year? Formatting isn't worth a human's time — a tool should have settled that. And say which line, what breaks it, and whether your comment blocks the merge or is just an opinion.",

  "actions-ci":
    "A little file telling GitHub 'whenever someone proposes a change, install everything and run the tests'. It runs on their machines, automatically, every time. The bit people forget: you also have to mark that check as required, or a failing test just shows a red mark next to a working merge button.",

  "actions-security":
    "You're running other people's code with access to your secrets, so pin the versions you use rather than trusting whatever a label points at today, and give each job only the permissions it needs. And be very careful with the trigger that runs code from strangers' proposals with your keys available.",

  "branch-protection":
    "Rules the platform enforces: nothing lands without a review, the tests have to pass, and nobody can shove history around. Checks that run on your own machine are helpful but skippable with one flag — if it genuinely must hold, it has to be enforced on the server.",

  "tags-releases":
    "A tag is a bookmark glued in place: 'v1.2.0' means this exact commit, forever. A release wraps that with notes and downloadable files. One catch that bites everyone: a normal push doesn't send tags, you have to push them on purpose. And never move a published tag — cut a new number instead.",

  // ---------------------------------------------------------------- workflow
  "branching-strategy":
    "For a website you deploy all the time: one main line plus short branches, each reviewed and merged within days. For software with versions people keep using, you need extra branches so you can patch an old release. Whichever you pick, the thing that actually matters is not letting branches get old.",

  "long-lived-branches":
    "Every day apart, your copy and everyone else's drift further. Conflicts don't grow steadily, they compound; the tests aren't checking your work against what everyone else is doing; and the eventual review is too big to read. Ship in small pieces, hidden behind a switch if it isn't ready to be seen.",

  "atomic-commits":
    "Small commits get read, big ones get waved through. If one commit does one thing, undoing it undoes exactly that thing. And when you're hunting a bug by checking commits one by one, a huge commit just tells you 'it's somewhere in these two thousand lines'.",

  hooks:
    "Little scripts Git runs at set moments — before a commit, before a push — usually to format code or run quick checks. Great for catching things seconds after you make them. But they live on your machine, they aren't shared automatically, and one flag skips them, so they're a helpful nudge rather than a rule.",

  monorepo:
    "Git slows down when the project gets enormous, because lots of commands look at everything. The tools for it are: download only the files you need, check out only the folders you work in, keep big binaries outside the main store, and let Git tidy itself up in the background.",

  "signed-commits":
    "The name on a commit is just text you typed — Git doesn't check it. Being allowed to push proves you had a key; it doesn't prove you wrote anything. Signing adds a cryptographic stamp that can be verified, which matters where it's important to know who really made a change.",

  traceability:
    "Every task gets a number, and you mention it in the proposal so merging closes it automatically. The value shows up later: someone confused by a line looks up which commit made it, that leads to the proposal, and the proposal leads to the discussion explaining why anyone wanted it.",

  // --------------------------------------------------------- troubleshooting
  "find-the-bug-commit":
    "Play higher-or-lower. Tell Git one version that worked and one that doesn't; it jumps to the middle, you test, you say 'still broken' or 'fine here', and it halves the range each time. Two hundred commits take about eight goes. If you can script the test, it does the whole thing by itself.",

  "who-changed-this-line":
    "`git blame` puts a name and a commit next to every line. The name isn't the point — the commit is, because it leads you to the message explaining why. One catch: after someone reformats the whole file, everything looks like it was written by them, so tell blame to ignore whitespace-only changes.",

  "find-when-string-added":
    "There's a search that looks inside the changes themselves and finds where a particular bit of text first appeared or disappeared. Searching the commit messages only works if somebody happened to mention it, which they usually didn't.",

  "detached-head-commits":
    "Not lost, just unlabelled. Git's log of where you've been still knows the address, so you can go back, put a name on those commits, and carry on. Do it soonish though — unnamed things get cleaned up after a few weeks.",

  "force-pushed-over":
    "Check your own machine first — it remembers where your branch was before the last update, so you can usually put it back and push it again. Anyone else who fetched before the accident has a copy too. Better still, turn on the setting that stops people force-pushing over shared branches at all.",

  "unrelated-histories":
    "The two sets of history have nothing in common — no shared starting point — so Git won't guess how to combine them. It usually happens when the website created a starter file and you then pushed a separate project on top. You can tell it to go ahead anyway if that's genuinely what you want.",

  "large-file-committed":
    "If it hasn't gone anywhere yet, take it out of the last commit and redo it. Once it's shared, it's in everyone's copy forever, and getting rid of it means rewriting the whole history and asking everyone to start fresh. Big files belong in a system built for them, with just a pointer in the project.",

  // ---------------------------------------------------------------- commands
  "cmd-diff-variants":
    "`git diff` shows what's still loose on your desk. `--staged` shows what's in the sealed-and-ready envelope. Adding `HEAD` shows both together. The reason people get confused is that once you've staged something, plain `git diff` goes quiet and it looks like the change vanished.",

  "cmd-stash":
    "Sweep the desk into a drawer so you can deal with something urgent, then tip it back out. Perfect for ten minutes. Terrible for a week — drawers are invisible to everyone else, easy to forget, and easy to lose. Anything you'd be sad to lose should be a proper commit on a branch.",

  "cmd-switch-restore-checkout":
    "`checkout` used to do everything: move you around, and also throw away your edits. Two very different jobs, one command, occasional disasters. So it was split — `switch` for moving between branches, `restore` for files. Old guides still use `checkout`, so you need to recognise it.",

  "cmd-clean":
    "Deletes files Git has never seen — the ones the other undo commands ignore. Always ask it what it would delete first, because there's no getting them back: Git never had a copy. And the version that also removes ignored files will happily take your local settings and downloaded packages with it.",

  "cmd-config-settings":
    "Name and email first, ideally set up so work projects use the work address automatically. Then a few that prevent trouble: stop `pull` from quietly merging, clear out branches deleted on the server, set up new branches automatically, and let Git remember how you solved a conflict last time.",

  "delete-branch":
    "Lowercase `-d` deletes it and refuses if there's work in there nobody else has; uppercase `-D` deletes it anyway. Getting rid of the copy on the server is a separate command. And deleting a branch only removes the label — the commits are still there for a while, so it's less final than it feels.",

  "stash-lifecycle":
    "`pop` takes it out of the drawer and throws the drawer slip away. `apply` takes it out but keeps the slip, in case you want it again. `drop` bins one without looking at it, and `clear` bins the lot without asking. Handy detail: if popping causes a clash, it keeps the slip, so you can't lose the work by fumbling the fix.",

  "cmd-log-graph":
    "One command shows the whole shape of the project: a line per commit, a drawing of how the branches split and joined, and labels for where everything currently points. It's long to type, so everyone gives it a nickname — and then uses it constantly.",
}

/** Ids in the question bank with no plain-English version yet. */
export function missingSimpleAnswers(ids: string[]): string[] {
  return ids.filter((id) => !(id in SIMPLE_ANSWERS))
}
