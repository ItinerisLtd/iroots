import {Flags, ux} from '@oclif/core'
import {KinstaCommand} from '../../../lib/commands/kinsta-command.js'
import {createSite, getOperationStatus, getRegions} from '../../../lib/kinsta.js'

export default class New extends KinstaCommand {
  static description = 'Create a new Kinsta site'

  static flags = {
    company: Flags.string({
      required: true,
      env: 'IROOTS_KINSTA_COMPANY_ID',
    }),
    // eslint-disable-next-line camelcase
    display_name: Flags.string({
      required: true,
      env: 'IROOTS_KINSTA_DISPLAY_NAME',
    }),
    region: Flags.string({
      required: true,
      options: getRegions(),
      default: 'europe-west2',
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(New)

    if (flags.display_name.length < 5) {
      this.error('The site name must be between 5 and 32 characters long.')
    }

    ux.action.start('Creating site')
    const response = await createSite(flags.apiKey, flags)
    if (response?.status !== 202) {
      console.log(response)
      this.error(response.message, {exit: 2})
    }

    const {operation_id: operationId} = response

    const secondsToWait = 5
    let operationStatus = null
    let operationStatusCode = 404
    let requestsCount = 0

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

      requestsCount++
    } while (requestsCount < 10 && operationStatusCode !== 200)

    if (operationStatus === null) {
      this.error('Failed to create site. Try again with MyKinsta UI')
    }

    ux.action.stop('Done.')
    this.log(`Operation ID: ${operationId}`)
  }
}
