/* eslint-disable camelcase, perfectionist/sort-imports */
import {expect} from 'chai'
import {
  findMatchingEnvironments,
  findMatchingSites,
  formatSiteChoice,
  normalizeOptionalFlag,
  resolveEnvironment,
  resolveSite
} from '../../src/lib/kinsta-selectors.js'

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

  it('keeps exact-match + prompt fallback contract used by env open', async () => {
    const sites = [{id: '1', name: 'project', display_name: 'Project', company_id: 'c1'}]
    const resolved = findMatchingSites(sites as any, 'project')
    expect(resolved.map(site => site.id)).to.deep.equal(['1'])
  })

  it('returns multiple matches when ambiguous for sites', () => {
    const sites = [
      {id: '1', name: 'project', display_name: 'Project', company_id: 'c1'},
      {id: '2', name: 'project', display_name: 'Project Copy', company_id: 'c1'},
    ]

    expect(findMatchingSites(sites as any, 'project').map(s => s.id)).to.deep.equal(['1', '2'])
  })

  it('returns multiple matches for environments when display_name duplicated', () => {
    const envs = [
      {id: 'env-1', name: 'staging', display_name: 'Staging'},
      {id: 'env-2', name: 'staging', display_name: 'Staging'},
    ]

    expect(findMatchingEnvironments(envs as any, 'staging').map(e => e.id)).to.deep.equal(['env-1', 'env-2'])
  })

  it('prefers environment id, then display_name, then name', () => {
    const envs = [
      {id: 'env-1', name: 'live', display_name: 'Live'},
      {id: 'env-2', name: 'staging', display_name: 'Staging'},
    ]

    expect(findMatchingEnvironments(envs as any, 'env-2').map(e => e.id)).to.deep.equal(['env-2'])
    expect(findMatchingEnvironments(envs as any, 'staging').map(e => e.id)).to.deep.equal(['env-2'])
  })

  it('throws when explicit site name does not match', async () => {
    const sites = [{id: '1', name: 'alpha', display_name: 'Alpha', company_id: 'c1'}]
    let message = ''
    try {
      await resolveSite(sites as any, [], 'nonexistent')
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error)
    }

    expect(message).to.equal('No Kinsta site matched --site "nonexistent"')
  })

  it('throws when explicit environment name does not match', async () => {
    const envs = [{id: 'env-1', name: 'live', display_name: 'Live'}]
    let message = ''
    try {
      await resolveEnvironment(envs as any, [], 'nowhere')
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error)
    }

    expect(message).to.equal('No environment matched --environment "nowhere"')
  })

  it('uses unknown environment summary for site choice when environments are missing', () => {
    const site = {id: '1', name: 'alpha', display_name: 'Alpha', company_id: 'c1', environments: []}
    expect(formatSiteChoice(site as any)).to.equal('Alpha (alpha) [1] envs: unknown')
  })

  it('sorts environment names in site choice summary', () => {
    const site = {
      id: '1',
      name: 'alpha',
      display_name: 'Alpha',
      company_id: 'c1',
      environments: [
        {id: 'env-2', name: 'staging', display_name: 'Staging'},
        {id: 'env-1', name: 'live', display_name: 'Live'},
      ],
    }

    expect(formatSiteChoice(site as any)).to.equal('Alpha (alpha) [1] envs: Live, Staging')
  })

  it('uses configured environment flag name in explicit no-match errors', async () => {
    const envs = [{id: 'env-1', name: 'live', display_name: 'Live'}]
    let message = ''
    try {
      await resolveEnvironment(envs as any, [], 'missing', {flagName: '--source_env'})
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error)
    }

    expect(message).to.equal('No environment matched --source_env "missing"')
  })
})
