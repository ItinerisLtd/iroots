import {Flags, ux} from '@oclif/core'
import {KinstaCommand} from '../../../../lib/commands/kinsta-command.js'
import {addDomainToEnvironment} from '../../../../lib/kinsta.js'

export default class New extends KinstaCommand {
  static description = 'Create a new domain on a site environment'

  static flags = {
    company: Flags.string({
      required: true,
      env: 'IROOTS_KINSTA_COMPANY_ID',
    }),
    // eslint-disable-next-line camelcase
    env_id: Flags.string({
      required: true,
      env: 'IROOTS_KINSTA_ENVIRONMENT_ID',
    }),
    // eslint-disable-next-line camelcase
    domain_name: Flags.string({
      required: true,
    }),
    // eslint-disable-next-line camelcase
    is_wildcardless: Flags.boolean({
      required: false,
      default: true,
    }),
    // eslint-disable-next-line camelcase
    custom_ssl_key: Flags.string({
      required: false,
    }),
    // eslint-disable-next-line camelcase
    custom_ssl_cert: Flags.string({
      required: false,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(New)

    ux.action.start('Adding domain')

    const response = await addDomainToEnvironment(flags.apiKey, flags.env_id, flags)

    ux.action.stop(response.message)
  }
}
