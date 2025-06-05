/* eslint-disable camelcase */
import {Flags, ux} from '@oclif/core'
import {KinstaCommand} from '../../../../lib/commands/kinsta-command.js'
import {setWebroot} from '../../../../lib/kinsta.js'

export default class ChangeWebrootSubfolder extends KinstaCommand {
  static description = 'Change the webroot for an environment.'

  static flags = {
    environment_id: Flags.string({
      required: true,
      env: 'IROOTS_KINSTA_ENVIRONMENT_ID',
    }),
    webroot: Flags.string({
      required: true,
    }),
    clear_all_cache: Flags.boolean({
      required: false,
      default: true,
    }),
    refresh_plugins_and_themes: Flags.boolean({
      required: false,
      default: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(ChangeWebrootSubfolder)
    const {apiKey, environment_id, webroot, clear_all_cache, refresh_plugins_and_themes} = flags

    ux.action.start(`Changing webroot to ${webroot}`)

    const response = await setWebroot(apiKey, environment_id, webroot, clear_all_cache, refresh_plugins_and_themes)

    ux.action.stop(response.message)
  }
}
