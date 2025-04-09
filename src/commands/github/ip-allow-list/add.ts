import {Flags} from '@oclif/core'
import {GitHubCommand} from '../../../lib/commands/github-command.js'
import {createIpAllowListEntry, getEnterpriseId, getOrganizationId} from '../../../lib/gh.js'

type graphQlResponse = {
  data: {
    createIpAllowListEntry: {
      clientMutationId: string
      ipAllowListEntry: {
        allowListValue: string
        createdAt: string
        id: string
        isActive: boolean
        name: string
        owner: string
        updatedAt: string
      }
    }
  }
  extensions: {
    warnings: {
      type: string
      message: string
      data: unknown
      link: string
    }[]
  }
}

export default class Add extends GitHubCommand {
  static description = 'Add an IP address to the GitHub IP allow list.'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    ip: Flags.string({
      description: 'the IP address to allow',
      required: true,
      multiple: true,
      relationships: [
        {
          type: 'some',
          flags: ['org', 'enterprise'],
        },
      ],
    }),
    org: Flags.string({
      description: 'the organisation slug',
      exclusive: ['enterprise'],
    }),
    enterprise: Flags.string({
      description: 'the enterprise slug',
      exclusive: ['org'],
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Add)

    let ownerId = ''
    ownerId = await (flags.enterprise ? getEnterpriseId(flags.enterprise) : getOrganizationId(flags.org as string))
    if (ownerId.length === 0) {
      this.error('invalid owner id')
    }

    const promises = []
    for (const ip in flags.ip) {
      if (!Object.hasOwn(flags.ip, ip)) {
        continue
      }

      promises.push(createIpAllowListEntry(ownerId, flags.ip[ip], `test ${Date.now()}`))
    }

    const results = await Promise.all(promises)
    for (const result of results) {
      const json: graphQlResponse = JSON.parse(result.stdout as string)
      console.log(json.data.createIpAllowListEntry.ipAllowListEntry)
    }
  }
}
