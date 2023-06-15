import {Flags} from '@oclif/core'
// eslint-disable-next-line node/no-missing-import
import {getSiteUptime} from '../../../lib/statuscake.js'
// eslint-disable-next-line node/no-missing-import
import {StatusCakeCommand} from '../../../lib/commands/statuscake-command.js'

export default class Get extends StatusCakeCommand {
  static description = 'describe the command here'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    // eslint-disable-next-line camelcase
    test_id: Flags.integer({
      description: 'Uptime check ID',
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Get)
    const {apiKey, test_id: testId} = flags

    const test = await getSiteUptime(apiKey, testId)
    console.log(test)
  }
}
