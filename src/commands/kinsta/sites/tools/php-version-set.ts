import {Flags} from '@oclif/core'
import {KinstaCommand} from '../../../../lib/commands/kinsta-command.js'
import {setPhpVersion} from '../../../../lib/kinsta.js'

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

    const response = await setPhpVersion(flags.apiKey, flags)
    if (response?.status !== 202) {
      console.log(response)
      this.error(response.message, {exit: 2})
    }

    this.log(`${response.message}\nOperation ID: ${response.operation_id}`)
  }
}
