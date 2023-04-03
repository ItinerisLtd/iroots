import {ux, Command, Flags} from '@oclif/core'
import {randomBytes} from 'node:crypto'
import {appendFileSync, readFileSync, existsSync, writeFileSync, rmSync, mkdirSync} from 'node:fs'
import {globby} from 'globby'
import replaceInFilePkg from 'replace-in-file'

// eslint-disable-next-line node/no-missing-import
import * as composer from '../lib/composer.js'
// eslint-disable-next-line node/no-missing-import
import * as gh from '../lib/gh.js'
// eslint-disable-next-line node/no-missing-import
import * as git from '../lib/git.js'
// eslint-disable-next-line node/no-missing-import
import * as trellis from '../lib/trellis.js'
// eslint-disable-next-line node/no-missing-import
import * as wp from '../lib/wp.js'

type QAndA = {
  from: string
  to: string
}

type GitHubSecret = {
  name: string
  value: string
  remote: string
  app: string
}

export default class New extends Command {
  static description = 'describe the command here'
  static strict = false

  static flags = {
    help: Flags.help({char: 'h'}),
    site: Flags.string({
      char: 's',
      description: 'site key',
      env: 'IROOTS_NEW_SITE',
      required: true,
    }),
    deploy: Flags.boolean({
      char: 'd',
      description: 'whether to deploy or not',
      default: false,
      allowNo: true,
    }),
    local: Flags.boolean({
      char: 'l',
      description: 'whether to setup local site or not',
      default: true,
      allowNo: true,
    }),
    git_push: Flags.boolean({
      description: 'whether to push to git remotes or not',
      default: true,
      allowNo: true,
    }),
    github: Flags.boolean({
      description: 'whether to use GH CLI/API or not',
      default: true,
      allowNo: true,
    }),
    github_team: Flags.string({
      description: 'the team to add to the created GitHub repositories',
      default: 'php-team',
    }),
    github_team_permission: Flags.string({
      description: 'the permission to set for the specified GitHub team',
      default: 'maintain',
    }),
    bedrock_remote: Flags.string({
      char: 'b',
      description: 'bedrock importremote',
      env: 'IROOTS_NEW_BEDROCK_REMOTE',
      required: true,
    }),
    bedrock_remote_branch: Flags.string({
      description: 'the branch to use for your new bedrock remote',
      env: 'IROOTS_NEW_BEDROCK_REMOTE_BRANCH',
      default: 'main',
    }),
    bedrock_repo_pat: Flags.string({
      description: 'the bedrock personal access token for GitHub Actions to clone trellis',
      env: 'IROOTS_NEW_BEDROCK_REPO_PAT',
      required: true,
    }),
    trellis_remote: Flags.string({
      char: 't',
      description: 'trellis remote',
      env: 'IROOTS_NEW_TRELLIS_REMOTE',
      required: true,
    }),
    trellis_remote_branch: Flags.string({
      description: 'the branch to use for your new trellis remote',
      env: 'IROOTS_NEW_TRELLIS_REMOTE_BRANCH',
      default: 'main',
    }),
    bedrock_template_remote: Flags.string({
      description: 'bedrock template remote',
      env: 'IROOTS_NEW_BEDROCK_TEMPLATE_REMOTE',
      default: 'git@github.com:ItinerisLtd/bedrock.git',
      required: true,
    }),
    bedrock_template_branch: Flags.string({
      description: 'bedrock template branch',
      env: 'IROOTS_NEW_BEDROCK_TEMPLATE_BRANCH',
      default: 'master',
      required: true,
    }),
    trellis_template_remote: Flags.string({
      description: 'trellis template remote',
      env: 'IROOTS_NEW_TRELLIS_TEMPLATE_REMOTE',
      default: 'git@github.com:ItinerisLtd/trellis-kinsta.git',
      required: true,
    }),
    trellis_template_branch: Flags.string({
      description: 'trellis template branch',
      env: 'IROOTS_NEW_TRELLIS_TEMPLATE_BRANCH',
      default: 'master',
      required: true,
    }),
    theme_template_remote: Flags.string({
      description: 'theme template remote',
      env: 'IROOTS_NEW_THEME_TEMPLATE_REMOTE',
      default: 'git@github.com:ItinerisLtd/sage.git',
      required: true,
    }),
    theme_template_branch: Flags.string({
      description: 'theme template branch',
      env: 'IROOTS_NEW_THEME_TEMPLATE_BRANCH',
      default: 'main',
      required: true,
    }),
    trellis_template_vault_pass: Flags.string({
      description: 'trellis template vault password',
      env: 'IROOTS_NEW_TRELLIS_TEMPLATE_VAULT_PASS',
      required: true,
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(New)
    const {
      site,
      deploy,
      local,
      git_push,
      github,
      github_team,
      github_team_permission,
      bedrock_remote,
      bedrock_remote_branch,
      trellis_remote,
      trellis_remote_branch,
      bedrock_repo_pat,
      bedrock_template_remote,
      bedrock_template_branch,
      theme_template_remote,
      theme_template_branch,
      trellis_template_remote,
      trellis_template_branch,
      trellis_template_vault_pass,
    } = flags

    if (existsSync(site)) {
      this.error(`Abort! Directory ${site} already exists`, {exit: 1})
    }

    mkdirSync(site, {recursive: true})

    const {owner: bedrockRemoteOwner, repo: bedrockRemoteRepo} = await git.parseRemote(bedrock_remote)
    const bedrockRemote = `git@github.com:${bedrockRemoteOwner}/${bedrockRemoteRepo}`
    const {owner: trellisRemoteOwner, repo: trellisRemoteRepo} = await git.parseRemote(trellis_remote)
    const trellisRemote = `git@github.com:${trellisRemoteOwner}/${trellisRemoteRepo}`
    if (github) {
      ux.action.start('Creating Bedrock and Trellis repos on GitHub')
      await gh.createRepo(bedrockRemoteOwner, bedrockRemoteRepo, {
        teamSlug: github_team,
      })
      await gh.createRepo(trellisRemoteOwner, trellisRemoteRepo, {
        teamSlug: github_team,
      })

      const githubRepoSettings = ['delete-branch-on-merge', 'enable-auto-merge', 'allow-update-branch']
      for (const flag of githubRepoSettings) {
        // eslint-disable-next-line no-await-in-loop
        await gh.editRepo(bedrockRemoteOwner, bedrockRemoteRepo, flag)
        // eslint-disable-next-line no-await-in-loop
        await gh.editRepo(trellisRemoteOwner, trellisRemoteRepo, flag)
      }

      await gh.setTeamPermissions(bedrockRemoteOwner, bedrockRemoteRepo, {
        teamSlug: 'senior-team',
        teamPermission: 'admin',
      })
      await gh.setTeamPermissions(bedrockRemoteOwner, bedrockRemoteRepo, {
        teamSlug: github_team,
        teamPermission: github_team_permission,
      })
      await gh.setTeamPermissions(trellisRemoteOwner, trellisRemoteRepo, {
        teamSlug: 'senior-team',
        teamPermission: 'admin',
      })
      await gh.setTeamPermissions(trellisRemoteOwner, trellisRemoteRepo, {
        teamSlug: github_team,
        teamPermission: github_team_permission,
      })
      ux.action.stop()
    }

    ux.action.start('Cloning Bedrock template repo')
    await git.clone(
      bedrock_template_remote,
      {
        dir: 'bedrock',
        branch: bedrock_template_branch,
        origin: 'upstream',
      },
      {
        cwd: site,
      },
    )
    await git.renameCurrentBranch(bedrock_remote_branch, {
      cwd: `${site}/bedrock`,
    })
    await git.removeRemote('upstream', {
      cwd: `${site}/bedrock`,
    })
    await git.addRemote('origin', bedrockRemote, {
      cwd: `${site}/bedrock`,
    })
    ux.action.stop()

    ux.action.start('Cloning theme template repo')
    await git.clone(theme_template_remote, {
      dir: `${site}/bedrock/web/app/themes/${site}`,
      branch: theme_template_branch,
    })
    rmSync(`${site}/bedrock/web/app/themes/${site}/.git`, {recursive: true, force: true})
    rmSync(`${site}/bedrock/web/app/themes/${site}/.github`, {recursive: true, force: true})
    rmSync(`${site}/bedrock/web/app/themes/${site}/.circleci`, {recursive: true, force: true})
    ux.action.stop()

    ux.action.start('Cloning Trellis template repo')
    await git.clone(
      trellis_template_remote,
      {
        dir: 'trellis',
        branch: trellis_template_branch,
        origin: 'upstream',
      },
      {
        cwd: site,
      },
    )
    await git.renameCurrentBranch(trellis_remote_branch, {
      cwd: `${site}/trellis`,
    })
    await git.removeRemote('upstream', {
      cwd: `${site}/trellis`,
    })
    await git.addRemote('origin', trellisRemote, {
      cwd: `${site}/trellis`,
    })
    ux.action.stop()

    ux.action.start(`Writing template vault password into \`${site}/trellis/.vault_pass\``)
    writeFileSync(`${site}/trellis/.vault_pass`, trellis_template_vault_pass)
    ux.action.stop()

    this.log('Initializing Trellis project (this may take some time, be patient)...')
    await trellis.init({
      cwd: `${site}/trellis`,
    })

    ux.action.start('Decrypting vault.yml')
    await trellis.vaultDecrypt('development', {
      cwd: `${site}/trellis`,
    })
    await trellis.vaultDecrypt('production', {
      cwd: `${site}/trellis`,
    })
    await trellis.vaultDecrypt('staging', {
      cwd: `${site}/trellis`,
    })
    ux.action.stop()

    ux.action.start('Looking for files to perform search and replace')
    const yamls = await globby([
      `${site}/trellis/hosts/*`,
      `${site}/trellis/group_vars/*/*.yml`,
      `${site}/bedrock/.github/workflows/*.yml`,
      `${site}/bedrock/config/*`,
      `${site}/bedrock/web/app/themes/${site}/style.css`,
    ])
    ux.action.stop()

    ux.action.start('Searching for placeholders')
    let placeholderMatches: string[] = []
    for (const file of yamls) {
      const content = readFileSync(file, 'utf8')
      const regex = /xxx\w+xxx/gim
      let match
      while ((match = regex.exec(content)) !== null) {
        placeholderMatches = [...placeholderMatches, match[0]]
      }
    }

    const placeholders = [...new Set(placeholderMatches)].sort()
    ux.action.stop()

    ux.action.start('Q&A')
    let qAndAs: QAndA[] = []
    for (const placeholder of placeholders) {
      let answer = process.env[`IROOTS_NEW_${placeholder}`]
      if (answer === undefined) {
        // eslint-disable-next-line no-await-in-loop
        answer = (await ux.prompt(`What is ${placeholder}?`, {type: 'mask'})) as string
      }

      qAndAs = [
        ...qAndAs,
        {
          from: placeholder,
          to: answer,
        },
      ]
    }

    ux.action.stop()

    ux.action.start('Searching and replacing')
    const {replaceInFile} = replaceInFilePkg
    for (const {from, to} of qAndAs) {
      const regex = new RegExp(from, 'img')

      // eslint-disable-next-line no-await-in-loop
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
    ux.action.stop()

    ux.action.start(`Rekeying \`${site}/trellis/.vault_pass\``)
    rmSync(`${site}/trellis/.vault_pass`, {recursive: true, force: true})
    const vaultPass = randomBytes(256).toString('hex')
    writeFileSync(`${site}/trellis/.vault_pass`, vaultPass)
    await trellis.vaultEncrypt('development', {
      cwd: `${site}/trellis`,
    })
    await trellis.vaultEncrypt('production', {
      cwd: `${site}/trellis`,
    })
    await trellis.vaultEncrypt('staging', {
      cwd: `${site}/trellis`,
    })
    ux.action.stop()

    ux.action.start('Commiting Trellis changes')
    await git.add(['.'], {
      cwd: `${site}/trellis`,
    })
    await git.commit('iRoots: Search and replace placeholders', {
      cwd: `${site}/trellis`,
    })
    ux.action.stop()

    ux.action.start('Commiting Bedrock changes')
    await git.add([`web/app/themes/${site}`], {
      cwd: `${site}/bedrock`,
    })
    await git.commit('iRoots: Add theme', {
      cwd: `${site}/bedrock`,
    })
    await git.add(['.'], {
      cwd: `${site}/bedrock`,
    })
    await git.commit('iRoots: Search and replace placeholders', {
      cwd: `${site}/bedrock`,
    })
    ux.action.stop()

    ux.action.start('Creating SSH Aliases')
    await trellis.alias({
      cwd: `${site}/trellis`,
    })
    const trelliaAliasString = `_:
  inherit: wp-cli.trellis-alias.yml
`
    appendFileSync(`${site}/bedrock/wp-cli.yml`, trelliaAliasString)
    ux.action.stop()

    ux.action.start('Committing SSH Aliases')
    await git.add(['wp-cli.yml', 'wp-cli.trellis-alias.yml'], {
      cwd: `${site}/bedrock`,
    })
    await git.commit('iRoots: Add SSH aliases', {
      cwd: `${site}/bedrock`,
    })
    ux.action.stop()

    if (git_push) {
      ux.action.start('Pushing Trellis changes to new repo')
      await git.push('origin', trellis_remote_branch, {
        cwd: `${site}/trellis`,
      })
      ux.action.stop()

      ux.action.start('Pushing Bedrock changes to new repo')
      await git.push('origin', bedrock_remote_branch, {
        cwd: `${site}/bedrock`,
      })
      await git.push('origin', `${bedrock_remote_branch}:staging`, {
        cwd: `${site}/bedrock`,
      })
      await git.push('origin', `${bedrock_remote_branch}:production`, {
        cwd: `${site}/bedrock`,
      })
      ux.action.stop()
    }

    if (github) {
      ux.action.start('Creating branch protection rules')
      await gh.createBranchProtection(
        {
          owner: bedrockRemoteOwner,
          repo: bedrockRemoteRepo,
          branch: bedrock_remote_branch,
          isAdminEnforced: true,
          requiresApprovingReviews: true,
          requiresStatusChecks: true,
          requiresStrictStatusChecks: true,
        },
        {
          shell: true,
        },
      )
      await gh.createBranchProtection(
        {
          owner: trellisRemoteOwner,
          repo: trellisRemoteRepo,
          branch: trellis_remote_branch,
          isAdminEnforced: true,
          requiresApprovingReviews: true,
          requiresStatusChecks: true,
          requiresStrictStatusChecks: true,
        },
        {
          shell: true,
        },
      )
      ux.action.stop()

      ux.action.start('Scanning for known hosts')
      const hostYamls = await globby([`${site}/trellis/hosts/*`])
      let hostMatches: string[] = []
      for (const file of hostYamls) {
        const content = readFileSync(file, 'utf8')
        const regex = /ansible_host=(?:\d+\.){3}\d+/gim
        let match
        while ((match = regex.exec(content)) !== null) {
          match = match[0].replace('ansible_host=', '')
          hostMatches = [...hostMatches, match]
        }
      }

      const sshKnownHosts = [...new Set(hostMatches)].sort()
      ux.action.stop()

      ux.action.start('Generating Bedrock deploy key')
      await trellis.keyGenerate(`${bedrockRemoteOwner}/${bedrockRemoteRepo}`, sshKnownHosts, {
        cwd: `${site}/trellis`,
      })
      ux.action.stop()

      ux.action.start('Setting additional Bedrock repo secrets')
      const repoSecrets: GitHubSecret[] = [
        {
          name: 'REPO_PAT',
          value: bedrock_repo_pat,
          remote: bedrock_remote,
          app: 'actions',
        },
        {
          name: 'ANSIBLE_VAULT_PASSWORD',
          value: vaultPass,
          remote: bedrock_remote,
          app: 'actions',
        },
        {
          name: 'ANSIBLE_VAULT_PASSWORD',
          value: vaultPass,
          remote: trellis_remote,
          app: 'actions',
        },
        {
          name: 'THEME_NAME',
          value: site,
          remote: bedrock_remote,
          app: 'codespaces',
        },
      ]

      for (const {name, value, remote} of repoSecrets) {
        // eslint-disable-next-line no-await-in-loop
        await gh.setSecret(name, value, remote)
      }

      ux.action.stop()
    }

    if (local) {
      ux.action.start('Populating local `.env`')
      await trellis.dotenv({
        cwd: `${site}/trellis`,
      })
      ux.action.stop()

      ux.action.start('Installing Bedrock Composer dependencies')
      await composer.install({
        cwd: `${site}/bedrock`,
      })
      ux.action.stop()

      ux.action.start('Creating local database')
      await wp.dbCreate({
        cwd: `${site}/bedrock`,
      })
      ux.action.stop()

      ux.info('Linking Valet site')
      await trellis.valetLink({
        cwd: `${site}/trellis`,
      })
    }

    if (deploy) {
      ux.action.start('Installing Ansible Galaxy roles')
      await trellis.galaxyInstall({
        cwd: `${site}/trellis`,
      })
      ux.action.stop()

      ux.action.start('Deploying to staging')
      await trellis.deploy('staging', {
        cwd: `${site}/trellis`,
      })
      ux.action.stop()

      ux.action.start('Deploying to production')
      await trellis.deploy('production', {
        cwd: `${site}/trellis`,
      })
      ux.action.stop()
    }

    if (github) {
      const remoteBranches = [...new Set([bedrock_remote_branch, trellis_remote_branch])].join(',')
      ux.info(`Don't forget to set your branch protection rules for ${remoteBranches}!`)
    }
  }
}
