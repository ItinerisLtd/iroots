import { Flags } from '@oclif/core'
import { inspect } from 'node:util'

import { getSiteEnvironments } from '../../../../lib/kinsta.js'
import Get from './index.js'

export default class GetEnvironments extends Get {
  static description = 'Get information about environments of a Kinsta site'
  static flags = {
    siteId: Flags.string({
      required: true,
    }),
    format: Flags.string({
      default: 'table',
      options: ['json', 'table'],
      required: false,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(GetEnvironments)
    const { apiKey, siteId, format } = flags

    const environments = await getSiteEnvironments(apiKey, siteId)
    // Allow console.log to show 4 levels deep.
    inspect.defaultOptions.depth = 4
    if (format === 'json') {
      console.log(JSON.stringify(environments))
    } else {
      console.log(environments)
    }
  }
}
