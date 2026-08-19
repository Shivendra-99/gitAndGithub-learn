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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const installWindows = `# Option 1: winget (built into Windows 10/11)
winget install --id Git.Git -e

# Option 2: download the installer
# https://git-scm.com/download/win

git --version
# git version 2.51.0.windows.1`

const installMac = `# Xcode command line tools include Git
xcode-select --install

# or, for the latest version, with Homebrew
brew install git

git --version
# git version 2.51.0`

const installLinux = `# Debian / Ubuntu
sudo apt update && sudo apt install git

# Fedora
sudo dnf install git

git --version
# git version 2.51.0`

const identity = `git config --global user.name "Ada Lovelace"
git config --global user.email "ada@example.com"`

const essentials = `# The default branch name for new repositories
git config --global init.defaultBranch main

# Which editor Git opens for commit messages
git config --global core.editor "code --wait"

# Refuse to guess: only fast-forward or fail on pull
git config --global pull.ff only

# Nicer, more readable diffs
git config --global diff.algorithm histogram

# Remember credentials (Windows)
git config --global credential.helper manager`

const lineEndings = `# Windows
git config --global core.autocrlf true

# macOS / Linux
git config --global core.autocrlf input`

const configSteps: TerminalStep[] = [
  {
    command: "git --version",
    output: ["git version 2.51.0"],
    note: "If this prints a version, Git is installed and on your PATH. If it says 'command not found', the install didn't finish or you need to reopen the terminal.",
  },
  {
    command: 'git config --global user.name "Ada Lovelace"',
    note: "Sets the name that gets stamped on every commit you make from now on, in every repository on this machine.",
  },
  {
    command: 'git config --global user.email "ada@example.com"',
    note: "Same for the email. GitHub links commits to your account by this address, so use the one your account knows about.",
  },
  {
    command: "git config --list --show-origin",
    output: [
      "file:C:/Users/ada/.gitconfig   user.name=Ada Lovelace",
      "file:C:/Users/ada/.gitconfig   user.email=ada@example.com",
      "file:C:/Users/ada/.gitconfig   init.defaultbranch=main",
    ],
    note: "Every setting, and the exact file it came from. This is the command to run when a setting isn't behaving — it tells you which file is winning.",
  },
]

