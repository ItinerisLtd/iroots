import {Flags} from '@oclif/core'
import {SentryCommand} from '../../../lib/commands/sentry-command.js'
import {deleteProject} from '../../../lib/sentry.js'

export default class Delete extends SentryCommand {
  static description = 'Delete a specific project from Sentry account'

  static flags = {
    organisation: Flags.string({
      required: true,
      env: 'IROOTS_SENTRY_ORGANISATION_SLUG',
    }),
    project: Flags.string({
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Delete)
    const {apiKey, organisation, project} = flags

    const response = await deleteProject(apiKey, organisation, project)
    if (response.status === 204) {
      this.log(`Project '${project}' deleted successfully from organisation '${organisation}'.`)
      this.exit(0)
    }

    this.error(response.statusText)
  }
}
