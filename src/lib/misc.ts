export function findLastMatch(string: string, pattern: RegExp): string | null {
  const regex = new RegExp(pattern, 'g')
  let lastMatch = null
  let match

  while ((match = regex.exec(string)) !== null) {
    lastMatch = match
  }

  return lastMatch ? lastMatch[0] : null
}

/**
 * @url https://byby.dev/js-slugify-string
 *
 * @param string the string to slugify
 * @returns string the slugified string
 */
export function slugify(string: string): string {
  return String(string)
    .normalize('NFKD') // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036F]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/[^\d a-z-]/g, '') // remove non-alphanumeric characters
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-') // remove consecutive hyphens
}
