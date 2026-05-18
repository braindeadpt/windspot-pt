/**
 * Truncates text at the last word boundary before `max` characters.
 * Appends \u2026 (ellipsis) when truncated.
 */
export function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const truncated = text.slice(0, max);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace === -1) return truncated + '\u2026';
  return truncated.slice(0, lastSpace) + '\u2026';
}
