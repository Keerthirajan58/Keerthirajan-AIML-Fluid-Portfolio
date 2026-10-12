/**
 * The typing schedule for a line split into tokens: the step at which each
 * token's first character is typed. Characters take one step each, and the
 * space after a token takes one step too, so the caret pauses there.
 */
export function typingOffsets(tokens: readonly { text: string }[]) {
  let step = 0;
  return tokens.map(({ text }) => {
    const start = step;
    step += [...text].length + 1;
    return start;
  });
}
