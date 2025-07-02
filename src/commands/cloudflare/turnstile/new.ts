import {Flags} from '@oclif/core'

import {createTurnstileWidget} from '../../../lib/cloudflare.js'
import {CloudflareCommand} from '../../../lib/commands/cloudflare-command.js'

export default class New extends CloudflareCommand {
  static description = 'Create a new Turnstile instance'
static examples = ['<%= config.bin %> <%= command.id %>']
static flags = {
    // eslint-disable-next-line camelcase
    bot_fight_mode: Flags.boolean({
      default: false,
      description:
        'If bot_fight_mode is set to true, Cloudflare issues computationally expensive challenges in response to malicious bots (ENT only).',
    }),
    // eslint-disable-next-line camelcase
    clearance_level: Flags.string({
      default: 'no_clearance',
      description:
        'If Turnstile is embedded on a Cloudflare site and the widget should grant challenge clearance, this setting can determine the clearance level to be set',
    }),
    domains: Flags.string({
      multiple: true,
      required: true,
    }),
    mode: Flags.string({
      default: 'managed',
      description: 'Widget Mode',
      options: ['non-interactive', 'invisible', 'managed'],
      required: true,
    }),
    name: Flags.string({
      description:
        'Human readable widget name. Not unique. Cloudflare suggests that you set this to a meaningful string to make it easier to identify your widget, and where it is used. >= 1 characters <= 254 characters',
      summary: '>= 1 characters <= 254 characters',
    }),
    offlabel: Flags.boolean({
      default: false,
      description: 'Do not show any Cloudflare branding on the widget (ENT only)',
    }),
    region: Flags.string({
      default: 'world',
      description: 'Region where this widget can be used',
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(New)
    const {account, apiKey, ...args} = flags

    if ((args.name?.length || 0) === 0 && args.domains.length > 0) {
      args.name = args.domains.at(0) as string
    }

    const site = await createTurnstileWidget(apiKey, account, args)
    console.table(site)
  }
}