export default function InstallingAndConfiguringGitLesson() {
  return (
    <>
      <p>
        Installing Git takes two minutes. Configuring it properly takes five more, and those five minutes prevent a
        surprising number of the problems people hit in their first year.
      </p>

      <h2>Install</h2>
      <div className="not-prose">
        <Tabs defaultValue="windows">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="windows">Windows</TabsTrigger>
            <TabsTrigger value="mac">macOS</TabsTrigger>
            <TabsTrigger value="linux">Linux</TabsTrigger>
          </TabsList>
          <TabsContent value="windows" className="mt-3">
            <CodeBlock language="bash" filename="PowerShell" code={installWindows} />
          </TabsContent>
          <TabsContent value="mac" className="mt-3">
            <CodeBlock language="bash" filename="Terminal" code={installMac} />
          </TabsContent>
          <TabsContent value="linux" className="mt-3">
            <CodeBlock language="bash" filename="Terminal" code={installLinux} />
          </TabsContent>
        </Tabs>
      </div>
      <p>
        The Windows installer also gives you <strong>Git Bash</strong>, a Unix-style shell. Every command in this
        course works in Git Bash, PowerShell, and any macOS or Linux terminal.
      </p>

      <h2>Tell Git who you are</h2>
      <p>
        Every commit is stamped with a name and email. Git refuses to commit until you've set them, and it doesn't
        verify them — they're metadata, not authentication.
      </p>
      <CodeBlock language="bash" filename="one-time setup" code={identity} />
      <TerminalDemo steps={configSteps} title="Walk through first-time setup" prompt="~" />

      <AnalogyCard title="Config is a stack of three noticeboards.">
        System-wide notices apply to everyone on the machine, your personal board overrides those, and a note pinned
        to a specific project's door overrides both. Git reads all three and the most specific one wins — which is
        why a per-repository email quietly beats your global one.
      </AnalogyCard>

      <h2>The three config levels</h2>
      <ul>
        <li>
          <code>--system</code> — every user on the machine. Rarely touched.
        </li>
        <li>
          <code>--global</code> — you, in every repository. This is where 95% of your settings belong.
        </li>
        <li>
          <code>--local</code> — one repository only (stored in <code>.git/config</code>). The default when you omit
          the flag.
        </li>
      </ul>
      <p>
        Local beats global beats system. Use a local <code>user.email</code> when a client's repository needs your
        work address while everything else uses your personal one.
      </p>

      <h2>Settings worth having on day one</h2>
      <CodeBlock language="bash" filename="~/.gitconfig essentials" code={essentials} />
      <p>
        <code>pull.ff only</code> is the quiet hero of that list: it makes <code>git pull</code> refuse to create a
        surprise merge commit when your branch has diverged, and instead stop and let you decide. Lesson 20 goes
        into why that matters.
      </p>

      <Callout variant="info" title="Line endings, the classic cross-platform trap">
        Windows ends lines with <code>CRLF</code>, macOS and Linux with <code>LF</code>. Without configuration, a
        Windows user and a Mac user can produce diffs where every single line looks changed.
      </Callout>
      <CodeBlock language="bash" filename="line endings" code={lineEndings} />
      <p>
        Better still, commit a <code>.gitattributes</code> file with <code>* text=auto</code> so the rule travels
        with the repository instead of depending on each person's setup.
      </p>

      <DifficultyLevels
        simple={
          <p>
            Install Git, then tell it your name and email so it can sign your work. A few extra settings make it
            behave more sensibly.
          </p>
        }
        developer={
          <p>
            Config is layered: system, global (<code>~/.gitconfig</code>), and local (
            <code>.git/config</code>), with the most specific winning. Setting <code>init.defaultBranch</code>,{" "}
            <code>pull.ff only</code>, <code>core.editor</code>, and line-ending handling up front avoids the most
            common first-year friction.
          </p>
        }
        interview={
          <p>
            Worth knowing: <code>user.email</code> is unverified metadata — Git will happily commit as anyone, which
            is exactly why signed commits (GPG or SSH signing, <code>commit.gpgsign</code>) exist for repositories
            where authorship matters. Also worth knowing that <code>core.autocrlf</code> is a per-machine setting
            while <code>.gitattributes</code> is committed, so the latter is the reliable way to enforce line
            endings across a team.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="committing with the wrong identity for months"
        wrong={`git config user.email "old@job.com"
# ...400 commits later, none of them
# linked to your GitHub account`}
        right={`git config --global user.email "you@example.com"
git config --global --list | grep email`}
        explanation={
          <p>
            GitHub attributes commits to accounts by the email in the commit. If it doesn't match a verified address
            on your account, your contributions won't appear on your profile — and fixing it retroactively means
            rewriting history. Check it before your first real commit, not after.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="You set user.email globally, then set a different one inside one repository. Which is used for commits in that repository?"
        options={[
          { id: "a", text: "The global one — global always wins" },
          { id: "b", text: "The local one — the most specific level wins" },
          { id: "c", text: "Both, and Git asks each time" },
          { id: "d", text: "Neither; Git refuses to commit" },
        ]}
        correctId="b"
        explanation="Config is layered system → global → local, and the most specific setting wins. Run `git config --list --show-origin` when you're not sure which file a value is coming from."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Audit your own config"
        hint={
          <p>
            Run <code>git config --list --show-origin</code> and read the file paths on the left — they tell you
            which level each setting came from.
          </p>
        }
      >
        Print your full configuration and check three things: that <code>user.email</code> is an address your GitHub
        account knows about, that <code>init.defaultBranch</code> is <code>main</code>, and that{" "}
        <code>core.editor</code> is an editor you can actually exit.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="How does Git decide which configuration value to use?"
        answer={
          <p>
            Git reads configuration from several files in order — system (
            <code>/etc/gitconfig</code>), global (<code>~/.gitconfig</code> or{" "}
            <code>~/.config/git/config</code>), and local (<code>.git/config</code>) — with later, more specific
            files overriding earlier ones. There's also a worktree level and per-command overrides via{" "}
            <code>-c key=value</code>, which win over everything. In practice the debugging tool is{" "}
            <code>git config --list --show-origin</code>, which prints every effective setting alongside the file it
            came from, so you can see exactly which layer is responsible for a surprising value.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "Verify the install with git --version before anything else.",
          "user.name and user.email are stamped on every commit — set them globally before your first commit.",
          "Config layers: system → global → local, most specific wins.",
          "Set init.defaultBranch=main, a real core.editor, and pull.ff only on day one.",
          "Line endings need core.autocrlf per machine, or a committed .gitattributes for the whole team.",
        ]}
      />
    </>
  )
}
