/** Square marks get the most height, long wordmarks the least. */
export function logoShape({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const ratio = width / height;
  return ratio <= 1.6 ? "mark" : ratio <= 3 ? "compact" : "wordmark";
}

/** Two letters for an issuer without a logo. */
export function monogram(issuer: string) {
  const words = issuer.split(/\s+/).filter(Boolean);
  return words.length > 1
    ? (words[0][0] + words[1][0]).toUpperCase()
    : issuer.slice(0, 2);
}
