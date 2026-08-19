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

const initSteps: TerminalStep[] = [
  {
    command: "mkdir my-project && cd my-project",
    note: "An ordinary empty folder. Git isn't involved yet.",
  },
  {
    command: "git init",
    output: ["Initialized empty Git repository in ~/my-project/.git/"],
    note: "That one command created the .git folder. The project is now a repository — with no commits in it yet.",
  },
  {
    command: "git status",
    output: ["On branch main", "", "No commits yet", "", "nothing to commit (create/copy files and use \"git add\" to track)"],
    note: "'No commits yet' is worth noticing: a repository exists, but its history is empty. The branch main is promised, not created — it appears with the first commit.",
  },
  {
    command: 'echo "# My Project" > README.md',
    note: "A file on disk. Git can see it, but isn't tracking it yet.",
  },
  {
    command: "git add README.md && git commit -m \"Initial commit\"",
    output: ["[main (root-commit) c04e77d] Initial commit", " 1 file changed, 1 insertion(+)", " create mode 100644 README.md"],
    note: "'root-commit' means this is the first commit in the repository — the only one with no parent. Now main exists and points at it.",
  },
]

const cloneCommands = `# HTTPS — works everywhere, may prompt for credentials
git clone https://github.com/user/project.git

# SSH — no prompts once your key is set up (lesson 22)
git clone git@github.com:user/project.git

# Clone into a differently-named folder
git clone https://github.com/user/project.git my-folder

# Only the last 50 commits — much faster on huge repositories
git clone --depth 50 https://github.com/user/project.git`

const afterClone = `cd project
git log --oneline -3
git remote -v

origin  https://github.com/user/project.git (fetch)
origin  https://github.com/user/project.git (push)`

export default function InitAndCloneLesson() {
  return (
    <>
      <p>
        Every repository you ever work in started one of two ways: it was created from scratch with{" "}
        <code>git init</code>, or it was copied from somewhere else with <code>git clone</code>. That's the entire
        list.
      </p>

      <h2>git init — start from nothing</h2>
      <p>
        Run <code>git init</code> inside a folder and Git creates a <code>.git</code> directory in it. Your files
        aren't touched, nothing is tracked yet, and no commit exists. It's the smallest possible starting point.
      </p>
      <TerminalDemo steps={initSteps} title="Create a repository from scratch" />

      <Callout variant="tip" title="Already have code? init still works">
        <code>git init</code> is perfectly happy in a folder that's full of existing files. It doesn't touch them —
        it just starts watching. Your first commit then captures the project as it stands today.
      </Callout>

      <h2>git clone — start from someone else's</h2>
      <p>
        Cloning downloads a complete repository: every commit, every branch, the full history — not just the latest
        files. It also creates a folder, checks out the default branch, and sets up a remote called{" "}
        <code>origin</code> pointing back at where it came from.
      </p>
      <CodeBlock language="bash" filename="cloning" code={cloneCommands} />
      <CodeBlock language="bash" filename="what you get" code={afterClone} />

      <AnalogyCard title="Clone is not 'download the files'.">
        Downloading a ZIP from GitHub gives you a dead copy: today's files, no history, no way to contribute back.
        Cloning gives you the living project — every past version, every branch, and a connection to the original.
        The ZIP is a photograph of a library; the clone is the library.
      </AnalogyCard>

      <h2>What actually lands on disk</h2>
      <ul>
        <li>
          <code>.git/</code> — the full object database, all branches, all history.
        </li>
        <li>Your working files, checked out at the tip of the default branch.</li>
        <li>
          A remote named <code>origin</code>, wired up so <code>git push</code> and <code>git pull</code> know where
          to go.
        </li>
        <li>
          Remote-tracking branches like <code>origin/main</code>, which record where the remote's branches were the
          last time you talked to it.
        </li>
      </ul>

      <DifficultyLevels
        simple={
          <p>
            <code>git init</code> starts a brand-new project's history. <code>git clone</code> copies an existing
            project, history and all, onto your machine.
          </p>
        }
        developer={
          <p>
            <code>init</code> creates <code>.git</code> with an empty object database and a HEAD pointing at an
            unborn branch. <code>clone</code> is effectively <code>init</code> + <code>remote add origin</code> +{" "}
            <code>fetch</code> + <code>checkout</code>, and it configures remote-tracking refs plus an upstream for
            the checked-out branch. <code>--depth</code> creates a shallow clone with truncated history;{" "}
            <code>--bare</code> creates a repository with no working tree, which is what servers host.
          </p>
        }
        interview={
          <p>
            Useful details: a clone is a full backup of the repository, which is the practical meaning of
            "distributed". Shallow clones (<code>--depth</code>) speed up CI dramatically but break commands that
            need full history, like <code>git log</code> beyond the depth or <code>git describe</code>. Bare
            repositories exist precisely because pushing into a repository with a checked-out working tree would let
            the branch move under someone's feet.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="running git init in the wrong folder"
        wrong={`cd ~
git init          # your entire home
                  # directory is now a repo`}
        right={`cd ~/projects/my-project
git init
git status        # sanity-check what it sees`}
        explanation={
          <p>
            Running <code>git init</code> one level too high — in your home folder, or a folder that already sits
            inside another repository — makes Git try to track everything below it. If it happens, delete the
            stray <code>.git</code> folder from the wrong location and run it again in the right one.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="You clone a repository and immediately lose your internet connection. What can you still do?"
        options={[
          { id: "a", text: "Nothing — the files stream from the server" },
          { id: "b", text: "Only view the current files" },
          { id: "c", text: "Read the entire history, create branches, commit, and diff any two commits" },
          { id: "d", text: "Only the last 50 commits, regardless of clone options" },
        ]}
        correctId="c"
        explanation="A clone contains the complete repository. Everything except talking to the remote works offline — unless you used --depth, which deliberately truncates the history you downloaded."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Compare a clone with a ZIP download"
        hint={
          <p>
            After cloning, run <code>git log --oneline | wc -l</code> to count the commits you received. The
            downloaded ZIP has none.
          </p>
        }
      >
        Pick any small public repository. Download it as a ZIP from GitHub, and clone it as well. Compare the two
        folders: which one has <code>.git</code>, which one can show you last year's version of a file, and which
        one could you contribute a fix from?
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="What does git clone actually do under the hood?"
        answer={
          <p>
            It performs several steps as one command: creates the target directory and runs the equivalent of{" "}
            <code>git init</code>, adds the source URL as a remote named <code>origin</code>, fetches all objects
            and refs from it, creates remote-tracking branches (<code>origin/main</code> and friends), then checks
            out the remote's default branch into a working tree and sets it to track its remote counterpart. The
            important consequence is that you receive the complete object database — a clone is a full,
            self-sufficient repository and a viable backup, which is what makes Git distributed rather than a
            checkout of a central server.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "git init creates a .git folder in an existing directory; no files change and no commit exists yet.",
          "git clone downloads a complete repository — full history, all branches — not just the current files.",
          "Cloning also sets up the origin remote and remote-tracking branches automatically.",
          "A ZIP download has no history and no way to contribute back; a clone has both.",
          "Check where you are before running git init — a stray repository in your home folder is a nuisance.",
        ]}
      />
    </>
  )
}
