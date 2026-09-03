/* eslint-disable camelcase */
import {expect} from 'chai'

import {resolveLogsEnvironmentId} from '../../../../src/commands/kinsta/env/logs/get.js'

describe('env logs get resolution', () => {
  it('uses an explicit environment_id without fetching sites', async () => {
    const environmentId = await resolveLogsEnvironmentId({
      apiKey: 'api',
      company: '',
      environment: undefined,
      environmentId: 'env-1',
      async getAllSites() {
        throw new Error('should not fetch sites when --environment_id is provided')
      },
      async getSiteEnvironments() {
        throw new Error('should not fetch envs when --environment_id is provided')
      },
      site: undefined,
      siteId: undefined,
    })

    expect(environmentId).to.equal('env-1')
  })

  it('fails when environment_id is missing and no company is provided', async () => {
    let message = ''

    try {
      await resolveLogsEnvironmentId({
        apiKey: 'api',
        company: '',
        environment: undefined,
        environmentId: undefined,
        async getAllSites() {
          throw new Error('should not fetch sites without a company')
        },
        async getSiteEnvironments() {
          throw new Error('should not fetch envs without a company')
        },
        site: undefined,
        siteId: undefined,
      })
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error)
    }

    expect(message).to.equal('Could not resolve --environment_id directly. Provide --company or set IROOTS_KINSTA_COMPANY_ID.')
  })

  it('resolves the site and environment through selectors when environment_id is missing', async () => {
    const environmentId = await resolveLogsEnvironmentId({
      apiKey: 'api',
      company: 'co',
      environment: 'Staging',
      environmentId: undefined,
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
    })

    expect(environmentId).to.equal('env-1')
  })

  it('auto-selects a site inferred from the current directory when unambiguous', async () => {
    const environmentId = await resolveLogsEnvironmentId({
      apiKey: 'api',
      company: 'co',
      environment: 'Live',
      environmentId: undefined,
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
          }
        ] as any
      },
      async getSiteEnvironments() {
        return [
          {display_name: 'Staging', id: 'env-1', name: 'staging'},
          {display_name: 'Live', id: 'env-2', name: 'live'},
        ] as any
      },
      site: undefined,
      siteId: undefined,
      siteNameCandidates: ['affinia'],
    })

    expect(environmentId).to.equal('env-2')
  })

  it('resolves through --site_id without requiring --company', async () => {
    const environmentId = await resolveLogsEnvironmentId({
      apiKey: 'api',
      company: '',
      environment: 'Live',
      environmentId: undefined,
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
    })

    expect(environmentId).to.equal('env-2')
  })

  it('fails with a company-specific error when no sites exist for the company', async () => {
    let message = ''

    try {
      await resolveLogsEnvironmentId({
        apiKey: 'api',
        company: 'company-1',
        environment: undefined,
        environmentId: undefined,
        async getAllSites() {
          return []
        },
        async getSiteEnvironments() {
          return []
        },
        site: undefined,
        siteId: undefined,
      })
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error)
    }

    expect(message).to.equal('No Kinsta sites found for company "company-1"')
  })

  it('skips fetching environments when preloaded on the site', async () => {
    const environmentId = await resolveLogsEnvironmentId({
      apiKey: 'api',
      company: 'co',
      environment: 'Staging',
      environmentId: undefined,
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
        throw new Error('should not be called when environments are preloaded')
      },
      site: 'Project A',
      siteId: undefined,
    })

    expect(environmentId).to.equal('env-1')
  })

  it('emits progress stages when resolving site and environment', async () => {
    const events: string[] = []

    await resolveLogsEnvironmentId({
      apiKey: 'api',
      company: 'co',
      environment: 'Staging',
      environmentId: undefined,
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

  it('does not emit resolution stages when environment_id is provided', async () => {
    const events: string[] = []

    await resolveLogsEnvironmentId({
      apiKey: 'api',
      company: '',
      environment: undefined,
      environmentId: 'env-1',
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
      siteId: undefined,
    })

    expect(events).to.deep.equal([])
  })

  it('validates --site_id against --site when --company is provided', async () => {
    const environmentId = await resolveLogsEnvironmentId({
      apiKey: 'api',
      company: 'co',
      environment: 'Live',
      environmentId: undefined,
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
      siteId: 'site-1',
    })

    expect(environmentId).to.equal('env-2')
  })

  it('fails when --site and --site_id are provided without --company', async () => {
    let message = ''

    try {
      await resolveLogsEnvironmentId({
        apiKey: 'api',
        company: '',
        environment: 'Live',
        environmentId: undefined,
        async getAllSites() {
          throw new Error('should not fetch sites when --company is missing for --site + --site_id validation')
        },
        async getSiteEnvironments() {
          return []
        },
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
      await resolveLogsEnvironmentId({
        apiKey: 'api',
        company: 'co',
        environment: 'Live',
        environmentId: undefined,
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
          return []
        },
        site: 'Project B',
        siteId: 'site-1',
      })
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error)
    }

    expect(message).to.equal('--site_id "site-1" does not match --site "Project B".')
  })

  it('fails when --site_id does not exist for the company', async () => {
    let message = ''

    try {
      await resolveLogsEnvironmentId({
        apiKey: 'api',
        company: 'co',
        environment: 'Live',
        environmentId: undefined,
        async getAllSites() {
          return [{
            company_id: 'co',
            display_name: 'Project A',
            id: 'site-1',
            name: 'project-a',
          }] as any
        },
        async getSiteEnvironments() {
          return []
        },
        site: 'Project A',
        siteId: 'site-missing',
      })
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error)
    }

    expect(message).to.equal('No Kinsta site matched --site_id "site-missing".')
  })

  it('marks progress as failed and rethrows when environment resolution throws', async () => {
    const events: string[] = []
    let message = ''

    try {
      await resolveLogsEnvironmentId({
        apiKey: 'api',
        company: 'co',
        environment: 'Missing',
        environmentId: undefined,
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

    expect(message).to.equal('No environment matched --environment "Missing"')
    expect(events).to.deep.equal([
      'start:Fetching sites for company...',
      'stop',
      'start:Fetching environments for selected site...',
      'stop',
      'start:Resolving environment...',
      'stop:failed',
    ])
  })
})
