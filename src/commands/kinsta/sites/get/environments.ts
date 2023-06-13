import {Flags} from '@oclif/core'
// eslint-disable-next-line node/no-missing-import
import Get from './index.js'
// eslint-disable-next-line node/no-missing-import
import {getSiteEnvironments} from '../../../../lib/kinsta.js'

export default class GetEnvironments extends Get {
  static description = 'describe the command here'

  static flags = {
    siteId: Flags.string({
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(GetEnvironments)
    const {apiKey, siteId} = flags

    const environments = await getSiteEnvironments(apiKey, siteId)
    console.table(environments)
  }
}
