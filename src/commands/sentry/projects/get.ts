import {Flags} from '@oclif/core'

import {SentryCommand} from '../../../lib/commands/sentry-command.js'
import {getProject} from '../../../lib/sentry.js'

export default class Get extends SentryCommand {
  static description = 'Get a specific project from Sentry account'
static flags = {
    organisationSlug: Flags.string({
      env: 'IROOTS_SENTRY_ORGANISATION_SLUG',
      required: true,
    }),
    projectSlug: Flags.string({
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Get)
    const {apiKey, organisationSlug, projectSlug} = flags

    const response = await getProject(apiKey, organisationSlug, projectSlug)
    console.log(response)
  }
}
