import {Flags, ux} from '@oclif/core'

import {KinstaCommand} from '../../../lib/commands/kinsta-command.js'
import {setWebroot} from '../../../lib/kinsta.js'

export default class ChangeWebrootSubfolder extends KinstaCommand {
  static description = 'Change the webroot for an environment.'
  static flags = {
    // eslint-disable-next-line camelcase
    env_id: Flags.string({
      aliases: ['environment_id'],
      env: 'IROOTS_KINSTA_ENVIRONMENT_ID',
      required: true,
    }),
    webroot: Flags.string({
      required: true,
    }),
    'clear-all-cache': Flags.boolean({
      required: false,
      default: true,
    }),
    'refresh-plugins-and-themes': Flags.boolean({
      required: false,
      default: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(ChangeWebrootSubfolder)
    const {
      apiKey,
      env_id: environmentId,
      webroot,
      'clear-all-cache': clearAllCache,
      'refresh-plugins-and-themes': refreshPluginsAndThemes,
    } = flags

    ux.action.start(`Changing webroot to ${webroot}`)

    const response = await setWebroot(apiKey, environmentId, webroot, clearAllCache, refreshPluginsAndThemes)

    ux.action.stop(response.message)
  }
}
