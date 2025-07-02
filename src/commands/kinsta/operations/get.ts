import {Flags, ux} from '@oclif/core'

import {KinstaCommand} from '../../../lib/commands/kinsta-command.js'
import {getOperationStatus} from '../../../lib/kinsta.js'

export default class Get extends KinstaCommand {
  static description = 'Get the status of an operation.'
static flags = {
    // eslint-disable-next-line camelcase
    operation_id: Flags.string({
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Get)

    ux.action.start('Checking operation status')

    const response = await getOperationStatus(flags.apiKey, flags.operation_id)

    ux.action.stop(response.message)
  }
}
