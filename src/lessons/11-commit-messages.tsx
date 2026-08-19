import { AnalogyCard } from "@/components/lesson/analogy-card"
import { Callout } from "@/components/lesson/callout"
import { Challenge } from "@/components/lesson/challenge"
import { CodeBlock } from "@/components/lesson/code-block"
import { CommonMistake } from "@/components/lesson/common-mistake"
import { DifficultyLevels } from "@/components/lesson/difficulty-levels"
import { InterviewQuestion } from "@/components/lesson/interview-question"
import { KeyTakeaways } from "@/components/lesson/key-takeaways"
import { Quiz } from "@/components/lesson/quiz"

const anatomy = `Fix session timeout on slow connections

The refresh call used a 2s timeout, which expired on mobile
networks before the token endpoint responded. Users were
logged out mid-form with no explanation.

Raise the timeout to 10s and retry once on network error.
The retry is deliberately not exponential: a second failure
almost always means the token is genuinely invalid.

Fixes #482`

const conventional = `feat: add password strength meter to sign-up
fix: reject expired session tokens on refresh
docs: explain the deploy step in the README
refactor: extract validation into its own module
test: cover the empty-cart edge case
chore: bump eslint to 9.14
perf: memoise the product filter

# A breaking change is marked explicitly
feat!: drop support for Node 18`

const badVsGood = `# Tells you nothing
fix
update
changes
asdf
final fix (really)
address review comments

# Tells you something
Fix crash when cart is empty
Rename User.active to User.isActive
Cache product lookups for 5 minutes
Revert "Cache product lookups" — stale prices in checkout`

export default function CommitMessagesLesson() {
  return (
    <>
      <p>
        A commit message is a note to a stranger — usually you, in eight months, trying to work out why a line of
        code exists. The diff already says <em>what</em> changed. The message exists to say <em>why</em>.
      </p>

      <h2>The shape of a good message</h2>
      <CodeBlock language="bash" filename="a full commit message" code={anatomy} />
      <ul>
        <li>
          <strong>A short subject line</strong> (aim for 50 characters, hard-stop around 72). Capitalised, no full
          stop.
        </li>
        <li>
          <strong>A blank line.</strong> Not optional — Git treats the first paragraph as the subject, and tools
          break without the separator.
        </li>
        <li>
          <strong>A body explaining the why</strong>: what was wrong, what you decided, and what you deliberately
          didn't do.
        </li>
        <li>
          <strong>A trailer</strong> if relevant — <code>Fixes #482</code>, <code>Co-authored-by:</code>, and
          similar.
        </li>
      </ul>

      <Callout variant="tip" title="Write the subject as a command">
        Finish the sentence "If applied, this commit will…". <em>Fix session timeout</em> completes it;{" "}
        <em>Fixed session timeout</em> doesn't. That's the reason for the imperative mood convention — Git's own
        generated messages ("Merge branch…", "Revert…") use it too.
      </Callout>

      <AnalogyCard title="The diff is the crime scene photo. The message is the detective's note.">
        A photograph shows exactly what's there and nothing about why. The note explains what the detective was
        looking for, what they ruled out, and what they concluded. Six months later, the photo is still just a
        photo — the note is what makes it useful.
      </AnalogyCard>

      <h2>Before and after</h2>
      <CodeBlock language="bash" filename="messages" code={badVsGood} />
      <p>
        "Address review comments" is worth singling out. It's meaningful for about a day, and then it's noise —
        nobody reading history a year later has the review open. Say what the change <em>was</em>.
      </p>

      <h2>Conventional Commits</h2>
      <p>
        Many teams adopt a machine-readable prefix format. The value isn't tidiness — it's that tooling can generate
        changelogs and decide version bumps automatically from the history.
      </p>
      <CodeBlock language="bash" filename="conventional commits" code={conventional} />
      <p>
        Under semantic-release and similar tools, <code>fix:</code> triggers a patch release, <code>feat:</code> a
        minor one, and <code>!</code> or a <code>BREAKING CHANGE:</code> footer a major one. If your project doesn't
        automate releases, this is a team preference rather than a requirement — but be consistent either way.
      </p>

      <DifficultyLevels
        simple={
          <p>
            Write one short line saying what the change does, and if it isn't obvious, a paragraph saying why you
            did it.
          </p>
        }
        developer={
          <p>
            Subject under ~50 characters, imperative mood, blank second line, wrapped body explaining rationale and
            trade-offs, trailers for issue references and co-authors. Consistency matters more than the specific
            convention, because history is read with tools (<code>--oneline</code>, <code>--grep</code>, changelog
            generators) that assume a shape.
          </p>
        }
        interview={
          <p>
            The strong answer connects messages to operations: good subjects make <code>git log --oneline</code>{" "}
            scannable, good bodies make a <code>git revert</code> decision safe months later, and consistent
            prefixes let CI derive changelogs and semantic versions. It's also worth noting that message quality is
            a function of commit size — a commit doing one thing is easy to describe, and one doing five things
            can't be.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="describing the diff instead of the reason"
        wrong={`Change timeout from 2000 to 10000`}
        right={`Fix session timeout on slow connections

2s expired on mobile networks before the
token endpoint responded, logging users
out mid-form.`}
        explanation={
          <p>
            The first message repeats what the diff already shows and answers no question a reader will actually
            have. The second explains the symptom, the cause, and the decision — which is what someone needs when
            they're wondering whether it's safe to change that number again.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="Which subject line follows the standard Git convention?"
        options={[
          { id: "a", text: "Fixed the bug where users got logged out." },
          { id: "b", text: "fixing logout bug" },
          { id: "c", text: "Fix logout on expired refresh token" },
          { id: "d", text: "LOGOUT BUG!!!" },
        ]}
        correctId="c"
        explanation="Imperative mood ('Fix', completing 'If applied, this commit will…'), capitalised, specific, no trailing full stop, and comfortably under 50 characters."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Rewrite your worst three messages"
        hint={
          <p>
            <code>git log --oneline -20</code> to find them. You can practise rewording without changing anything
            for real — just write the replacements in a scratch file.
          </p>
        }
      >
        Look at your last twenty commit messages in any project. Find the three that would mean nothing to a
        colleague, and rewrite them properly: imperative subject, and a body explaining why where the reason isn't
        obvious from the change itself.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="What makes a good commit message, and does it actually matter?"
        answer={
          <p>
            Structure: a short imperative subject (~50 characters), a blank line, then a body explaining why the
            change was made, what alternatives were rejected, and any consequences — plus trailers linking issues.
            It matters because history is an operational tool, not documentation theatre. When production breaks at
            2am, <code>git log --oneline</code> is what you scan to find the suspicious change, and the body is what
            tells you whether reverting it is safe. It also shifts knowledge out of individual heads: the reason
            behind an odd-looking line survives the person who wrote it leaving. The related discipline is commit
            size — a commit that does one thing can be described in one line, and one that does five things can't be
            described at all.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "The diff says what changed; the message exists to say why.",
          "Imperative subject under ~50 characters, blank line, then a body when the reason isn't obvious.",
          "Avoid 'fix', 'update', and 'address review comments' — they're meaningless a week later.",
          "Conventional Commits (feat:, fix:, BREAKING CHANGE) let tools generate changelogs and versions.",
          "Message quality follows commit size: one logical change per commit is what makes a good message possible.",
        ]}
      />
    </>
  )
}
