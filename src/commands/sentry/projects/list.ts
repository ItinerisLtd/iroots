import {SentryCommand} from '../../../lib/commands/sentry-command.js'
import {getAllProjects} from '../../../lib/sentry.js'

export default class List extends SentryCommand {
  static description = 'List projects in Sentry account'

  static examples = ['<%= config.bin %> <%= command.id %>']

  public async run(): Promise<void> {
    const {flags} = await this.parse(List)
    const {apiKey} = flags

    const response = await getAllProjects(apiKey)
    console.table(response)
  }
}
