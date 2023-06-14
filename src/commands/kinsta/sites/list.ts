import {Flags} from '@oclif/core'
// eslint-disable-next-line node/no-missing-import
import {KinstaCommand} from '../../../lib/commands/kinsta-command.js'
// eslint-disable-next-line node/no-missing-import
import {getAllSites} from '../../../lib/kinsta.js'

export default class List extends KinstaCommand {
  static description = 'describe the command here'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    companyId: Flags.string({
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(List)
    const {apiKey, companyId} = flags

    const sites = await getAllSites(apiKey, companyId)
    console.table(sites)
  }
}
