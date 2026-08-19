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

const sshSetup: TerminalStep[] = [
  {
    command: 'ssh-keygen -t ed25519 -C "ada@example.com"',
    output: [
      "Generating public/private ed25519 key pair.",
      "Enter file in which to save the key (~/.ssh/id_ed25519): ",
      "Enter passphrase (empty for no passphrase): ",
      "Your identification has been saved in ~/.ssh/id_ed25519",
      "Your public key has been saved in ~/.ssh/id_ed25519.pub",
    ],
    note: "Two files: the private key (never leaves your machine, never shared with anyone) and the .pub public key (safe to hand out). Use a passphrase — the agent will remember it.",
  },
  {
    command: "cat ~/.ssh/id_ed25519.pub",
    output: ["ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... ada@example.com"],
    note: "This is the half you paste into GitHub → Settings → SSH and GPG keys → New SSH key. Only ever the .pub file.",
  },
  {
    command: "ssh -T git@github.com",
    output: ["Hi ada! You've successfully authenticated, but GitHub does not provide shell access."],
    note: "That message is success, despite how it reads. GitHub has recognised your key.",
  },
  {
    command: "git remote set-url origin git@github.com:ada/shop.git",
    note: "Switch an existing clone from HTTPS to SSH. Nothing about your commits or branches changes — only how Git connects.",
  },
]

const agent = `# Start the agent and add your key (so the passphrase is asked once)
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# macOS: store the passphrase in the keychain
ssh-add --apple-use-keychain ~/.ssh/id_ed25519

# Windows (PowerShell, as admin once):
Start-Service ssh-agent
Set-Service ssh-agent -StartupType Automatic
ssh-add $env:USERPROFILE\\.ssh\\id_ed25519`

const sshConfig = `# ~/.ssh/config — different keys for different accounts
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519

Host github-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_work

# Then clone with: git clone git@github-work:company/repo.git`

const pat = `# HTTPS: the "password" is a personal access token, not your account password.
# Create one at GitHub → Settings → Developer settings → Personal access tokens.
# Fine-grained tokens let you scope to specific repositories and permissions.

git config --global credential.helper manager   # Windows
git config --global credential.helper osxkeychain  # macOS`

