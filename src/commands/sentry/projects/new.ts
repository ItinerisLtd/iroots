import {Flags} from '@oclif/core'
import {SentryCommand} from '../../../lib/commands/sentry-command.js'
import {createProject} from '../../../lib/sentry.js'

export default class New extends SentryCommand {
  static description = 'Create a new project in Sentry'

  static flags = {
    organisationSlug: Flags.string({
      required: true,
      env: 'IROOTS_SENTRY_ORGANISATION_SLUG',
      description: 'The slug of the organization the resource belongs to.',
    }),
    teamSlug: Flags.string({
      required: true,
      env: 'IROOTS_SENTRY_TEAM_SLUG',
      description: 'The slug of the organization the resource belongs to.',
    }),
    name: Flags.string({
      required: true,
      description: 'The name for the project.',
    }),
    slug: Flags.string({
      required: false,
      description: 'Uniquely identifies a project.',
    }),
    platform: Flags.string({
      required: true,
      default: 'php',
      description: 'The platform for the project.',
    }),
    defaultRules: Flags.boolean({
      required: false,
      default: true,
      description:
        'Defaults to true where the behavior is to alert the user on every new issue. Setting this to false will turn this off and the user must create their own alerts to be notified of new issues.',
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(New)
    const response = await createProject(flags)
    console.log(response)
  }
}
