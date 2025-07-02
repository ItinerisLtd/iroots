import {Flags} from '@oclif/core'

import {StatusCakeCommand} from '../../../lib/commands/statuscake-command.js'
import {deleteUptimeTest} from '../../../lib/statuscake.js'

export default class Delete extends StatusCakeCommand {
  static description = 'Delete an uptime check'
static examples = ['<%= config.bin %> <%= command.id %>']
static flags = {
    // eslint-disable-next-line camelcase
    test_id: Flags.string({
      description: 'The ID of the uptime check to delete',
      required: true,
    }),
  }
static help: 'see https://developers.statuscake.com/api/#tag/uptime/operation/delete-uptime-test for more info'

  public async run(): Promise<void> {
    const {flags} = await this.parse(Delete)
    const test = await deleteUptimeTest(flags.apiKey, flags.test_id)
    if (test !== null) {
      console.log(test)
      this.exit(1)
    }

    this.log(`Test ID ${flags.test_id} was successfully deleted.`)
  }
}
