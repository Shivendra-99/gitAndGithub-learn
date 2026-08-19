import { AnalogyCard } from "@/components/lesson/analogy-card"
import { Callout } from "@/components/lesson/callout"
import { Challenge } from "@/components/lesson/challenge"
import { CodeBlock } from "@/components/lesson/code-block"
import { CommonMistake } from "@/components/lesson/common-mistake"
import { DifficultyLevels } from "@/components/lesson/difficulty-levels"
import { InterviewQuestion } from "@/components/lesson/interview-question"
import { KeyTakeaways } from "@/components/lesson/key-takeaways"
import { Quiz } from "@/components/lesson/quiz"

const comments = `# Vague — the author has to guess
"This is confusing."
"Why did you do it this way?"
"Wrong."

# Specific and actionable
"This throws if items is empty — line 24 indexes [0] without
 a length check. Worth a guard, or is empty impossible here?"

"nit: could be a single map(). Non-blocking, take it or leave it."

"question: does this run before or after the auth middleware?
 If after, the null check on line 12 is unreachable."

"praise: extracting this into useSearch makes the component
 much easier to follow — thanks."`

const prefixes = `blocking:  must change before merge
question:  I don't understand; explain or correct me
nit:       minor, take it or leave it
suggestion: optional improvement
praise:    genuinely good, worth saying`

const checklist = `Correctness   Does it do what the description claims? Edge cases?
               Error paths? Off-by-one? Empty and null inputs?
Tests          Is the new behaviour covered? Would the test fail
               without the change?
Security       Input validation, authz checks, secrets, injection,
               unsafe deserialisation.
Performance    Obvious N+1s, unbounded loops, missing indexes —
               only where it plausibly matters.
Readability    Will someone understand this in a year without
               the author present?
Fit            Does it match how this codebase already does things?`

