import {Flags, ux} from '@oclif/core'
import {KinstaCommand} from '../../../../lib/commands/kinsta-command.js'
import {getOperationStatus, setPhpVersion} from '../../../../lib/kinsta.js'

export default class PhpVersionSet extends KinstaCommand {
  static description = 'Set an environments PHP version.'

  static flags = {
    // eslint-disable-next-line camelcase
    environment_id: Flags.string({
      required: true,
      env: 'IROOTS_KINSTA_ENVIRONMENT_ID',
    }),
    // eslint-disable-next-line camelcase
    php_version: Flags.string({
      required: true,
      options: ['8.0', '8.1', '8.2'],
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(PhpVersionSet)

    ux.action.start('Changing PHP version')
    const response = await setPhpVersion(flags.apiKey, flags)
    if (response?.status !== 202) {
      console.log(response)
      this.error(response.message, {exit: 2})
    }

    const {operation_id: operationId} = response
    const secondsToWait = 5
    let operationStatus = null
    let operationStatusCode = 404

    do {
      // This is to make sure that Kinsta have created the operation for us to query.
      // If we send the request too soon, it will not be ready to view.
      // eslint-disable-next-line no-await-in-loop
      await ux.wait(secondsToWait * 1000)

      // eslint-disable-next-line no-await-in-loop
      operationStatus = await getOperationStatus(flags.apiKey, operationId)
      operationStatusCode = operationStatus.status

      if (operationStatusCode >= 500) {
        this.error(operationStatus.data.message)
      }
    } while (operationStatusCode !== 200)

    if (operationStatus === null) {
      this.error('Failed to change PHP version. Try again via MyKinsta UI')
    }

    ux.action.stop('Done.')
    this.log(`Operation ID: ${operationId}`)
  }
}
