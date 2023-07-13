export function findLastMatch(string: string, pattern: RegExp): string | null {
  const regex = new RegExp(pattern, 'g')
  let lastMatch = null
  let match

  while ((match = regex.exec(string)) !== null) {
    lastMatch = match
  }

  return lastMatch ? lastMatch[0] : null
}
