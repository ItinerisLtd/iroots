import { Flags } from '@oclif/core'

import { StatusCakeCommand } from '../../../lib/commands/statuscake-command.js'
import { createUptimeTest } from '../../../lib/statuscake.js'

export default class New extends StatusCakeCommand {
  static description = 'Create a new uptime monitor'
  static examples = ['<%= config.bin %> <%= command.id %>']
  static flags = {
    // eslint-disable-next-line camelcase
    basic_password: Flags.string({}),
    // eslint-disable-next-line camelcase
    basic_username: Flags.string({}),
    // eslint-disable-next-line camelcase
    check_rate: Flags.integer({
      default: 60,
      description: 'Number of seconds between checks',
      options: ['0', '30', '60', '300', '900', '1800', '3600', '86400'],
    }),
    confirmation: Flags.string({}),
    // eslint-disable-next-line camelcase
    contact_groups: Flags.string({
      description: 'List of contact group IDs',
      env: 'IROOTS_STATUSCAKE_UPTIME_NEW_CONTACT_GROUP_IDS',
    }),
    // eslint-disable-next-line camelcase
    custom_header: Flags.string({}),
    // eslint-disable-next-line camelcase
    dns_ips: Flags.string({}),
    // eslint-disable-next-line camelcase
    dns_server: Flags.string({}),
    // eslint-disable-next-line camelcase
    do_not_find: Flags.string({}),
    // eslint-disable-next-line camelcase
    enable_ssl_alert: Flags.string({}),
    // eslint-disable-next-line camelcase
    final_endpoint: Flags.string({}),
    // eslint-disable-next-line camelcase
    find_string: Flags.string({}),
    // eslint-disable-next-line camelcase
    follow_redirects: Flags.string({}),
    host: Flags.string({}),
    // eslint-disable-next-line camelcase
    include_header: Flags.string({}),
    name: Flags.string({
      description: 'Name of the check. If ommitted, we will extract the domain from --website_url and use this.',
      required: false,
    }),
    paused: Flags.string({}),
    port: Flags.string({}),
    // eslint-disable-next-line camelcase
    post_body: Flags.string({}),
    // eslint-disable-next-line camelcase
    post_raw: Flags.string({}),
    regions: Flags.string({
      default: ['london'],
      multiple: true,
    }),
    // eslint-disable-next-line camelcase
    status_codes_csv: Flags.string({}),
    tags: Flags.string({}),
    // eslint-disable-next-line camelcase
    test_type: Flags.string({
      default: 'HEAD',
      description: 'Uptime check type',
      options: ['DNS', 'HEAD', 'HTTP', 'PING', 'SMTP', 'SSH', 'TCP'],
    }),
    timeout: Flags.string({}),
    // eslint-disable-next-line camelcase
    trigger_rate: Flags.string({}),
    // eslint-disable-next-line camelcase
    use_jar: Flags.string({}),
    // eslint-disable-next-line camelcase
    user_agent: Flags.string({}),
    // eslint-disable-next-line camelcase
    website_url: Flags.string({
      description: 'URL or IP address of the server under test',
      required: true,
    }),
  }
  static help: 'see https://developers.statuscake.com/api/#tag/uptime/operation/create-uptime-test for more info'

  public async run(): Promise<void> {
    const { flags } = await this.parse(New)

    if (!flags.name) {
      const url = new URL(flags.website_url)
      flags.name = url.hostname
    }

    const test = await createUptimeTest(flags.apiKey, flags)
    console.log(test)
  }
}
