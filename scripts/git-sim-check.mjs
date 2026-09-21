// Self-check for the playground's Git simulator: node scripts/git-sim-check.mjs
// No test framework on purpose — this is the one runnable thing that fails if
// the reducer's branching, merging, or reset logic breaks.
import assert from "node:assert/strict"
import { initialState, run } from "../src/lib/git-sim.ts"

let state = initialState()
let last = []

/** Runs a command, asserts it didn't error, and returns the printed text. */
function exec(command) {
  const result = run(state, command)
  state = result.state
  last = result.output
  const errors = last.filter((line) => line.kind === "err")
  assert.equal(errors.length, 0, `unexpected error from "${command}": ${errors.map((e) => e.text).join(" / ")}`)
  return last.map((line) => line.text).join("\n")
}

function expectError(command, contains) {
  const result = run(state, command)
  const errors = result.output.filter((line) => line.kind === "err")
  assert.ok(errors.length > 0, `expected "${command}" to fail`)
  assert.ok(
    errors.some((line) => line.text.includes(contains)),
    `expected "${command}" to mention "${contains}", got: ${errors.map((e) => e.text).join(" / ")}`,
  )
}

// Commands are refused before init.
expectError("git status", "not a git repository")

// Root commit.
exec("git init")
exec("git add .")
const first = exec('git commit -m "Initial commit"')
assert.ok(first.includes("(root-commit)"), "first commit should be labelled root-commit")
assert.equal(state.commits.length, 1)
assert.equal(state.commits[0].parents.length, 0)
assert.deepEqual(state.staged, [])
assert.deepEqual(state.changed, [])

// Staging requires something to stage, and unknown paths are refused.
expectError('git commit -m "nothing"', "nothing to commit")
expectError("git add nope.txt", "did not match any files")

// Branching puts new commits on their own lane.
exec("git switch -c feature")
assert.equal(state.head, "feature")
assert.equal(state.lanes.feature, 1)
exec("touch login.js")
exec("git add .")
exec('git commit -m "Add login"')
assert.equal(state.commits[1].lane, 1)

// Fast-forward: main hasn't moved, so no merge commit is created.
exec("git switch main")
const ff = exec("git merge feature")
assert.ok(ff.includes("Fast-forward"), "expected a fast-forward")
assert.equal(state.commits.length, 2, "fast-forward must not create a commit")
assert.equal(state.refs.main, state.refs.feature)

// Diverge, then a real three-way merge with two parents.
exec("git switch -c sidebar")
exec("touch sidebar.js")
exec("git add .")
exec('git commit -m "Add sidebar"')
exec("git switch main")
exec("touch README.md")
exec("git add .")
exec('git commit -m "Add README"')
const merged = exec("git merge sidebar")
assert.ok(merged.includes("ort"), "expected a three-way merge")
const mergeCommit = state.commits.at(-1)
assert.equal(mergeCommit.parents.length, 2, "merge commit needs two parents")
assert.equal(mergeCommit.lane, 0, "merge commit belongs to the branch being merged into")
assert.equal(state.refs.main, mergeCommit.id)

// Merging something already contained is a no-op.
assert.ok(exec("git merge sidebar").includes("Already up to date."))

// log only shows what's reachable from HEAD.
const log = exec("git log")
assert.ok(log.includes("HEAD -> main"), "log should decorate the current branch")
assert.ok(log.includes("Add sidebar"), "merged work should be reachable")

// reset --hard moves the branch and clears pending changes.
const before = state.commits.at(-1).parents[0]
exec("touch scratch.txt")
exec("git reset --hard HEAD~1")
assert.equal(state.refs.main, before, "reset should move main back one commit")
assert.deepEqual(state.changed, [], "--hard clears the working directory")
expectError("git reset --hard nonsense", "unknown revision")

console.log(`git-sim OK — ${state.commits.length} commits, branches: ${Object.keys(state.lanes).join(", ")}`)
