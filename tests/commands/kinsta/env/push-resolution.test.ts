/* eslint-disable camelcase */
import {expect} from 'chai'

import {resolvePushTargetIds} from '../../../../src/commands/kinsta/env/push.js'

describe('env push resolution', () => {
  it('uses explicit IDs when all are provided', async () => {
    const resolved = await resolvePushTargetIds({
      apiKey: 'api',
      company: '',
      async getAllSites() {
        throw new Error('should not fetch sites in full ID mode')
      },
      async getSiteEnvironments() {
        throw new Error('should not fetch envs in full ID mode')
      },
      site: undefined,
      siteId: 'site-1',
      sourceEnv: undefined,
      sourceEnvId: 'env-a',
      targetEnv: undefined,
      targetEnvId: 'env-b',
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
        async getAllSites() {
          return []
        },
        async getSiteEnvironments() {
          return []
        },
        site: undefined,
        siteId: 'site-1',
        sourceEnv: undefined,
        sourceEnvId: 'env-a',
        targetEnv: undefined,
        targetEnvId: 'env-a',
      })
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error)
    }

    expect(message).to.equal('Source and target environments must be different.')
  })

  it('rejects source and target IDs that differ only by case', async () => {
    let message = ''

    try {
      await resolvePushTargetIds({
        apiKey: 'api',
        company: 'co',
        async getAllSites() {
          return []
        },
        async getSiteEnvironments() {
          return []
        },
        site: undefined,
        siteId: 'site-1',
        sourceEnv: undefined,
        sourceEnvId: 'env-a',
        targetEnv: undefined,
        targetEnvId: 'ENV-A',
      })
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error)
    }

    expect(message).to.equal('Source and target environments must be different.')
  })

  it('resolves site and env names through selectors when IDs are missing', async () => {
    const resolved = await resolvePushTargetIds({
      apiKey: 'api',
      company: 'co',
      async getAllSites() {
        return [{
          company_id: 'co',
          display_name: 'Project A',
          id: 'site-1',
          name: 'project-a',
        }] as any
      },
      async getSiteEnvironments() {
        return [
          {display_name: 'Staging', id: 'env-1', name: 'staging'},
          {display_name: 'Live', id: 'env-2', name: 'live'},
        ] as any
      },
      site: 'Project A',
      siteId: undefined,
      sourceEnv: 'Staging',
      sourceEnvId: undefined,
      targetEnv: 'Live',
      targetEnvId: undefined,
    })

    expect(resolved).to.deep.equal({
      siteId: 'site-1',
      sourceEnvId: 'env-1',
      targetEnvId: 'env-2',
    })
  })

  it('fails with a company-specific error when no sites exist for the company', async () => {
    let message = ''

    try {
      await resolvePushTargetIds({
        apiKey: 'api',
        company: 'company-1',
        async getAllSites() {
          return []
        },
        async getSiteEnvironments() {
          return []
        },
        site: undefined,
        siteId: undefined,
        sourceEnv: undefined,
        sourceEnvId: undefined,
        targetEnv: undefined,
        targetEnvId: undefined,
      })
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error)
    }

    expect(message).to.equal('No Kinsta sites found for company "company-1"')
  })

  it('resolves environments with --site_id without requiring --company', async () => {
    const resolved = await resolvePushTargetIds({
      apiKey: 'api',
      company: '',
      async getAllSites() {
        throw new Error('should not fetch sites when --site_id is provided')
      },
      async getSiteEnvironments() {
        return [
          {display_name: 'Staging', id: 'env-1', name: 'staging'},
          {display_name: 'Live', id: 'env-2', name: 'live'},
        ] as any
      },
      site: undefined,
      siteId: 'site-1',
      sourceEnv: 'Staging',
      sourceEnvId: undefined,
      targetEnv: 'Live',
      targetEnvId: undefined,
    })

    expect(resolved).to.deep.equal({
      siteId: 'site-1',
      sourceEnvId: 'env-1',
      targetEnvId: 'env-2',
    })
  })

  it('fails when --site and --site_id are provided without --company', async () => {
    let message = ''

    try {
      await resolvePushTargetIds({
        apiKey: 'api',
        company: '',
        async getAllSites() {
          throw new Error('should not fetch sites when --company is missing for --site + --site_id validation')
        },
        async getSiteEnvironments() {
          return [
            {display_name: 'Staging', id: 'env-1', name: 'staging'},
            {display_name: 'Live', id: 'env-2', name: 'live'},
          ] as any
        },
        site: 'Project A',
        siteId: 'site-1',
        sourceEnv: 'Staging',
        sourceEnvId: undefined,
        targetEnv: 'Live',
        targetEnvId: undefined,
      })
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error)
    }

    expect(message).to.equal('Provide --company when using --site together with --site_id so the values can be validated.')
  })

  it('fails when explicit --site_id does not match in partial-ID mode', async () => {
    let message = ''

    try {
      await resolvePushTargetIds({
        apiKey: 'api',
        company: 'co',
        async getAllSites() {
          return [{
            company_id: 'co',
            display_name: 'Project A',
            id: 'site-1',
            name: 'project-a',
          }] as any
        },
        async getSiteEnvironments() {
          return [
            {display_name: 'Staging', id: 'env-1', name: 'staging'},
            {display_name: 'Live', id: 'env-2', name: 'live'},
          ] as any
        },
        site: 'Project A',
        siteId: 'site-missing',
        sourceEnv: 'Staging',
        sourceEnvId: undefined,
        targetEnv: 'Live',
        targetEnvId: undefined,
      })
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error)
    }

    expect(message).to.equal('No Kinsta site matched --site_id "site-missing".')
  })

  it('fails when explicit --source_env_id does not match in partial-ID mode', async () => {
    let message = ''

    try {
      await resolvePushTargetIds({
        apiKey: 'api',
        company: 'co',
        async getAllSites() {
          return [{
            company_id: 'co',
            display_name: 'Project A',
            id: 'site-1',
            name: 'project-a',
          }] as any
        },
        async getSiteEnvironments() {
          return [
            {display_name: 'Staging', id: 'env-1', name: 'staging'},
            {display_name: 'Live', id: 'env-2', name: 'live'},
          ] as any
        },
        site: 'Project A',
        siteId: undefined,
        sourceEnv: 'Staging',
        sourceEnvId: 'env-missing',
        targetEnv: 'Live',
        targetEnvId: undefined,
      })
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error)
    }

    expect(message).to.equal('No environment matched --source_env_id "env-missing".')
  })

  it('fails when explicit --target_env_id does not match in partial-ID mode', async () => {
    let message = ''

    try {
      await resolvePushTargetIds({
        apiKey: 'api',
        company: 'co',
        async getAllSites() {
          return [{
            company_id: 'co',
            display_name: 'Project A',
            id: 'site-1',
            name: 'project-a',
          }] as any
        },
        async getSiteEnvironments() {
          return [
            {display_name: 'Staging', id: 'env-1', name: 'staging'},
            {display_name: 'Live', id: 'env-2', name: 'live'},
          ] as any
        },
        site: 'Project A',
        siteId: undefined,
        sourceEnv: 'Staging',
        sourceEnvId: undefined,
        targetEnv: 'Live',
        targetEnvId: 'env-missing',
      })
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error)
    }

    expect(message).to.equal('No environment matched --target_env_id "env-missing".')
  })

  it('fails when --site and --site_id resolve to different sites', async () => {
    let message = ''

    try {
      await resolvePushTargetIds({
        apiKey: 'api',
        company: 'co',
        async getAllSites() {
          return [
            {
              company_id: 'co',
              display_name: 'Project A',
              id: 'site-1',
              name: 'project-a',
            },
            {
              company_id: 'co',
              display_name: 'Project B',
              id: 'site-2',
              name: 'project-b',
            }
          ] as any
        },
        async getSiteEnvironments() {
          return [
            {display_name: 'Staging', id: 'env-1', name: 'staging'},
            {display_name: 'Live', id: 'env-2', name: 'live'},
          ] as any
        },
        site: 'Project B',
        siteId: 'site-1',
        sourceEnv: 'Staging',
        sourceEnvId: undefined,
        targetEnv: 'Live',
        targetEnvId: undefined,
      })
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error)
    }

    expect(message).to.equal('--site_id "site-1" does not match --site "Project B".')
  })

  it('fails when --source_env and --source_env_id resolve to different environments', async () => {
    let message = ''

    try {
      await resolvePushTargetIds({
        apiKey: 'api',
        company: 'co',
        async getAllSites() {
          return [{
            company_id: 'co',
            display_name: 'Project A',
            id: 'site-1',
            name: 'project-a',
          }] as any
        },
        async getSiteEnvironments() {
          return [
            {display_name: 'Staging', id: 'env-1', name: 'staging'},
            {display_name: 'Live', id: 'env-2', name: 'live'},
          ] as any
        },
        site: 'Project A',
        siteId: undefined,
        sourceEnv: 'Live',
        sourceEnvId: 'env-1',
        targetEnv: 'Live',
        targetEnvId: undefined,
      })
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error)
    }

    expect(message).to.equal('--source_env_id "env-1" does not match --source_env "Live".')
  })

  it('fails when --target_env and --target_env_id resolve to different environments', async () => {
    let message = ''

    try {
      await resolvePushTargetIds({
        apiKey: 'api',
        company: 'co',
        async getAllSites() {
          return [{
            company_id: 'co',
            display_name: 'Project A',
            id: 'site-1',
            name: 'project-a',
          }] as any
        },
        async getSiteEnvironments() {
          return [
            {display_name: 'Staging', id: 'env-1', name: 'staging'},
            {display_name: 'Live', id: 'env-2', name: 'live'},
          ] as any
        },
        site: 'Project A',
        siteId: undefined,
        sourceEnv: 'Staging',
        sourceEnvId: undefined,
        targetEnv: 'Staging',
        targetEnvId: 'env-2',
      })
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error)
    }

    expect(message).to.equal('--target_env_id "env-2" does not match --target_env "Staging".')
  })

  it('includes environment display names when includeEnvironmentNames is true', async () => {
    const resolved = await resolvePushTargetIds({
      apiKey: 'api',
      company: 'co',
      async getAllSites() {
        return [{
          company_id: 'co',
          display_name: 'Project A',
          id: 'site-1',
          name: 'project-a',
          environments: [
            {display_name: 'Staging', id: 'env-1', name: 'staging'},
            {display_name: 'Live', id: 'env-2', name: 'live'},
          ],
        }] as any
      },
      async getSiteEnvironments() {
        throw new Error('should not be called when environments preloaded')
      },
      includeEnvironmentNames: true,
      site: 'Project A',
      siteId: undefined,
      sourceEnv: 'Staging',
      sourceEnvId: undefined,
      targetEnv: 'Live',
      targetEnvId: undefined,
    })

    expect(resolved).to.deep.equal({
      siteId: 'site-1',
      sourceEnvId: 'env-1',
      sourceEnvName: 'Staging',
      targetEnvId: 'env-2',
      targetEnvName: 'Live',
    })
  })

  it('emits detailed progress stages when resolving site and environments', async () => {
    const events: string[] = []

    await resolvePushTargetIds({
      apiKey: 'api',
      company: 'co',
      async getAllSites() {
        return [{
          company_id: 'co',
          display_name: 'Project A',
          id: 'site-1',
          name: 'project-a',
        }] as any
      },
      async getSiteEnvironments() {
        return [
          {display_name: 'Staging', id: 'env-1', name: 'staging'},
          {display_name: 'Live', id: 'env-2', name: 'live'},
        ] as any
      },
      progress: {
        start(label: string) {
          events.push(`start:${label}`)
        },
        stop() {
          events.push('stop')
        },
      },
      site: 'Project A',
      siteId: undefined,
      sourceEnv: 'Staging',
      sourceEnvId: undefined,
      targetEnv: 'Live',
      targetEnvId: undefined,
    })

    expect(events).to.deep.equal([
      'start:Fetching sites for company...',
      'stop',
      'start:Fetching environments for selected site...',
      'stop',
      'start:Resolving source environment...',
      'stop',
      'start:Resolving target environment...',
      'stop',
    ])
  })

  it('emits progress without site-fetching stage for --site_id partial-ID mode', async () => {
    const events: string[] = []

    await resolvePushTargetIds({
      apiKey: 'api',
      company: '',
      async getAllSites() {
        throw new Error('should not fetch sites when --site_id is provided')
      },
      async getSiteEnvironments() {
        return [
          {display_name: 'Staging', id: 'env-1', name: 'staging'},
          {display_name: 'Live', id: 'env-2', name: 'live'},
        ] as any
      },
      progress: {
        start(label: string) {
          events.push(`start:${label}`)
        },
        stop() {
          events.push('stop')
        },
      },
      site: undefined,
      siteId: 'site-1',
      sourceEnv: 'Staging',
      sourceEnvId: undefined,
      targetEnv: 'Live',
      targetEnvId: undefined,
    })

    expect(events).to.deep.equal([
      'start:Fetching environments for selected site...',
      'stop',
      'start:Resolving source environment...',
      'stop',
      'start:Resolving target environment...',
      'stop',
    ])
  })

  it('skips fetching-environments stage when environments are preloaded', async () => {
    const events: string[] = []

    await resolvePushTargetIds({
      apiKey: 'api',
      company: 'co',
      async getAllSites() {
        return [{
          company_id: 'co',
          display_name: 'Project A',
          id: 'site-1',
          name: 'project-a',
          environments: [
            {display_name: 'Staging', id: 'env-1', name: 'staging'},
            {display_name: 'Live', id: 'env-2', name: 'live'},
          ],
        }] as any
      },
      async getSiteEnvironments() {
        throw new Error('should not fetch envs when preloaded')
      },
      progress: {
        start(label: string) {
          events.push(`start:${label}`)
        },
        stop() {
          events.push('stop')
        },
      },
      site: 'Project A',
      siteId: undefined,
      sourceEnv: 'Staging',
      sourceEnvId: undefined,
      targetEnv: 'Live',
      targetEnvId: undefined,
    })

    expect(events).to.deep.equal([
      'start:Fetching sites for company...',
      'stop',
      'start:Resolving source environment...',
      'stop',
      'start:Resolving target environment...',
      'stop',
    ])
  })

  it('does not emit resolution stages when all IDs are provided', async () => {
    const events: string[] = []

    await resolvePushTargetIds({
      apiKey: 'api',
      company: '',
      async getAllSites() {
        throw new Error('should not fetch sites in full ID mode')
      },
      async getSiteEnvironments() {
        throw new Error('should not fetch envs in full ID mode')
      },
      progress: {
        start(label: string) {
          events.push(`start:${label}`)
        },
        stop() {
          events.push('stop')
        },
      },
      site: undefined,
      siteId: 'site-1',
      sourceEnv: undefined,
      sourceEnvId: 'env-a',
      targetEnv: undefined,
      targetEnvId: 'env-b',
    })

    expect(events).to.deep.equal([])
  })
})
