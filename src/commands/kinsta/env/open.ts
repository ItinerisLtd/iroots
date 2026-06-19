import {Flags, ux} from '@oclif/core'

import {openUrlInBrowser} from '../../../lib/browser.js'
import {KinstaCommand} from '../../../lib/commands/kinsta-command.js'
import {normalizeOptionalFlag, resolveEnvironment, resolveSite} from '../../../lib/kinsta-selectors.js'
import {getAllSites, getSiteEnvironments, KinstaSite} from '../../../lib/kinsta.js'
import {inferKinstaFromTrellis} from '../../../lib/trellis-kinsta.js'

type KinstaEnvironment = Awaited<ReturnType<typeof getSiteEnvironments>>[number]

export default class Open extends KinstaCommand {
  static description = 'Open a Kinsta environment in your default web browser'
  static examples = ['<%= config.bin %> <%= command.id %>']
  static flags = {
    company: Flags.string({
      description: 'Kinsta company ID (required when site/environment IDs are not resolved directly)',
      env: 'IROOTS_KINSTA_COMPANY_ID',
      required: false,
    }),
    environment: Flags.string({
      description: 'Environment name (case-insensitive exact match)',
      required: false,
    }),
    // eslint-disable-next-line camelcase
    environment_id: Flags.string({
      description: 'Environment ID (takes priority over inferred values)',
      env: 'IROOTS_KINSTA_ENVIRONMENT_ID',
      required: false,
    }),
    site: Flags.string({
      description: 'Site name (case-insensitive exact match)',
      required: false,
    }),
    // eslint-disable-next-line camelcase
    site_id: Flags.string({
      description: 'Site ID (takes priority over inferred values)',
      required: false,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Open)
    const {apiKey} = flags
    const company = normalizeOptionalFlag(flags.company)
    const site = normalizeOptionalFlag(flags.site)
    const environment = normalizeOptionalFlag(flags.environment)
    const siteIdFlag = normalizeOptionalFlag(flags.site_id)
    const environmentIdFlag = normalizeOptionalFlag(flags.environment_id)

    if ((siteIdFlag === undefined) !== (environmentIdFlag === undefined)) {
      this.error('Provide both --site_id and --environment_id together, or provide neither.')
    }

    if (siteIdFlag !== undefined && environmentIdFlag !== undefined) {
      await this.openEnvironment(siteIdFlag, environmentIdFlag)
      return
    }

    if (company === undefined) {
      this.error('Could not resolve IDs directly. Provide --company or set IROOTS_KINSTA_COMPANY_ID.')
    }

    const inference = site === undefined ? await inferKinstaFromTrellis(process.cwd()) : null

    ux.action.start('Fetching Kinsta sites')
    const sites = await getAllSites(apiKey, company, true)
    ux.action.stop()

    if (sites.length === 0) {
      this.error(`No Kinsta sites found for company "${company}"`)
    }

    const siteCandidates = [site, ...(inference?.siteNames ?? [])].filter((value): value is string => value !== undefined && value.trim().length > 0)
    let selectedSite: KinstaSite
    try {
      selectedSite = await resolveSite(sites, siteCandidates, site)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      this.error(message)
    }

    const environments = selectedSite.environments ?? []
    if (environments.length === 0) {
      ux.action.start(`Fetching environments for site "${selectedSite.display_name}"`)
      environments.push(...await getSiteEnvironments(apiKey, selectedSite.id))
      ux.action.stop()
    }

    if (environments.length === 0) {
      this.error(`No environments found for site "${selectedSite.display_name}"`)
    }

    const environmentCandidates = [environment].filter((value): value is string => value !== undefined && value.trim().length > 0)
    let selectedEnvironment: KinstaEnvironment
    try {
      selectedEnvironment = await resolveEnvironment(environments, environmentCandidates, environment)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      this.error(message)
    }

    await this.openEnvironment(selectedSite.id, selectedEnvironment.id)
  }

  private async openEnvironment(siteId: string, environmentId: string): Promise<void> {
    const url = `https://my.kinsta.com/sites/details/${encodeURIComponent(siteId)}/${encodeURIComponent(environmentId)}`
    this.log(`URL: ${url}`)

    ux.action.start('Opening environment in browser')
    try {
      await openUrlInBrowser(url)
      ux.action.stop()
    } catch (error: unknown) {
      ux.action.stop('failed')
      const message = error instanceof Error ? error.message : String(error)
      this.error(message)
    }
  }
}
