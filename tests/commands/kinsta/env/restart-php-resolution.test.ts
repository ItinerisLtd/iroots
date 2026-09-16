/* eslint-disable camelcase */
import {expect} from 'chai'

import {resolveRestartPhpEnvironmentId} from '../../../../src/commands/kinsta/env/restart-php.js'

describe('env restart-php resolution', () => {
  it('uses explicit --environment_id when provided', async () => {
    const environmentId = await resolveRestartPhpEnvironmentId({
      apiKey: 'api',
      company: '',
      async getAllSites() {
        throw new Error('should not fetch sites when --environment_id is provided')
      },
      async getSiteEnvironments() {
        throw new Error('should not fetch envs when --environment_id is provided')
      },
      environment: undefined,
      environmentId: 'env-a',
      site: undefined,
      siteId: undefined,
    })

    expect(environmentId).to.equal('env-a')
  })

  it('resolves site and environment names through selectors when IDs are missing', async () => {
    const environmentId = await resolveRestartPhpEnvironmentId({
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
      environment: 'Live',
      environmentId: undefined,
      site: 'Project A',
      siteId: undefined,
    })

    expect(environmentId).to.equal('env-2')
  })

  it('auto-selects a site inferred from the current directory when unambiguous', async () => {
    const environmentId = await resolveRestartPhpEnvironmentId({
      apiKey: 'api',
      company: 'co',
      async getAllSites() {
        return [
          {
            company_id: 'co',
            display_name: 'Affinia',
            id: 'site-1',
            name: 'affinia',
          },
          {
            company_id: 'co',
            display_name: 'Other Site',
            id: 'site-2',
            name: 'other-site',
          },
        ] as any
      },
      async getSiteEnvironments() {
        return [
          {display_name: 'Staging', id: 'env-1', name: 'staging'},
          {display_name: 'Live', id: 'env-2', name: 'live'},
        ] as any
      },
      environment: 'Live',
      environmentId: undefined,
      site: undefined,
      siteId: undefined,
      siteNameCandidates: ['affinia'],
    })

    expect(environmentId).to.equal('env-2')
  })

  it('prefers an explicit --site over inferred directory candidates when they conflict', async () => {
    const environmentId = await resolveRestartPhpEnvironmentId({
      apiKey: 'api',
      company: 'co',
      async getAllSites() {
        return [
          {
            company_id: 'co',
            display_name: 'Affinia',
            id: 'site-1',
            name: 'affinia',
          },
          {
            company_id: 'co',
            display_name: 'Other Site',
            id: 'site-2',
            name: 'other-site',
          },
        ] as any
      },
      async getSiteEnvironments() {
        return [
          {display_name: 'Staging', id: 'env-1', name: 'staging'},
          {display_name: 'Live', id: 'env-2', name: 'live'},
        ] as any
      },
      environment: 'Live',
      environmentId: undefined,
      site: 'Other Site',
      siteId: undefined,
      siteNameCandidates: ['affinia'],
    })

    expect(environmentId).to.equal('env-2')
  })

  it('resolves environments with --site_id without requiring --company', async () => {
    const environmentId = await resolveRestartPhpEnvironmentId({
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
      environment: 'Staging',
      environmentId: undefined,
      site: undefined,
      siteId: 'site-1',
    })

    expect(environmentId).to.equal('env-1')
  })

  it('fails with a company-specific error when no sites exist for the company', async () => {
    let message = ''

    try {
      await resolveRestartPhpEnvironmentId({
        apiKey: 'api',
        company: 'company-1',
        async getAllSites() {
          return []
        },
        async getSiteEnvironments() {
          return []
        },
        environment: undefined,
        environmentId: undefined,
        site: undefined,
        siteId: undefined,
      })
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error)
    }

    expect(message).to.equal('No Kinsta sites found for company "company-1"')
  })

  it('fails when --site and --site_id are provided without --company', async () => {
    let message = ''

    try {
      await resolveRestartPhpEnvironmentId({
        apiKey: 'api',
        company: '',
        async getAllSites() {
          throw new Error('should not fetch sites when --company is missing for --site + --site_id validation')
        },
        async getSiteEnvironments() {
          return []
        },
        environment: 'Staging',
        environmentId: undefined,
        site: 'Project A',
        siteId: 'site-1',
      })
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error)
    }

    expect(message).to.equal('Provide --company when using --site together with --site_id so the values can be validated.')
  })

  it('fails when --site and --site_id resolve to different sites', async () => {
    let message = ''

    try {
      await resolveRestartPhpEnvironmentId({
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
            },
          ] as any
        },
        async getSiteEnvironments() {
          return []
        },
        environment: 'Staging',
        environmentId: undefined,
        site: 'Project B',
        siteId: 'site-1',
      })
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error)
    }

    expect(message).to.equal('--site_id "site-1" does not match --site "Project B".')
  })

  it('fails when --environment does not match any environment', async () => {
    let message = ''

    try {
      await resolveRestartPhpEnvironmentId({
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
          ] as any
        },
        environment: 'Missing',
        environmentId: undefined,
        site: 'Project A',
        siteId: undefined,
      })
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error)
    }

    expect(message).to.equal('No environment matched --environment "Missing"')
  })

  it('skips fetching environments when preloaded on the site', async () => {
    const environmentId = await resolveRestartPhpEnvironmentId({
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
      environment: 'Live',
      environmentId: undefined,
      site: 'Project A',
      siteId: undefined,
    })

    expect(environmentId).to.equal('env-2')
  })

  it('emits progress stages when resolving site and environment', async () => {
    const events: string[] = []

    await resolveRestartPhpEnvironmentId({
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
      environment: 'Live',
      environmentId: undefined,
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
    })

    expect(events).to.deep.equal([
      'start:Fetching sites for company...',
      'stop',
      'start:Fetching environments for selected site...',
      'stop',
      'start:Resolving environment...',
      'stop',
    ])
  })

  it('does not emit resolution stages when --environment_id is provided', async () => {
    const events: string[] = []

    await resolveRestartPhpEnvironmentId({
      apiKey: 'api',
      company: '',
      async getAllSites() {
        throw new Error('should not fetch sites when --environment_id is provided')
      },
      async getSiteEnvironments() {
        throw new Error('should not fetch envs when --environment_id is provided')
      },
      environment: undefined,
      environmentId: 'env-a',
      progress: {
        start(label: string) {
          events.push(`start:${label}`)
        },
        stop() {
          events.push('stop')
        },
      },
      site: undefined,
      siteId: undefined,
    })

    expect(events).to.deep.equal([])
  })

  it('marks progress as failed and rethrows when environment resolution throws', async () => {
    const events: string[] = []
    let message = ''

    try {
      await resolveRestartPhpEnvironmentId({
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
          throw new Error('boom')
        },
        environment: 'Live',
        environmentId: undefined,
        progress: {
          start(label: string) {
            events.push(`start:${label}`)
          },
          stop(status?: string) {
            events.push(status === undefined ? 'stop' : `stop:${status}`)
          },
        },
        site: 'Project A',
        siteId: undefined,
      })
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error)
    }

    expect(message).to.equal('boom')
    expect(events).to.deep.equal([
      'start:Fetching sites for company...',
      'stop',
      'start:Fetching environments for selected site...',
      'stop:failed',
    ])
  })
})