export default function SshAndAuthenticationLesson() {
  return (
    <>
      <p>
        Every push to a private repository has to prove who you are. There are two ways to do it — SSH keys or
        HTTPS with a token — and the one thing that hasn't worked for years is your account password.
      </p>

      <h2>Setting up SSH</h2>
      <TerminalDemo steps={sshSetup} title="Generate a key and connect" prompt="~" />

      <AnalogyCard title="A padlock you hand out, and a key you never do.">
        The public key is a padlock: you can leave copies with GitHub, GitLab, and a server, and none of them can do
        anything with it except lock things to you. The private key opens those padlocks and stays on your machine
        forever. Anyone asking you to paste a private key anywhere is either confused or attacking you.
      </AnalogyCard>

      <Callout variant="warning" title="Only ever share the .pub file">
        <code>id_ed25519.pub</code> is public. <code>id_ed25519</code>, with no extension, is private — it grants
        access to everything the key can reach. Never commit it, never paste it into a chat, and don't copy it
        between machines if you can generate a fresh key instead.
      </Callout>

      <h2>The ssh-agent</h2>
      <p>
        A passphrase-protected key is much safer, and typing that passphrase on every push would be intolerable. The
        agent holds the unlocked key in memory for your session:
      </p>
      <CodeBlock language="bash" filename="ssh-agent" code={agent} />

      <h2>Multiple accounts on one machine</h2>
      <p>
        Personal and work accounts can't share a key, because GitHub ties each key to exactly one account. Give each
        one its own key and a host alias:
      </p>
      <CodeBlock language="bash" filename="~/.ssh/config" code={sshConfig} />
      <p>
        Pair that with a per-repository <code>user.email</code> so the commits are attributed to the right account
        too.
      </p>

      <h2>HTTPS and personal access tokens</h2>
      <CodeBlock language="bash" filename="HTTPS auth" code={pat} />
      <p>
        With HTTPS, Git asks for a username and password, and the "password" must be a personal access token. A
        credential helper stores it after the first success. Prefer <strong>fine-grained tokens</strong> scoped to
        the repositories and permissions you actually need, with an expiry date.
      </p>

      <h2>Which should you use?</h2>
      <ul>
        <li>
          <strong>SSH</strong> — best for your own machines. Set up once, no prompts, no tokens to rotate.
        </li>
        <li>
          <strong>HTTPS + token</strong> — better on locked-down networks that block port 22, and for CI systems,
          where a scoped, expiring token is easier to control than a key.
        </li>
      </ul>

      <DifficultyLevels
        simple={
          <p>
            Generate a key pair, give GitHub the public half, keep the private half. After that, pushing just works
            with no password prompts.
          </p>
        }
        developer={
          <p>
            SSH uses asymmetric cryptography: the server holds your public key and challenges you to prove you hold
            the private one. Ed25519 is the current default — shorter and faster than RSA at equivalent strength.
            The agent caches the decrypted private key in memory; <code>~/.ssh/config</code> maps host aliases to
            specific keys for multi-account setups.
          </p>
        }
        interview={
          <p>
            Worth saying: GitHub disabled password authentication for Git operations in 2021, so HTTPS means a
            personal access token. Keys are per-account, hence host aliases for multiple identities. And SSH
            authentication is not the same as commit signing — <code>user.email</code> is unverified metadata, so a
            repository that needs verified authorship uses GPG or SSH commit signing on top.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="assuming a successful push means verified authorship"
        wrong={`git config user.email "someone.else@company.com"
git commit -m "..."   # attributed to them
git push              # authenticated as you`}
        right={`git config --global commit.gpgsign true
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub`}
        explanation={
          <p>
            Authentication proves you're allowed to push. It says nothing about who the commits claim to be from —
            author fields are free text. Signed commits close that gap, and repositories that care can require
            them.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="Which file do you paste into GitHub's 'New SSH key' box?"
        options={[
          { id: "a", text: "~/.ssh/id_ed25519" },
          { id: "b", text: "~/.ssh/id_ed25519.pub" },
          { id: "c", text: "~/.ssh/config" },
          { id: "d", text: "~/.ssh/known_hosts" },
        ]}
        correctId="b"
        explanation="The .pub file is the public key — it's designed to be shared. The file without the extension is your private key and must never leave your machine."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Set up SSH and prove it works"
        hint={
          <p>
            <code>ssh -T git@github.com</code> tests the connection without touching any repository. The "does not
            provide shell access" reply is success.
          </p>
        }
      >
        Generate an Ed25519 key with a passphrase, add it to GitHub, load it into the agent, and verify with{" "}
        <code>ssh -T</code>. Then convert one existing clone from HTTPS to SSH with <code>git remote set-url</code>{" "}
        and push something small.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="How does SSH authentication with GitHub work, and how does it differ from HTTPS?"
        answer={
          <p>
            You generate an asymmetric key pair and upload the public half to GitHub. On connection, the server
            challenges your client to prove it holds the matching private key; nothing secret crosses the network
            and there's no password to type, because the local agent holds the decrypted key for the session. HTTPS
            instead sends credentials over TLS — and since GitHub removed password authentication for Git in 2021,
            that means a personal access token, ideally fine-grained and expiring, cached by a credential helper.
            SSH is usually nicer for developer machines; HTTPS tends to win on networks that block port 22 and in
            CI, where scoped short-lived tokens are easier to manage than distributed keys. Neither says anything
            about commit authorship — that's what commit signing is for.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "Generate an Ed25519 key pair; upload only the .pub half.",
          "The private key never leaves your machine — use a passphrase and let ssh-agent hold it.",
          "HTTPS uses a personal access token, never your account password.",
          "Multiple accounts need separate keys plus host aliases in ~/.ssh/config.",
          "Authentication proves you may push; commit signing is what proves who wrote the commit.",
        ]}
      />
    </>
  )
}
