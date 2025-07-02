/* eslint-disable camelcase */
import {Flags, ux} from '@oclif/core'

import {KinstaCommand} from '../../../../lib/commands/kinsta-command.js'
import {setPhpVersion} from '../../../../lib/kinsta.js'

export default class PhpVersionSet extends KinstaCommand {
  static description = 'Set an environments PHP version.'
static flags = {
    environment_id: Flags.string({
      env: 'IROOTS_KINSTA_ENVIRONMENT_ID',
      required: true,
    }),
    php_version: Flags.string({
      options: ['8.0', '8.1', '8.2'],
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(PhpVersionSet)
    const {apiKey, environment_id, php_version} = flags

    ux.action.start(`Changing PHP version to ${php_version}`)

    const response = await setPhpVersion(apiKey, environment_id, php_version)

    ux.action.stop(response.message)
  }
}
