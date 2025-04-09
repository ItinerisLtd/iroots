import {Command} from '@oclif/core'

export abstract class GitHubCommand extends Command {
  static examples = ['<%= config.bin %> <%= command.id %>']

  static baseFlags = {}
}
