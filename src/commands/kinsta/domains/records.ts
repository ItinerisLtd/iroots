import { Flags } from '@oclif/core'

import { KinstaCommand } from '../../../lib/commands/kinsta-command.js'
import { getVerificationRecordsForDomain } from '../../../lib/kinsta.js'

export default class Records extends KinstaCommand {
  static description = 'Get verification records for a domain on a site environment'
  static flags = {
    // eslint-disable-next-line camelcase
    site_domain_id: Flags.string({
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Records)

    const response = await getVerificationRecordsForDomain(flags.apiKey, flags.site_domain_id)
    if (response.site_domain.verification_records.length > 0) {
      this.log('Verification Records:')
      for (const record of response.site_domain.verification_records) {
        console.table(record)
      }
    } else if (response.site_domain.pointing_records.length > 0) {
      this.log('Pointing Records:')
      for (const record of response.site_domain.pointing_records) {
        console.table(record)
      }
    } else {
      this.log('No verification or pointing records found for this domain.')
    }
  }
}
