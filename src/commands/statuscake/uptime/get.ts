import {Flags} from '@oclif/core'
import {getSiteUptime} from '../../../lib/statuscake.js'
import {StatusCakeCommand} from '../../../lib/commands/statuscake-command.js'

export default class Get extends StatusCakeCommand {
  static description = 'Get information about an uptime monitor'

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
