import {ux, Command, Flags} from '@oclif/core'
import {randomBytes} from 'node:crypto'
import {appendFileSync, readFileSync, existsSync, writeFileSync, rmSync, mkdirSync} from 'node:fs'
import {globby} from 'globby'
import {replaceInFile} from 'replace-in-file'

import * as composer from '../lib/composer.js'
import * as gh from '../lib/gh.js'
import * as git from '../lib/git.js'
import * as trellis from '../lib/trellis.js'
import * as wp from '../lib/wp.js'
import {findLastMatch, slugify} from '../lib/misc.js'
import {createApiKey} from '../lib/sendgrid.js'
import {createToken} from '../lib/packagist.js'
import {
  cloneEnvironment,
  createSite as createKinstaSite,
  getSite,
  getSiteEnvironments,
  setPhpVersion,
  envNamesToCloneEnvironmentArgs,
} from '../lib/kinsta.js'
import {createProject, getAllProjectKeys} from '../lib/sentry.js'
import {createSite as createTurnstileSite} from '../lib/cloudflare.js'

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
  static description = 'Create a new project'
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
    theme_clone: Flags.boolean({
      description: 'whether or not to clone the theme',
      env: 'IROOTS_NEW_THEME_CLONE',
      default: true,
      required: false,
      allowNo: true,
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
    multisite: Flags.boolean({
      description: 'whether or not to setup a WordPress multisite network',
      env: 'IROOTS_NEW_IS_MULTISITE',
      required: false,
      default: false,
    }),
    network_media_library_site_id: Flags.integer({
      description: 'the site ID you wish to use for the network media library',
      env: 'IROOTS_NEW_NETWORK_MEDIA_LIBRARY_SITE_ID',
      required: false,
      default: 2,
      dependsOn: ['multisite'],
    }),
    packagist: Flags.boolean({
      description: 'whether or not to create a Private Packagist token for the new project',
      default: true,
      allowNo: true,
    }),
    packagist_api_key: Flags.string({
      description: 'The API key',
      env: 'IROOTS_PACKAGIST_API_KEY',
      required: true,
      dependsOn: ['packagist'],
    }),
    packagist_api_secret: Flags.string({
      description: 'The API SECRET',
      env: 'IROOTS_PACKAGIST_API_SECRET',
      required: true,
      dependsOn: ['packagist'],
    }),
    sendgrid: Flags.boolean({
      description: 'whether or not to create a SendGrid API key for the new project',
      default: true,
      allowNo: true,
    }),
    sendgrid_api_key: Flags.string({
      description: 'the SendGrid API key used to send requests to their API',
      env: 'IROOTS_SENDGRID_API_KEY',
      required: true,
      dependsOn: ['sendgrid'],
    }),
    kinsta: Flags.boolean({
      description: 'whether or not to create A Kinsta site',
      default: true,
      allowNo: true,
    }),
    kinsta_api_key: Flags.string({
      description: 'the API key for using the Kinsta API',
      env: 'IROOTS_KINSTA_API_KEY',
      required: true,
      dependsOn: ['kinsta'],
    }),
    kinsta_company: Flags.string({
      description: 'the company ID of your Kinsta account',
      env: 'IROOTS_KINSTA_COMPANY_ID',
      required: true,
      dependsOn: ['kinsta'],
    }),
    kinsta_php_version: Flags.string({
      description: 'the PHP version to set on site environments',
      env: 'IROOTS_KINSTA_PHP_VERSION',
      options: ['8.0', '8.1', '8.2'],
      default: '8.1',
      required: true,
      dependsOn: ['kinsta'],
    }),
    kinsta_free_environments: Flags.string({
      description: 'the additional free environment names you wish to create',
      env: 'IROOTS_NEW_KINSTA_FREE_ENVIRONMENTS',
      default: ['Staging'],
      multiple: true,
    }),
    kinsta_premium_environments: Flags.string({
      description: 'the additional premium environment names you wish to create',
      env: 'IROOTS_NEW_KINSTA_PREMIUM_ENVIRONMENTS',
      default: ['UAT'],
      multiple: true,
    }),
    sentry: Flags.boolean({
      description: 'whether or not to create a Sentry project',
      default: true,
      allowNo: true,
    }),
    sentry_api_key: Flags.string({
      description: 'The API key',
      env: 'IROOTS_SENTRY_API_KEY',
      required: true,
      dependsOn: ['sentry'],
    }),
    sentry_organisation_slug: Flags.string({
      required: true,
      env: 'IROOTS_SENTRY_ORGANISATION_SLUG',
      description: 'The slug of the organization the resource belongs to.',
      dependsOn: ['sentry'],
    }),
    sentry_team_slug: Flags.string({
      required: true,
      env: 'IROOTS_SENTRY_TEAM_SLUG',
      description: 'The slug of the organization the resource belongs to.',
      dependsOn: ['sentry'],
    }),
    sentry_project_slug: Flags.string({
      required: false,
      description: 'Uniquely identifies a project. If ommitted, we will use the project display name.',
      dependsOn: ['sentry'],
    }),
    sentry_project_platform: Flags.string({
      required: true,
      default: 'php',
      description: 'The platform for the project.',
      dependsOn: ['sentry'],
    }),
    sentry_project_default_rules: Flags.boolean({
      required: false,
      default: true,
      description:
        'Defaults to true where the behavior is to alert the user on every new issue. Setting this to false will turn this off and the user must create their own alerts to be notified of new issues.',
      dependsOn: ['sentry'],
    }),
    display_name: Flags.string({
      description: 'the display name for the site',
      env: 'IROOTS_NEW_DISPLAY_NAME',
      required: true,
      relationships: [
        {
          type: 'some',
          flags: ['kinsta', 'sentry'],
        },
      ],
    }),
    wp_ssh_aliases: Flags.boolean({
      description: 'whether to generate SSH aliases for WP CLI or not',
      env: 'IROOTS_NEW_WP_CLI_SSH_ALIASES',
      required: false,
      default: true,
      allowNo: true,
    }),
    turnstile: Flags.boolean({
      description: 'whether or not to create a Clouflare Turnstile instance',
      default: false,
      allowNo: true,
    }),
    turnstile_api_key: Flags.string({
      description: 'The API key',
      env: 'IROOTS_CLOUDFLARE_API_KEY',
      required: true,
      dependsOn: ['turnstile'],
    }),
    turnstile_account: Flags.string({
      description: 'The account identifier',
      required: true,
      env: 'IROOTS_CLOUDFLARE_ACCOUNT_ID',
      dependsOn: ['turnstile'],
    }),
  }

  // eslint-disable-next-line no-warning-comments
  // TODO: needs a nice refactor.
  // eslint-disable-next-line complexity
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
      theme_clone,
      theme_template_remote,
      theme_template_branch,
      trellis_template_remote,
      trellis_template_branch,
      trellis_template_vault_pass,
      multisite,
      network_media_library_site_id,
      packagist,
      packagist_api_key,
      packagist_api_secret,
      sendgrid,
      sendgrid_api_key,
      kinsta,
      kinsta_api_key,
      kinsta_company,
      kinsta_php_version,
      kinsta_free_environments,
      kinsta_premium_environments,
      sentry,
      sentry_api_key,
      sentry_organisation_slug,
      sentry_team_slug,
      sentry_project_slug,
      sentry_project_platform,
      sentry_project_default_rules,
      display_name,
      wp_ssh_aliases,
      turnstile,
      turnstile_account,
      turnstile_api_key,
    } = flags

    if (existsSync(site)) {
      this.error(`Abort! Directory ${site} already exists`, {exit: 1})
    }

    mkdirSync(site, {recursive: true})

    const {owner: bedrockRemoteOwner, repo: bedrockRemoteRepo} = await git.parseRemote(bedrock_remote)
    const bedrockRemote = `git@github.com:${bedrockRemoteOwner}/${bedrockRemoteRepo}`
    const {owner: trellisRemoteOwner, repo: trellisRemoteRepo} = await git.parseRemote(trellis_remote)
    const trellisRemote = `git@github.com:${trellisRemoteOwner}/${trellisRemoteRepo}`

    // Create Kinsta site
    if (kinsta) {
      const secondsToWait = 10
      ux.action.start('Creating Kinsta site live environment')
      const createSiteResponse = await createKinstaSite(kinsta_api_key, {
        company: kinsta_company,
        display_name: display_name,
        region: 'europe-west2',
      })
      const {idSite: kinstaSiteId, idEnv: kinstaProductionEnvId} = createSiteResponse.data
      ux.action.stop()

      ux.action.start(`Setting PHP version to ${kinsta_php_version}`)
      // Wait a bit to ensure the site is ready to query.
      await ux.wait(secondsToWait * 1000)
      await setPhpVersion(kinsta_api_key, kinstaProductionEnvId, kinsta_php_version)
      ux.action.stop()

      const kinstaEnvironments = [
        ...envNamesToCloneEnvironmentArgs(kinsta_free_environments, kinstaProductionEnvId, false),
        ...envNamesToCloneEnvironmentArgs(kinsta_premium_environments, kinstaProductionEnvId, true),
      ]
      if (kinstaEnvironments.length > 0) {
        // Create environments sequentially to prevent async Kinsta errors.
        for (const env of kinstaEnvironments) {
          /* eslint-disable no-await-in-loop */
          ux.action.start(`Creating Kinsta site ${env.display_name} environment`)
          // Wait a bit to ensure the site is ready to query.
          await ux.wait(secondsToWait * 1000)
          const kinstaSiteLive = await getSite(kinsta_api_key, kinstaSiteId)
          const kinstaSiteName = kinstaSiteLive.name
          process.env.IROOTS_NEW_xxxKINSTA_SSH_USERNAMExxx = kinstaSiteName

          // Wait a bit to ensure the site is ready to query.
          await ux.wait(secondsToWait * 1000)
          await cloneEnvironment(kinsta_api_key, kinstaSiteId, env)
          ux.action.stop()
          /* eslint-enable no-await-in-loop */
        }

        ux.action.start('Gathering environment details')
        await ux.wait(secondsToWait * 1000)
        const kinstaSiteEnvironments = await getSiteEnvironments(kinsta_api_key, kinstaSiteId)
        for (const env of kinstaSiteEnvironments) {
          // Kinsta do not provide slugged environment names, so we try to replicate.
          const envNameUppercase = slugify(env.display_name).toUpperCase()
          process.env[`IROOTS_NEW_xxx${envNameUppercase}_SSH_PORTxxx`] = env.ssh_connection.ssh_port.toString()
          // Kinsta use the same IP for all environments.
          process.env.IROOTS_NEW_SSH_IP = env.ssh_connection.ssh_ip.external_ip
          process.env.IROOTS_NEW_xxxSSH_IPxxx = process.env.IROOTS_NEW_SSH_IP
        }

        ux.action.stop()
      }
    }

    // Generate a Private Packagist token
    if (packagist) {
      ux.action.start('Creating Packagist API key')
      const response = await createToken(packagist_api_key, packagist_api_secret, {
        description: trellisRemoteRepo,
        access: 'read',
        accessToAllPackages: true,
      })
      if (response.status === 'error' || !response.token) {
        this.error(response.message.trim())
      }

      process.env.IROOTS_NEW_xxxPRIVATE_PACKAGIST_PASSWORDxxx = response.token
      ux.action.stop()
    }

    // Generate a SendGrid API key
    if (sendgrid) {
      ux.action.start('Creating SendGrid API key')
      const response = await createApiKey(sendgrid_api_key, trellisRemoteRepo, ['mail.send'])
      if (response.errors) {
        console.table(response.errors)
        this.exit(1)
      }

      process.env.IROOTS_NEW_xxxSENDGRID_API_KEYxxx = response.api_key
      ux.action.stop()
    }

    if (sentry) {
      ux.action.start('Creating Sentry project and keys')
      const createSentryProjectResponse = await createProject({
        apiKey: sentry_api_key,
        organisationSlug: sentry_organisation_slug,
        teamSlug: sentry_team_slug,
        name: display_name,
        slug: sentry_project_slug,
        platform: sentry_project_platform,
        defaultRules: sentry_project_default_rules,
      })
      if (createSentryProjectResponse) {
        const projectKeys = await getAllProjectKeys(
          sentry_api_key,
          sentry_organisation_slug,
          createSentryProjectResponse.slug,
        )
        const firstProjectKeys = projectKeys.shift()
        const secretDsn = firstProjectKeys?.dsn.secret

        process.env.IROOTS_NEW_xxxWP_SENTRY_PHP_DSNxxx = secretDsn
      }

      ux.action.stop()
    }

    if (turnstile) {
      ux.action.start('Creating Turnstile instance')

      const domains = [
        process.env.IROOTS_NEW_xxxDEV_DOMAINxxx,
        process.env.IROOTS_NEW_xxxSTAGING_DOMAINxxx,
        process.env.IROOTS_NEW_xxxUAT_DOMAINxxx,
        process.env.IROOTS_NEW_xxxLIVE_DOMAINxxx,
      ].filter(Boolean)
      const createTurnstileSiteResponse = await createTurnstileSite(turnstile_api_key, turnstile_account, {
        bot_fight_mode: false,
        clearance_level: 'no_clearance',
        domains,
        mode: 'managed',
        name: display_name,
        offlabel: false,
        region: 'world',
      })
      if (createTurnstileSiteResponse) {
        const {sitekey, secret} = createTurnstileSiteResponse

        ux.info(`Cloudflare Turnstile siteKey: ${sitekey}`)
        ux.info(`Cloudflare Turnstile secret: ${secret}`)

        process.env.IROOTS_NEW_xxxCLOUDFLARE_TURNSTILE_SITE_KEY = sitekey
        process.env.IROOTS_NEW_xxxCLOUDFLARE_TURNSTILE_SECRET = secret
      }

      ux.action.stop()
    }

    if (github) {
      ux.action.start('Creating Bedrock and Trellis repos on GitHub')
      await gh.createRepo(bedrockRemoteOwner, bedrockRemoteRepo, {
        teamSlug: github_team,
      })
      await gh.createRepo(trellisRemoteOwner, trellisRemoteRepo, {
        teamSlug: github_team,
      })

      const githubRepoSettings = ['delete-branch-on-merge', 'allow-update-branch']
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

    if (theme_clone) {
      ux.action.start('Cloning theme template repo')
      await git.clone(theme_template_remote, {
        dir: `${site}/bedrock/web/app/themes/${site}`,
        branch: theme_template_branch,
      })
      rmSync(`${site}/bedrock/web/app/themes/${site}/.git`, {recursive: true, force: true})
      rmSync(`${site}/bedrock/web/app/themes/${site}/.github`, {recursive: true, force: true})
      rmSync(`${site}/bedrock/web/app/themes/${site}/.circleci`, {recursive: true, force: true})
      ux.action.stop()
    }

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
    const environments = await trellis.getEnvironments(`${site}/trellis`)
    const pushToEnvironments = environments.filter(env => !['development', 'production'].includes(env))
    for (const env of environments) {
      // eslint-disable-next-line no-await-in-loop
      await trellis.vaultDecrypt(env, {
        cwd: `${site}/trellis`,
      })
    }

    ux.action.stop()

    ux.action.start('Looking for files to perform search and replace')
    const filesToReplace = [
      `${site}/trellis/hosts/*`,
      `${site}/trellis/group_vars/*/*.yml`,
      `${site}/bedrock/.github/workflows/*.yml`,
      `${site}/bedrock/config/*`,
    ]
    if (theme_clone) {
      filesToReplace.push(
        `${site}/bedrock/web/app/themes/${site}/style.css`,
        `${site}/bedrock/web/app/themes/${site}/*.config.*`,
        `${site}/bedrock/web/app/themes/${site}/app/View/Composers/*.php`,
      )
    }

    const yamls = await globby(filesToReplace)
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

    // Cron schedule. Random choice with `step` from `firstHour` to `lastHour`.
    const firstHour = 10
    const lastHour = 14
    const step = 1
    const hours = Array.from({length: (lastHour - firstHour) / step + 1}, (_, index) => firstHour + index * step)
    const chosenHour = Math.floor(Math.random() * hours.length)
    const cronValue = `0 ${hours[chosenHour]} * * 1,2,3,4,5`
    await replaceInFile({
      files: `${site}/bedrock/.github/workflows/cd.yml`,
      from: /cron: .*/g,
      to: `cron: "${cronValue}"`,
    })

    ux.action.stop()

    ux.action.start(`Rekeying \`${site}/trellis/.vault_pass\``)
    rmSync(`${site}/trellis/.vault_pass`, {recursive: true, force: true})
    const vaultPass = randomBytes(256).toString('hex')
    writeFileSync(`${site}/trellis/.vault_pass`, vaultPass)
    for (const env of environments) {
      // eslint-disable-next-line no-await-in-loop
      await trellis.vaultEncrypt(env, {
        cwd: `${site}/trellis`,
      })
    }

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
    if (theme_clone) {
      await git.add([`web/app/themes/${site}`], {
        cwd: `${site}/bedrock`,
      })
      await git.commit('iRoots: Add theme', {
        cwd: `${site}/bedrock`,
      })
    }

    await git.add(['.'], {
      cwd: `${site}/bedrock`,
    })
    await git.commit('iRoots: Search and replace placeholders', {
      cwd: `${site}/bedrock`,
    })
    ux.action.stop()

    if (wp_ssh_aliases) {
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
    }

    if (multisite) {
      ux.action.start('Configuring Multisite')
      const composerRequirePackages = [
        'itinerisltd/network-media-library',
        'itinerisltd/multisite-url-fixer',
        'wpackagist-plugin/threewp-broadcast',
      ]
      for (const dependency of composerRequirePackages) {
        // eslint-disable-next-line no-await-in-loop
        await composer.require(dependency, ['--no-install'], {
          cwd: `${site}/bedrock`,
        })
        // eslint-disable-next-line no-await-in-loop
        await git.add(['composer.json', 'composer.lock'], {
          cwd: `${site}/bedrock`,
        })
        // eslint-disable-next-line no-await-in-loop
        await git.commit(`iRoots: add \`${dependency}\``, {
          cwd: `${site}/bedrock`,
        })
      }

      const composerRemovePackages = [
        // Why? It is not compatible with `itinerisltd/network-media-library`.
        'itinerisltd/wp-media-folder',
      ]

      for (const dependency of composerRemovePackages) {
        // eslint-disable-next-line no-await-in-loop
        await composer.remove(dependency, ['--no-install'], {
          cwd: `${site}/bedrock`,
        })
        // eslint-disable-next-line no-await-in-loop
        await git.add(['composer.json', 'composer.lock'], {
          cwd: `${site}/bedrock`,
        })
        // eslint-disable-next-line no-await-in-loop
        await git.commit(`iRoots: remove \`${dependency}\``, {
          cwd: `${site}/bedrock`,
        })
      }

      appendFileSync(
        `${site}/bedrock/web/app/mu-plugins/site/Hooks/filters.php`,
        wp.multisiteNetworkMediaLibrarySiteIdFilter(network_media_library_site_id),
      )
      await git.add([`web/app/mu-plugins/site/Hooks/filters.php`], {
        cwd: `${site}/bedrock`,
      })
      await git.commit('iRoots: add `network-media-library` site ID config', {
        cwd: `${site}/bedrock`,
      })

      const bedrockConfigFile = `${site}/bedrock/config/application.php`
      const bedrockConfigFileContents = readFileSync(bedrockConfigFile, 'utf8')
      let hasInsertedMultisiteBedrockConstants = false
      const pattern = /Config::define(.*);/gm
      const lastMatch = findLastMatch(bedrockConfigFileContents, pattern)
      if (lastMatch?.length) {
        const result = await replaceInFile({
          files: bedrockConfigFile,
          // eslint-disable-next-line unicorn/better-regex
          from: new RegExp(lastMatch.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')),
          to: `${lastMatch}\n${wp.multisiteConfigTemplate}`,
        })
        hasInsertedMultisiteBedrockConstants = result.shift()?.hasChanged || false
      }

      if (hasInsertedMultisiteBedrockConstants) {
        await git.add(['config/application.php'], {
          cwd: `${site}/bedrock`,
        })
        await git.commit('iRoots: Add multisite constants', {
          cwd: `${site}/bedrock`,
        })
      } else {
        this.error(
          'Could not insert Multisite Bedrock constants! Investigate or try again without --multisite and configure it manually.',
        )
      }

      const yamls = await globby([`${site}/trellis/group_vars/*/wordpress_sites.yml`])
      const result = await replaceInFile({
        files: yamls,
        from: /multisite:\n\s+enabled: false/g,
        to: match => match.replace('false', 'true'),
      })
      const changedFiles = result.filter(item => item.hasChanged).map(item => item.file)
      if (changedFiles.length > 0) {
        await git.add(['group_vars/*/wordpress_sites.yml'], {
          cwd: `${site}/trellis`,
        })
        await git.commit('iRoots: Enable multisite', {
          cwd: `${site}/trellis`,
        })
      }

      ux.action.stop()
    }

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
      for (const env of pushToEnvironments) {
        // eslint-disable-next-line no-await-in-loop
        await git.push('origin', `${bedrock_remote_branch}:${env}`, {
          cwd: `${site}/bedrock`,
        })
      }

      ux.action.stop()
    }

    if (github) {
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
      await git.add(['public_keys/'], {
        cwd: `${site}/trellis`,
      })
      await git.commit('iRoots: Add public deploy key', {
        cwd: `${site}/trellis`,
      })
      await git.push('origin', trellis_remote_branch, {
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

      const deployToEnvironments = environments.filter(env => env !== 'development')
      for (const env of deployToEnvironments) {
        ux.action.start(`Deploying to ${env}`)
        // eslint-disable-next-line no-await-in-loop
        await trellis.deploy(env, {
          cwd: `${site}/trellis`,
        })
        ux.action.stop()
      }

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

    if (multisite) {
      ux.info("Don't forget to install the multisite DB!")
      ux.info(
        '$ wp core multisite-install --title="site title" --admin_user="username" --admin_password="password" --admin_email="you@example.com"',
      )
    }
  }
}
