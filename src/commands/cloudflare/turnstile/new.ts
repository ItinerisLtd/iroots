import {Flags} from '@oclif/core'
import {CloudflareCommand} from '../../../lib/commands/cloudflare-command.js'
import {createTurnstileWidget} from '../../../lib/cloudflare.js'

export default class New extends CloudflareCommand {
  static description = 'Create a new Turnstile instance'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    // eslint-disable-next-line camelcase
    bot_fight_mode: Flags.boolean({
      description:
        'If bot_fight_mode is set to true, Cloudflare issues computationally expensive challenges in response to malicious bots (ENT only).',
      default: false,
    }),
    // eslint-disable-next-line camelcase
    clearance_level: Flags.string({
      description:
        'If Turnstile is embedded on a Cloudflare site and the widget should grant challenge clearance, this setting can determine the clearance level to be set',
      default: 'no_clearance',
    }),
    domains: Flags.string({
      multiple: true,
      required: true,
    }),
    mode: Flags.string({
      description: 'Widget Mode',
      options: ['non-interactive', 'invisible', 'managed'],
      required: true,
      default: 'managed',
    }),
    name: Flags.string({
      summary: '>= 1 characters <= 254 characters',
      description:
        'Human readable widget name. Not unique. Cloudflare suggests that you set this to a meaningful string to make it easier to identify your widget, and where it is used. >= 1 characters <= 254 characters',
    }),
    offlabel: Flags.boolean({
      description: 'Do not show any Cloudflare branding on the widget (ENT only)',
      default: false,
    }),
    region: Flags.string({
      description: 'Region where this widget can be used',
      default: 'world',
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(New)
    const {apiKey, account, ...args} = flags

    if ((args.name?.length || 0) === 0 && args.domains.length > 0) {
      args.name = args.domains.at(0) as string
    }

    const site = await createTurnstileWidget(apiKey, account, args)
    console.table(site)
  }
}
