import {Flags} from '@oclif/core'
import {KinstaCommand} from '../../../lib/commands/kinsta-command.js'
import {ResponseCodes, getOperationStatus} from '../../../lib/kinsta.js'

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

    const response = await getOperationStatus(flags.apiKey, flags.operation_id)
    const responses: ResponseCodes = {
      200: 'Operation complete.',
      202: 'Operation in progress.',
      404: 'Operation not found.',
    }

    if (!(response?.status in responses)) {
      let message = response.message
      if (response.data?.message.length) {
        message = `
          ${message}
          \n
          ${response.data?.message}
`
      }

      this.error(message, {exit: 2})
    }

    this.log(responses[response.status])
  }
}
