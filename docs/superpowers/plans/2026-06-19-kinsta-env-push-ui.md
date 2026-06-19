# Kinsta Env Push Interactive Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `env open`-style interactive site/environment selection to `iroots kinsta env push` while preserving full flag-based automation.

**Architecture:** Extract site/environment matching and prompt logic into a shared Kinsta selector module, then consume it from both `env open` and `env push`. Extend `env push` with friendly name flags and a hybrid resolution path (direct IDs when present, interactive/name-based fallback when not). Keep push option flags unchanged and reuse existing API-layer error handling.

**Tech Stack:** TypeScript, oclif, `@inquirer/prompts`, `@oclif/test`, ESLint, TypeScript build (`tsc -b`)

## Global Constraints

- Keep existing non-interactive automation support for ID flags.
- Add friendly name flags to `env push`: `--site`, `--source_env`, `--target_env`.
- Reuse shared matching/prompt behaviour between `env open` and `env push`.
- Keep push option flags (`push_db`, `push_files`, `push_files_option`, `file_list`, `search_and_replace`) as flag-driven only.
- Do not add new dependencies.
- Run `npm run lint` and `npm run build` before each commit.

---

## File Structure (lock this before coding)

- Create: `src/lib/kinsta-selectors.ts`
  - Shared normalisation, matching, and prompt-backed resolvers for sites/environments.
- Modify: `src/commands/kinsta/env/open.ts`
  - Remove duplicated resolver logic and call shared selectors.
- Modify: `src/commands/kinsta/env/push.ts`
  - Add friendly flags and hybrid resolution flow.
- Create: `tests/lib/kinsta-selectors.test.ts`
  - Unit tests for matching and resolver edge cases.
- Create: `tests/commands/kinsta/env/push-resolution.test.ts`
  - Behaviour tests for push selection flow and validation.
- Modify: `package.json`
  - Replace the current dummy `test` script with a runnable test command.

---

### Task 1: Build shared Kinsta selector module

**Files:**
- Create: `src/lib/kinsta-selectors.ts`
- Modify: `src/lib/kinsta.ts` (export `KinstaEnvironment` type)
- Test: `tests/lib/kinsta-selectors.test.ts`

**Interfaces:**
- Consumes:
  - `KinstaSite` from `src/lib/kinsta.ts`
  - `KinstaEnvironment` from `src/lib/kinsta.ts`
- Produces:
  - `normalizeOptionalFlag(value: string | undefined): string | undefined`
  - `resolveSite(sites: KinstaSite[], candidates: string[], explicitSite?: string): Promise<KinstaSite>`
  - `resolveEnvironment(environments: KinstaEnvironment[], candidates: string[], explicitEnvironment?: string): Promise<KinstaEnvironment>`
  - `findMatchingSites(sites: KinstaSite[], candidate: string): KinstaSite[]`
  - `findMatchingEnvironments(environments: KinstaEnvironment[], candidate: string): KinstaEnvironment[]`

- [ ] **Step 1: Write failing selector tests**

```ts
import {expect} from 'chai'
import {findMatchingEnvironments, findMatchingSites, normalizeOptionalFlag} from '../../src/lib/kinsta-selectors.js'

describe('kinsta-selectors', () => {
  it('normalises optional flags', () => {
    expect(normalizeOptionalFlag('  Staging  ')).to.equal('Staging')
    expect(normalizeOptionalFlag('   ')).to.equal(undefined)
  })

  it('matches sites by id/name/display_name case-insensitively', () => {
    const sites = [
      {id: '1', name: 'alpha', display_name: 'Alpha Site', company_id: 'c1'},
      {id: '2', name: 'beta', display_name: 'Beta Site', company_id: 'c1'},
    ]

    expect(findMatchingSites(sites as any, 'alpha').map(s => s.id)).to.deep.equal(['1'])
    expect(findMatchingSites(sites as any, 'beta site').map(s => s.id)).to.deep.equal(['2'])
  })

  it('prefers environment id, then display_name, then name', () => {
    const envs = [
      {id: 'env-1', name: 'live', display_name: 'Live'},
      {id: 'env-2', name: 'staging', display_name: 'Staging'},
    ]

    expect(findMatchingEnvironments(envs as any, 'env-2').map(e => e.id)).to.deep.equal(['env-2'])
    expect(findMatchingEnvironments(envs as any, 'staging').map(e => e.id)).to.deep.equal(['env-2'])
  })
})
```