export default function CodeReviewLesson() {
  return (
    <>
      <p>
        Code review is the highest-leverage habit in software teams and the easiest to do badly. Two skills: writing
        comments people act on, and receiving comments without treating them as an attack.
      </p>

      <h2>What to look for, in priority order</h2>
      <CodeBlock language="bash" filename="review checklist" code={checklist} />
      <p>
        Correctness and security first, style last — and ideally style not at all, because a formatter and a linter
        should have settled it before a human read a line. Every minute spent arguing about spacing is a minute not
        spent on the null pointer.
      </p>

      <AnalogyCard title="Review the map, not the handwriting.">
        Someone hands you directions to a place you both need to reach. The useful feedback is "this turning is
        one-way" — not "your letter E is untidy". Both are true observations; only one prevents anyone getting
        lost.
      </AnalogyCard>

      <h2>Writing comments that get acted on</h2>
      <CodeBlock language="markdown" filename="comment style" code={comments} />
      <ul>
        <li>
          <strong>Be specific.</strong> Name the line, the input, and the consequence. "This breaks when X" beats
          "this looks wrong".
        </li>
        <li>
          <strong>Say what you'd do instead.</strong> A criticism with no alternative is a puzzle, not feedback.
        </li>
        <li>
          <strong>Talk about the code, not the person.</strong> "This function does three things" rather than "you
          always overcomplicate".
        </li>
        <li>
          <strong>Ask when you're unsure.</strong> Half the time the author has a reason, and you've learned
          something.
        </li>
      </ul>

      <Callout variant="tip" title="Label the weight of each comment">
        Prefixing comments removes the guesswork about what blocks a merge and what's an aside. It's a two-second
        habit that prevents authors treating a stylistic preference as a mandatory change.
      </Callout>
      <CodeBlock language="bash" filename="conventional comment prefixes" code={prefixes} />

      <h2>Receiving a review</h2>
      <ul>
        <li>
          <strong>Assume good intent.</strong> Text has no tone; most terse comments are terse because the reviewer
          is busy, not annoyed.
        </li>
        <li>
          <strong>Respond to every thread.</strong> "Done", "good catch", or a reasoned disagreement — silence
          reads as ignoring.
        </li>
        <li>
          <strong>It's fine to disagree.</strong> Explain why. If it stays unresolved after a round trip, take it to
          a call rather than a seventh comment.
        </li>
        <li>
          <strong>Separate the code from yourself.</strong> Nobody is reviewing you; they're reviewing a diff you
          wrote today and will barely remember next month.
        </li>
      </ul>

      <h2>Reviewing promptly matters more than reviewing thoroughly</h2>
      <p>
        A review that arrives in an hour keeps someone working; one that arrives in three days blocks them, invites
        conflicts as <code>main</code> moves, and means they've forgotten the context by the time it lands. If a PR
        is too big to review now, say so immediately rather than leaving it in silence.
      </p>

      <DifficultyLevels
        simple={
          <p>
            Look for real problems — bugs, missing tests, security issues — and say clearly what's wrong and what
            you'd do instead. Let tools handle formatting.
          </p>
        }
        developer={
          <p>
            Prioritise correctness, tests, and security over style; automate style entirely with formatters and
            linters in CI. Use GitHub's review states deliberately: comment for non-blocking notes, approve when you
            genuinely would ship it, request changes only for things that must change. Prefix comments to signal
            weight.
          </p>
        }
        interview={
          <p>
            The answers that stand out mention review <em>latency</em> as a first-class concern, the practice of
            labelling comments as blocking or not, and the point that review quality is bounded by PR size — so the
            most effective review improvement is usually asking for smaller pull requests, not looking harder.
          </p>
        }
      />

      <h2>Common mistake</h2>
      <CommonMistake
        title="requesting changes over personal preference"
        wrong={`"Request changes:
 use a for loop here instead of map"`}
        right={`"nit: I'd probably use a for loop here,
 but this is fine — not blocking."`}
        explanation={
          <p>
            "Request changes" blocks a merge and, on protected branches, requires another round trip. Reserve it for
            things that are actually wrong. Preferences belong in a comment marked as such, or in a team style
            decision made once rather than re-argued per PR.
          </p>
        }
      />

      <h2>Quick quiz</h2>
      <Quiz
        question="Which comment is most likely to lead to a fix?"
        options={[
          { id: "a", text: '"This is fragile."' },
          { id: "b", text: '"blocking: line 24 indexes items[0] with no length check — throws on an empty cart. A guard, or is empty impossible here?"' },
          { id: "c", text: '"Why not use a different approach?"' },
          { id: "d", text: '"Needs work."' },
        ]}
        correctId="b"
        explanation="It names the line, the input that breaks it, the consequence, and a possible fix — and it flags its own weight. The author can act on it immediately or answer the question."
      />

      <h2>Mini challenge</h2>
      <Challenge
        title="Rewrite three comments"
        hint={
          <p>
            For each: which line, what input breaks it, what happens, and is it blocking?
          </p>
        }
      >
        Find three review comments you've written or received that were vague. Rewrite each to name the specific
        line, the failing case, and the suggested change, with a prefix indicating whether it blocks the merge.
      </Challenge>

      <h2>Interview question</h2>
      <InterviewQuestion
        question="What do you look for when reviewing code?"
        answer={
          <p>
            In order: does it do what the description says, including edge cases and error paths; is the new
            behaviour tested, and would the test actually fail without the change; are there security implications
            like missing validation or authorisation; and is it readable enough that someone will understand it in a
            year. Style I don't review at all — a formatter and linter in CI should settle that before a human
            looks. I write comments that name the line, the input that breaks it, and the consequence, and I prefix
            them so it's obvious what blocks a merge and what's an aside. Two things I've learned matter more than
            reviewing harder: reviewing <em>quickly</em>, because a stale PR blocks a person and accumulates
            conflicts, and pushing back on size, since a 1,000-line diff gets approved rather than read.
          </p>
        }
      />

      <KeyTakeaways
        items={[
          "Correctness, tests, and security first; let tools handle formatting entirely.",
          "Name the line, the failing input, and the consequence — vague comments don't get acted on.",
          "Prefix comments (blocking / nit / question / praise) so weight is obvious.",
          "Respond to every thread; disagreement with reasoning is fine, silence isn't.",
          "Review speed matters as much as depth, and review quality is capped by PR size.",
        ]}
      />
    </>
  )
}
