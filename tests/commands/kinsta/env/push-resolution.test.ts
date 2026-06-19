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
})