- [ ] **Step 2: Run test file and confirm failure**

Run: `npx mocha --loader ts-node/esm tests/lib/kinsta-selectors.test.ts`
Expected: FAIL with module-not-found for `kinsta-selectors`.

- [ ] **Step 3: Implement shared selector module**

```ts
import {select} from '@inquirer/prompts'
import {KinstaEnvironment, KinstaSite} from './kinsta.js'

const normalize = (value: string): string => value.trim().toLowerCase()

export function normalizeOptionalFlag(value: string | undefined): string | undefined {
  const normalized = value?.trim()
  return normalized !== undefined && normalized.length > 0 ? normalized : undefined
}

export function findMatchingSites(sites: KinstaSite[], candidate: string): KinstaSite[] {
  const normalizedCandidate = normalize(candidate)
  return sites.filter(site => (
    normalize(site.id) === normalizedCandidate
    || normalize(site.name) === normalizedCandidate
    || normalize(site.display_name) === normalizedCandidate
  ))
}

export function findMatchingEnvironments(environments: KinstaEnvironment[], candidate: string): KinstaEnvironment[] {
  const normalizedCandidate = normalize(candidate)
  const idMatches = environments.filter(environment => normalize(environment.id) === normalizedCandidate)
  if (idMatches.length > 0) return idMatches
  const displayMatches = environments.filter(environment => normalize(environment.display_name) === normalizedCandidate)
  if (displayMatches.length > 0) return displayMatches
  return environments.filter(environment => normalize(environment.name) === normalizedCandidate)
}
```

- [ ] **Step 4: Re-run selector tests**

Run: `npx mocha --loader ts-node/esm tests/lib/kinsta-selectors.test.ts`
Expected: PASS (all tests green).

- [ ] **Step 5: Run lint + build**

Run: `npm run lint && npm run build`
Expected: no ESLint errors, TypeScript build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/lib/kinsta-selectors.ts src/lib/kinsta.ts tests/lib/kinsta-selectors.test.ts
git commit -m "feat(kinsta): add shared site and environment selectors"
```

---

### Task 2: Refactor `env open` to shared selectors

**Files:**
- Modify: `src/commands/kinsta/env/open.ts`
- Test: `tests/lib/kinsta-selectors.test.ts`

**Interfaces:**
- Consumes:
  - `resolveSite(...)` and `resolveEnvironment(...)` from `src/lib/kinsta-selectors.ts`
- Produces:
  - Same command behaviour as before with duplicated helper logic removed.

- [ ] **Step 1: Add regression test for open-style matching contract**

```ts
it('keeps exact-match + prompt fallback contract used by env open', async () => {
  const sites = [{id: '1', name: 'project', display_name: 'Project', company_id: 'c1'}]
  const resolved = findMatchingSites(sites as any, 'project')
  expect(resolved.map(site => site.id)).to.deep.equal(['1'])
})
```

- [ ] **Step 2: Run test to validate baseline**

Run: `npx mocha --loader ts-node/esm tests/lib/kinsta-selectors.test.ts --grep "open-style matching contract"`
Expected: PASS (after Task 1 work).

- [ ] **Step 3: Refactor open command imports and usage**

```ts
import {
  normalizeOptionalFlag,
  resolveEnvironment,
  resolveSite,
} from '../../../lib/kinsta-selectors.js'

// remove local normalize/compact/find/prompt helper implementations
// keep run() orchestration and openEnvironment() unchanged
```

- [ ] **Step 4: Run lint + build**

Run: `npm run lint && npm run build`
Expected: no ESLint errors, TypeScript build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/commands/kinsta/env/open.ts
git commit -m "refactor(kinsta): reuse shared selectors in env open"
```

