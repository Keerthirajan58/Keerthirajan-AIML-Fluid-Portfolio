import { Fragment, type CSSProperties } from "react";
import { heroSentence, heroTokens } from "@/content/heroTokens";
import { typingOffsets } from "@/lib/typing";

// Where each token's first character falls in the typing sequence.
const typedAt = typingOffsets(heroTokens);

/**
 * The hero line types itself out character by character with a caret (CSS
 * only, so it runs before hydration and is static under reduced motion).
 * Hover a token for its next-token alternatives. Screen readers get the
 * plain sentence.
 */
export function HeroLine() {
  return (
    <p className="hero-description token-stream">
      <span className="sr-only">{heroSentence}</span>
      {heroTokens.map((t, i) => (
        <Fragment key={t.text + i}>
          <span className="tok" aria-hidden="true">
            <span className="tok-word">
              {[...t.text].map((ch, k) => (
                <span
                  className="tok-char"
                  style={{ "--c": typedAt[i] + k } as CSSProperties}
                  key={k}
                >
                  {ch}
                </span>
              ))}
            </span>
            <span className="tok-probs">
              <span className="tok-probs-title">Next-token candidates</span>
              {t.alts.map(([word, p], j) => (
                <span
                  className="tok-row"
                  data-pick={j === 0 || undefined}
                  key={word}
                >
                  <span>{word}</span>
                  <span>{p.toFixed(2)}</span>
                  <span className="tok-bar">
                    <i style={{ width: `${p * 100}%` }} />
                  </span>
                </span>
              ))}
              <span className="tok-probs-note">Illustrative</span>
            </span>
          </span>{" "}
        </Fragment>
      ))}
    </p>
  );
}
