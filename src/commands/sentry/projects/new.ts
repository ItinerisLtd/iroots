import {Flags} from '@oclif/core'

import {SentryCommand} from '../../../lib/commands/sentry-command.js'
import {createProject} from '../../../lib/sentry.js'

export default class New extends SentryCommand {
  static description = 'Create a new project in Sentry'
static flags = {
    defaultRules: Flags.boolean({
      default: true,
      description:
        'Defaults to true where the behavior is to alert the user on every new issue. Setting this to false will turn this off and the user must create their own alerts to be notified of new issues.',
      required: false,
    }),
    name: Flags.string({
      description: 'The name for the project.',
      required: true,
    }),
    organisationSlug: Flags.string({
      description: 'The slug of the organization the resource belongs to.',
      env: 'IROOTS_SENTRY_ORGANISATION_SLUG',
      required: true,
    }),
    platform: Flags.string({
      default: 'php',
      description: 'The platform for the project.',
      required: true,
    }),
    slug: Flags.string({
      description: 'Uniquely identifies a project.',
      required: false,
    }),
    teamSlug: Flags.string({
      description: 'The slug of the organization the resource belongs to.',
      env: 'IROOTS_SENTRY_TEAM_SLUG',
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(New)
    const response = await createProject(flags)
    console.log(response)
  }
}