---

### Task 3: Add interactive/friendly selection to `env push`

**Files:**
- Modify: `src/commands/kinsta/env/push.ts`
- Test: `tests/commands/kinsta/env/push-resolution.test.ts`

**Interfaces:**
- Consumes:
  - `getAllSites(token, company, include_environments)` from `src/lib/kinsta.ts`
  - `getSiteEnvironments(token, siteId)` from `src/lib/kinsta.ts`
  - `resolveSite(...)` and `resolveEnvironment(...)` from `src/lib/kinsta-selectors.ts`
- Produces:
  - Friendly flags on push command:
    - `site?: string`
    - `source_env?: string`
    - `target_env?: string`
  - `resolvePushTargetIds(input: ResolvePushTargetIdsInput): Promise<{siteId: string; sourceEnvId: string; targetEnvId: string}>`
  - Hybrid resolution path that returns concrete IDs before calling `pushEnvironment`.

- [ ] **Step 1: Write failing push-resolution tests**

```ts
import {expect} from 'chai'
import {resolvePushTargetIds} from '../../../../src/commands/kinsta/env/push.js'

describe('env push resolution', () => {
  it('uses explicit IDs when all are provided', async () => {
    const resolved = await resolvePushTargetIds({
      apiKey: 'api',
      company: 'co',
      site: undefined,
      sourceEnv: undefined,
      targetEnv: undefined,
      siteId: 'site-1',
      sourceEnvId: 'env-a',
      targetEnvId: 'env-b',
      getAllSites: async () => { throw new Error('should not fetch sites in full ID mode') },
      getSiteEnvironments: async () => { throw new Error('should not fetch envs in full ID mode') },
    })

    expect(resolved).to.deep.equal({
      siteId: 'site-1',
      sourceEnvId: 'env-a',
      targetEnvId: 'env-b',
    })
  })

  it('rejects source and target being the same', async () => {
    let message = ''
    try {
      await resolvePushTargetIds({
        apiKey: 'api',
        company: 'co',
        site: undefined,
        sourceEnv: undefined,
        targetEnv: undefined,
        siteId: 'site-1',
        sourceEnvId: 'env-a',
        targetEnvId: 'env-a',
        getAllSites: async () => [],
        getSiteEnvironments: async () => [],
      })
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error)
    }

    expect(message).to.equal('Source and target environments must be different.')
  })
})
```

- [ ] **Step 2: Run test and confirm fail**

Run: `npx mocha --loader ts-node/esm tests/commands/kinsta/env/push-resolution.test.ts`
Expected: FAIL with `resolvePushTargetIds` export not found (before implementation).

- [ ] **Step 3: Implement push resolution logic and new flags**

```ts
static flags = {
  company: Flags.string({env: 'IROOTS_KINSTA_COMPANY_ID', required: true}),
  site: Flags.string({required: false}),
  source_env: Flags.string({required: false}),
  target_env: Flags.string({required: false}),
  site_id: Flags.string({required: false}),
  source_env_id: Flags.string({required: false}),
  target_env_id: Flags.string({required: false}),
  push_db: Flags.boolean({allowNo: true, default: true}),
  push_files: Flags.boolean({allowNo: true, default: true}),
  push_files_option: Flags.string({default: 'ALL_FILES', options: ['ALL_FILES', 'SPECIFIC_FILES']}),
  file_list: Flags.string({multiple: true}),
  search_and_replace: Flags.boolean({allowNo: true, default: true}),
}

export async function resolvePushTargetIds(input: ResolvePushTargetIdsInput): Promise<{siteId: string; sourceEnvId: string; targetEnvId: string}> {
  const hasAllIds = input.siteId && input.sourceEnvId && input.targetEnvId
  if (hasAllIds) {
    if (input.sourceEnvId === input.targetEnvId) throw new Error('Source and target environments must be different.')
    return {siteId: input.siteId, sourceEnvId: input.sourceEnvId, targetEnvId: input.targetEnvId}
  }

  const compact = (values: Array<string | undefined>): string[] => values.filter((value): value is string => Boolean(value))
  const normalizedCompany = input.company.trim()
  if (normalizedCompany.length === 0) throw new Error('Provide --company or set IROOTS_KINSTA_COMPANY_ID.')

  const sites = await input.getAllSites(input.apiKey, normalizedCompany, true)
  const selectedSite = await resolveSite(sites, compact([input.site]), input.site)
  const environments = selectedSite.environments ?? await input.getSiteEnvironments(input.apiKey, selectedSite.id)
  const source = await resolveEnvironment(environments, compact([input.sourceEnv]), input.sourceEnv)
  const target = await resolveEnvironment(environments, compact([input.targetEnv]), input.targetEnv)
  if (source.id === target.id) throw new Error('Source and target environments must be different.')

  return {siteId: selectedSite.id, sourceEnvId: source.id, targetEnvId: target.id}
}

const ids = await resolvePushTargetIds({
  apiKey,
  company,
  site: siteFlag,
  sourceEnv: sourceEnvFlag,
  targetEnv: targetEnvFlag,
  siteId: siteIdFlag,
  sourceEnvId: sourceEnvIdFlag,
  targetEnvId: targetEnvIdFlag,
  getAllSites,
  getSiteEnvironments,
})
```

