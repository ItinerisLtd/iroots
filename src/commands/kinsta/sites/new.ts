import {Flags} from '@oclif/core'
// eslint-disable-next-line node/no-missing-import
import {KinstaCommand} from '../../../lib/commands/kinsta-command.js'
// eslint-disable-next-line node/no-missing-import
import {createSite, getRegions} from '../../../lib/kinsta.js'
import {randomBytes} from 'node:crypto'

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
    }),
    region: Flags.string({
      required: true,
      options: getRegions(),
      default: 'europe-west2',
    }),
    // eslint-disable-next-line camelcase
    install_mode: Flags.string({
      required: true,
      options: ['new', 'plain'],
      default: 'plain',
    }),
    // eslint-disable-next-line camelcase
    is_subdomain_multisite: Flags.boolean({
      required: true,
      default: false,
    }),
    // eslint-disable-next-line camelcase
    admin_email: Flags.string({
      required: true,
      default: 'wordpress@itineris.co.uk',
    }),
    // eslint-disable-next-line camelcase
    admin_password: Flags.string({
      required: true,
      default: randomBytes(256).toString('hex'),
    }),
    // eslint-disable-next-line camelcase
    admin_user: Flags.string({
      required: true,
      default: 'itineris',
    }),
    // eslint-disable-next-line camelcase
    is_multisite: Flags.boolean({
      required: true,
      default: false,
    }),
    // eslint-disable-next-line camelcase
    site_title: Flags.string({
      required: true,
    }),
    woocommerce: Flags.boolean({
      required: true,
      default: false,
    }),
    wordpressseo: Flags.boolean({
      required: true,
      default: false,
    }),
    // eslint-disable-next-line camelcase
    wp_language: Flags.string({
      required: true,
      default: 'en_GB',
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(New)

    const response = await createSite(flags.apiKey, flags)
    if (response?.status !== 202) {
      console.log(response)
      this.error(response.message, {exit: 2})
    }

    this.log(`Site created. Check MyKinsta to check progress.`)
  }
}
