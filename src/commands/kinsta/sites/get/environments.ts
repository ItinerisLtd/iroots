import {Flags} from '@oclif/core'
import Get from './index.js'
import {getSiteEnvironments} from '../../../../lib/kinsta.js'

export default class GetEnvironments extends Get {
  static description = 'Get information about environments of a Kinsta site'

  static flags = {
    siteId: Flags.string({
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(GetEnvironments)
    const {apiKey, siteId} = flags

    const environments = await getSiteEnvironments(apiKey, siteId)
    console.log(environments)
  }
}