- [ ] **Step 4: Add additional real assertions**

```ts
it('resolves site and env names through selectors when IDs are missing', async () => {
  const resolved = await resolvePushTargetIds({
    apiKey: 'api',
    company: 'co',
    site: 'Project A',
    sourceEnv: 'Staging',
    targetEnv: 'Live',
    siteId: undefined,
    sourceEnvId: undefined,
    targetEnvId: undefined,
    getAllSites: async () => [{id: 'site-1', name: 'project-a', display_name: 'Project A', company_id: 'co'} as any],
    getSiteEnvironments: async () => [
      {id: 'env-1', name: 'staging', display_name: 'Staging'} as any,
      {id: 'env-2', name: 'live', display_name: 'Live'} as any,
    ],
  })

  expect(resolved).to.deep.equal({
    siteId: 'site-1',
    sourceEnvId: 'env-1',
    targetEnvId: 'env-2',
  })
})
```

- [ ] **Step 5: Run push-resolution tests**

Run: `npx mocha --loader ts-node/esm tests/commands/kinsta/env/push-resolution.test.ts`
Expected: PASS.

- [ ] **Step 6: Run lint + build**

Run: `npm run lint && npm run build`
Expected: no ESLint errors, TypeScript build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/commands/kinsta/env/push.ts tests/commands/kinsta/env/push-resolution.test.ts
git commit -m "feat(kinsta): add interactive site and env selection to push"
```

---

### Task 4: Final integration checks and command docs sync

**Files:**
- Modify: `package.json`
- Modify: `README.md` (only if command help snapshot changes after command metadata update)

**Interfaces:**
- Consumes:
  - Updated command flags and behaviours from Tasks 1-3
- Produces:
  - Stable validation/build/test command set and updated generated CLI docs when applicable.

- [ ] **Step 1: Set runnable test script**

```json
{
  "scripts": {
    "test": "mocha --loader ts-node/esm \"tests/**/*.test.ts\""
  }
}
```

- [ ] **Step 2: Run full project checks**

Run: `npm run test && npm run lint && npm run build`
Expected:
- tests pass
- lint passes
- build passes

- [ ] **Step 3: Refresh README command docs if required**

Run: `npm run version`
Expected: README command section updates only if flag metadata changed output.

- [ ] **Step 4: Commit**

```bash
git add package.json README.md
git commit -m "chore(kinsta): enable tests and refresh command docs"
```

---

## Self-Review Results

1. **Spec coverage:** Covered friendly flags, interactive fallback, shared selector reuse, unchanged push option prompting policy, same-source/target validation, and testing.
2. **Placeholder scan:** Removed ambiguous task statements and provided concrete files, signatures, commands, and snippets.
3. **Type consistency:** `KinstaSite`, `KinstaEnvironment`, selector function names, and push flag names are consistent across tasks.
