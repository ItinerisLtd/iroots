import {Command, flags} from '@oclif/command'
import cli from 'cli-ux'
import {randomBytes} from 'crypto'
import * as fs from 'fs-extra'
import * as globby from 'globby'
import {homedir} from 'os'
import {replaceInFile} from 'replace-in-file'

import * as composer from '../lib/composer'
import * as gh from '../lib/gh'
import * as git from '../lib/git'
import * as ssh from '../lib/ssh'
import * as trellis from '../lib/trellis'
import * as wp from '../lib/wp'

type QAndA = {
  from: string,
  to: string,
}

type GitHubSecret = {
  name: string,
  value: string,
  remote: string,
}

export default class New extends Command {
  static description = 'describe the command here'
  static strict = false

  static flags = {
    help: flags.help({char: 'h'}),
    site: flags.string({
      char: 's',
      description: 'site key',
      env: 'IROOTS_NEW_SITE',
      required: true,
    }),
    deploy: flags.boolean({
      char: 'd',
      description: 'whether to deploy or not',
      default: true,
      allowNo: true,
    }),
    local: flags.boolean({
      char: 'l',
      description: 'whether to setup local site or not',
      default: true,
      allowNo: true,
    }),
    git_push: flags.boolean({
      description: 'whether to push to git remotes or not',
      default: true,
      allowNo: true,
    }),
    github: flags.boolean({
      description: 'whether to use GH CLI/API or not',
      default: true,
      allowNo: true,
    }),
    github_team: flags.string({
      description: 'the team to add to the created GitHub repositories',
      default: 'php-team',
    }),
    github_team_permission: flags.string({
      description: 'the permission to set for the specified GitHub team',
      default: 'admin',
    }),
    bedrock_remote: flags.string({
      char: 'b',
      description: 'bedrock remote',
      env: 'IROOTS_NEW_BEDROCK_REMOTE',
      required: true,
    }),
    bedrock_remote_branch: flags.string({
      description: 'the branch to use for your new bedrock remote',
      env: 'IROOTS_NEW_BEDROCK_REMOTE_BRANCH',
      default: 'main',
    }),
    bedrock_repo_pat: flags.string({
      description: 'the bedrock personal access token for GitHub Actions to clone trellis',
      env: 'IROOTS_NEW_BEDROCK_REPO_PAT',
      required: true,
    }),
    trellis_remote: flags.string({
      char: 't',
      description: 'trellis remote',
      env: 'IROOTS_NEW_TRELLIS_REMOTE',
      required: true,
    }),
    trellis_remote_branch: flags.string({
      description: 'the branch to use for your new trellis remote',
      env: 'IROOTS_NEW_TRELLIS_REMOTE_BRANCH',
      default: 'main',
    }),
    bedrock_template_remote: flags.string({
      description: 'bedrock template remote',
      env: 'IROOTS_NEW_BEDROCK_TEMPLATE_REMOTE',
      default: 'git@github.com:ItinerisLtd/bedrock.git',
      required: true,
    }),
    bedrock_template_branch: flags.string({
      description: 'bedrock template branch',
      env: 'IROOTS_NEW_BEDROCK_TEMPLATE_BRANCH',
      default: 'master',
      required: true,
    }),
    trellis_template_remote: flags.string({
      description: 'trellis template remote',
      env: 'IROOTS_NEW_TRELLIS_TEMPLATE_REMOTE',
      default: 'git@github.com:ItinerisLtd/trellis-kinsta.git',
      required: true,
    }),
    trellis_template_branch: flags.string({
      description: 'trellis template branch',
      env: 'IROOTS_NEW_TRELLIS_TEMPLATE_BRANCH',
      default: 'master',
      required: true,
    }),
    trellis_template_vault_pass: flags.string({
      description: 'trellis template vault password',
      env: 'IROOTS_NEW_TRELLIS_TEMPLATE_VAULT_PASS',
      required: true,
    }),
  }

