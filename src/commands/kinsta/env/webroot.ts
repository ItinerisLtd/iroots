import {Flags, ux} from '@oclif/core'

import {KinstaCommand} from '../../../lib/commands/kinsta-command.js'
import {setWebroot} from '../../../lib/kinsta.js'

export default class ChangeWebrootSubfolder extends KinstaCommand {
  static description = 'Change the webroot for an environment.'
  static flags = {
    env: Flags.string({
      required: true,
      env: 'IROOTS_KINSTA_ENVIRONMENT_ID',
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
      env,
      webroot,
      'clear-all-cache': clearAllCache,
      'refresh-plugins-and-themes': refreshPluginsAndThemes,
    } = flags

    ux.action.start(`Changing webroot to ${webroot}`)

    const response = await setWebroot(apiKey, env, webroot, clearAllCache, refreshPluginsAndThemes)

    ux.action.stop(response.message)
  }
}
