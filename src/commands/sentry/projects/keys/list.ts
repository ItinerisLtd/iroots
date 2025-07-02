import {Flags} from '@oclif/core'

import {SentryCommand} from '../../../../lib/commands/sentry-command.js'
import {getAllProjectKeys} from '../../../../lib/sentry.js'

export default class List extends SentryCommand {
  static description = 'List client keys bound to a project'
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
    const {flags} = await this.parse(List)
    const {apiKey, organisationSlug, projectSlug} = flags

    const response = await getAllProjectKeys(apiKey, organisationSlug, projectSlug)
    for (const item of response) {
      const data = {
        label: item.label,
        ...item.dsn,
      }
      console.table(data)
    }
  }
}
