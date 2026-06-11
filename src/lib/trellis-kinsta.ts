import {globby} from 'globby'
import {existsSync, readFileSync} from 'node:fs'
import {basename, dirname, join, resolve} from 'node:path'

export type TrellisKinstaInference = {
  environmentNames: string[]
  siteNames: string[]
  trellisRoot: string
}

export async function inferKinstaFromTrellis(cwd: string = process.cwd()): Promise<null | TrellisKinstaInference> {
  const trellisRoot = findTrellisRoot(cwd)
  if (trellisRoot === null) {
    return null
  }

  const files = await globby([
    `${trellisRoot}/group_vars/*/*.yml`,
    `${trellisRoot}/group_vars/*/*.yaml`,
  ])

  const siteNames = new Set<string>()
  const environmentNames = new Set<string>()

  for (const file of files) {
    const fileName = basename(file)
    if (fileName !== 'wordpress_sites.yml' && fileName !== 'wordpress_sites.yaml') {
      continue
    }

    const content = readFileSync(file, 'utf8')
    collectRegexMatches(content, [
      /^\s+db_name:\s*["']?([^"'#\s]+)/gim,
      /^\s+db_user:\s*["']?([^"'#\s]+)/gim,
      /^\s+web_user:\s*["']?([^"'#\s]+)/gim,
    ], siteNames)
  }

  const groupVarDirs = await globby([`${trellisRoot}/group_vars/*`], {
    onlyDirectories: true,
  })

  for (const dir of groupVarDirs) {
    const envName = basename(dir)
    if (envName !== 'all' && envName !== 'development') {
      environmentNames.add(envName)
    }
  }

  return {
    environmentNames: [...environmentNames].sort((a, b) => a.localeCompare(b)),
    siteNames: [...siteNames].sort((a, b) => a.localeCompare(b)),
    trellisRoot,
  }
}

function findTrellisRoot(cwd: string): null | string {
  let current = resolve(cwd)

  while (true) {
    if (isTrellisRoot(current)) {
      return current
    }

    const siblingTrellis = join(current, 'trellis')
    if (isTrellisRoot(siblingTrellis)) {
      return siblingTrellis
    }

    const parent = dirname(current)
    if (parent === current) {
      return null
    }

    current = parent
  }
}

function isTrellisRoot(directory: string): boolean {
  return existsSync(join(directory, 'group_vars')) && existsSync(join(directory, 'hosts'))
}

function collectRegexMatches(content: string, patterns: RegExp[], target: Set<string>): void {
  for (const pattern of patterns) {
    let match

    while ((match = pattern.exec(content)) !== null) {
      const value = match[1]?.trim()
      if (value !== undefined && value.length > 0) {
        target.add(value)
      }
    }
  }
}