  async run(): Promise<void> {
    const {flags} = this.parse(New)
    const {site, deploy, local, git_push, github, github_team, github_team_permission, bedrock_remote, bedrock_remote_branch, trellis_remote, trellis_remote_branch, bedrock_repo_pat, bedrock_template_remote, bedrock_template_branch, trellis_template_remote, trellis_template_branch, trellis_template_vault_pass} = flags

    if (fs.existsSync(site)) {
      this.error(`Abort! Directory ${site} already exists`, {exit: 1})
    }
    fs.ensureDirSync(site)

    const {owner: bedrockRemoteOwner, repo: bedrockRemoteRepo} = await git.parseRemote(bedrock_remote)
    const {owner: trellisRemoteOwner, repo: trellisRemoteRepo} = await git.parseRemote(trellis_remote)
    if (github) {
      cli.action.start('Creating Bedrock and Trellis repos on GitHub')
      await gh.createRepo(bedrockRemoteOwner, bedrockRemoteRepo, {
        teamSlug: github_team,
      })
      await gh.createRepo(trellisRemoteOwner, trellisRemoteRepo, {
        teamSlug: github_team,
      })

      const githubRepoSettings = [
        'delete-branch-on-merge',
        'enable-auto-merge',
      ]
      for (const flag of githubRepoSettings) {
        await gh.editRepo(bedrockRemoteOwner, bedrockRemoteRepo, flag)
        await gh.editRepo(trellisRemoteOwner, trellisRemoteRepo, flag)
      }

      await gh.setTeamPermissions(bedrockRemoteOwner, bedrockRemoteRepo, {
        teamSlug: github_team,
        teamPermission: github_team_permission,
      })
      await gh.setTeamPermissions(trellisRemoteOwner, trellisRemoteRepo, {
        teamSlug: github_team,
        teamPermission: github_team_permission,
      })
      cli.action.stop()
    }

    cli.action.start('Cloning Bedrock template repo')
    await git.clone(bedrock_template_remote, {
      dir: 'bedrock',
      branch: bedrock_template_branch,
      origin: 'upstream',
    }, {
      cwd: site,
    })
    await git.renameCurrentBranch(bedrock_remote_branch, {
      cwd: `${site}/bedrock`,
    })
    await git.removeRemote('upstream', {
      cwd: `${site}/bedrock`,
    })
    await git.addRemote('origin', bedrock_remote, {
      cwd: `${site}/bedrock`,
    })
    cli.action.stop()

    cli.action.start('Cloning Trellis template repo')
    await git.clone(trellis_template_remote, {
      dir: 'trellis',
      branch: trellis_template_branch,
      origin: 'upstream'
    }, {
      cwd: site,
    })
    await git.renameCurrentBranch(trellis_remote_branch, {
      cwd: `${site}/trellis`,
    })
    await git.removeRemote('upstream', {
      cwd: `${site}/trellis`,
    })
    await git.addRemote('origin', trellis_remote, {
      cwd: `${site}/trellis`,
    })
    cli.action.stop()

    cli.action.start(`Writing template vault password into \`${site}/trellis/.vault_pass\``)
    fs.writeFileSync(`${site}/trellis/.vault_pass`, trellis_template_vault_pass)
    cli.action.stop()

    this.log('Initializing Trellis project (this may take some time, be patient)...')
    await trellis.init({
      cwd: `${site}/trellis`,
    })

    cli.action.start('Decrypting vault.yml')
    await trellis.vaultDecrypt('all', {
      cwd: `${site}/trellis`,
    })
    await trellis.vaultDecrypt('development', {
      cwd: `${site}/trellis`,
    })
    await trellis.vaultDecrypt('production', {
      cwd: `${site}/trellis`,
    })
    await trellis.vaultDecrypt('staging', {
      cwd: `${site}/trellis`,
    })
    cli.action.stop()

    cli.action.start('Looking for files to perform search and replace')
    const yamls = await globby([
      `${site}/trellis/hosts/*`,
      `${site}/trellis/group_vars/*/*.yml`,
      `${site}/bedrock/.github/workflows/*.yml`,
      `${site}/bedrock/config/*`,
    ])
    cli.action.stop()

    cli.action.start('Searching for placeholders')
    let placeholderMatches: string[] = []
    yamls.forEach(file => {
      const content = fs.readFileSync(file, 'utf8')
      const regex = /xxx\w+xxx/img
      let match
      while ((match = regex.exec(content)) !== null) {
        placeholderMatches = [...placeholderMatches, match[0]]
      }
    })
    let placeholders = [...new Set(placeholderMatches)].sort()
    cli.action.stop()

    cli.action.start('Q&A')
    let qAndAs: QAndA[] = []
    for (let placeholder of placeholders) {
      let answer = process.env[`IROOTS_NEW_${placeholder}`]
      if (answer === undefined) {
        answer = await cli.prompt(`What is ${placeholder}?`, {type: 'mask'}) as string
      }

      qAndAs = [...qAndAs, {
        from: placeholder,
        to: answer,
      }]
    }
    cli.action.stop()

    cli.action.start('Searching and replacing')
    for (let {from, to} of qAndAs) {
      const regex = new RegExp(from, 'img')

      await replaceInFile({
        files: yamls,
        from: regex,
        to,
      })
    }
    await replaceInFile({
      files: yamls,
      from: /"generateme"/g,
      to: () => randomBytes(64).toString('hex'),
    })
    cli.action.stop()

    cli.action.start(`Rekeying \`${site}/trellis/.vault_pass\``)
    fs.removeSync(`${site}/trellis/.vault_pass`)
    const vaultPass = randomBytes(256).toString('hex')
    fs.writeFileSync(`${site}/trellis/.vault_pass`, vaultPass)
    await trellis.vaultEncrypt('development', {
      cwd: `${site}/trellis`,
    })
    await trellis.vaultEncrypt('production', {
      cwd: `${site}/trellis`,
    })
    await trellis.vaultEncrypt('staging', {
      cwd: `${site}/trellis`,
    })
    cli.action.stop()

    cli.action.start('Commiting Trellis changes')
    await git.add(['.'], {
      cwd: `${site}/trellis`,
    })
    await git.commit('iRoots: Search and replace placeholders', {
      cwd: `${site}/trellis`,
    })
    cli.action.stop()

    cli.action.start('Commiting Bedrock changes')
    await git.add(['.'], {
      cwd: `${site}/bedrock`,
    })
    await git.commit('iRoots: Search and replace placeholders', {
      cwd: `${site}/bedrock`,
    })
    cli.action.stop()

    cli.action.start('Creating SSH Aliases')
    await trellis.alias({
      cwd: `${site}/trellis`,
    })
    const trelliaAliasString = `_:
  inherit: wp-cli.trellis-alias.yml
`
    fs.appendFileSync(`${site}/bedrock/wp-cli.yml`, trelliaAliasString)
    cli.action.stop()

    cli.action.start('Committing SSH Aliases')
    await git.add(['wp-cli.yml', 'wp-cli.trellis-alias.yml'], {
      cwd: `${site}/bedrock`,
    })
    await git.commit('iRoots: Add SSH aliases', {
      cwd: `${site}/bedrock`,
    })
    cli.action.stop()

    if (git_push) {
      cli.action.start('Pushing Trellis changes to new repo')
      await git.push('origin', trellis_remote_branch, {
        cwd: `${site}/trellis`,
      })
      cli.action.stop()

      cli.action.start('Pushing Bedrock changes to new repo')
      await git.push('origin', bedrock_remote_branch, {
        cwd: `${site}/bedrock`,
      })
      await git.push('origin', `${bedrock_remote_branch}:staging`, {
        cwd: `${site}/bedrock`,
      })
      await git.push('origin', `${bedrock_remote_branch}:production`, {
        cwd: `${site}/bedrock`,
      })
      cli.action.stop()
    }

    if (github) {
      cli.action.start('Generating Bedrock repo deploy key')
      const keyName = 'Trellis deploy'
      const keyFilePath = `${homedir()}/.ssh/trellis_${site}_ed25519`
      const deployKey = await ssh.keygen(keyFilePath, {keyName})
      cli.action.stop()

      cli.action.start('Setting Bedrock repo deploy key')
      await gh.setDeployKey(deployKey.public, keyName, bedrockRemoteOwner, bedrockRemoteRepo)
      cli.action.stop()

      cli.action.start('Scanning for known hosts')
      const hostYamls = await globby([
        `${site}/trellis/hosts/*`,
      ])
      let hostMatches: string[] = []
      hostYamls.forEach(file => {
        const content = fs.readFileSync(file, 'utf8')
        const regex = /ansible_host=\d+\.\d+\.\d+\.\d+/img
        let match
        while ((match = regex.exec(content)) !== null) {
          match = match[0].replace('ansible_host=', '')
          hostMatches = [...hostMatches, match]
        }
      })
      const hosts = [...new Set(hostMatches)].sort()
      const sshKnownHosts = await ssh.keyscan(hosts)
      cli.action.stop()

      cli.action.start('Setting Bedrock GitHub repo secrets')
      const repoSecrets: GitHubSecret[] = [
        {
          name: 'REPO_PAT',
          value: bedrock_repo_pat,
          remote: bedrock_remote,
        },
        {
          name: 'TRELLIS_DEPLOY_SSH_PRIVATE_KEY',
          value: deployKey.private,
          remote: bedrock_remote,
        },
        {
          name: 'TRELLIS_DEPLOY_SSH_KNOWN_HOSTS',
          value: sshKnownHosts.join(','),
          remote: bedrock_remote,
        },
        {
          name: 'ANSIBLE_VAULT_PASSWORD',
          value: vaultPass,
          remote: trellis_remote,
        }
      ]

      for (const {name, value, remote} of repoSecrets) {
        await gh.setSecret(name, value, remote)
      }

      cli.action.stop()
    }

    if (local) {
      cli.action.start('Populating local `.env`')
      await trellis.dotenv({
        cwd: `${site}/trellis`,
      })
      cli.action.stop()

      cli.action.start('Installing Bedrock Composer dependencies')
      await composer.install({
        cwd: `${site}/bedrock`,
      })
      cli.action.stop()

      cli.action.start('Creating local database')
      await wp.dbCreate({
        cwd: `${site}/bedrock`,
      })
      cli.action.stop()

      cli.info('Linking Valet site')
      await trellis.valetLink({
        cwd: `${site}/trellis`
      })
    }

    if (deploy) {
      cli.action.start('Installing Ansible Galaxy roles')
      await trellis.galaxyInstall({
        cwd: `${site}/trellis`,
      })
      cli.action.stop()

      cli.action.start('Deploying to staging')
      await trellis.deploy('staging', {
        cwd: `${site}/trellis`,
      })
      cli.action.stop()

      cli.action.start('Deploying to production')
      await trellis.deploy('production', {
        cwd: `${site}/trellis`,
      })
      cli.action.stop()
    }

    if (github) {
      const remoteBranches = [...new Set([bedrock_remote_branch, trellis_remote_branch])].join()
      cli.info(`Don't forget to set your branch protection rules for ${remoteBranches}!`)
      cli.info(`Without branch protection on ${remoteBranches}, Kodiak will not merge any dependency pull requests.`)
    }
  }
}
