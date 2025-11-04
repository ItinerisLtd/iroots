import { password } from '@inquirer/prompts'
import { Command, Flags, ux } from '@oclif/core'
import { globby } from 'globby'
import { randomBytes } from 'node:crypto'
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { replaceInFile } from 'replace-in-file'

import { createTurnstileWidget as createTurnstileSite } from '../lib/cloudflare.js'
import * as composer from '../lib/composer.js'
import * as gh from '../lib/gh.js'
import * as git from '../lib/git.js'
import {
  cloneEnvironment,
  createSite as createKinstaSite,
  envNamesToCloneEnvironmentArgs,
  getSite,
  getSiteEnvironments,
  setPhpVersion,
  setWebroot,
} from '../lib/kinsta.js'
import { findLastMatch, slugify, wait } from '../lib/misc.js'
import { createToken } from '../lib/packagist.js'
import { createApiKey } from '../lib/sendgrid.js'
import { createProject, getAllProjectKeys } from '../lib/sentry.js'
import * as trellis from '../lib/trellis.js'
import { use as valetUse } from '../lib/valet.js'
import * as wp from '../lib/wp.js'

type QAndA = {
  from: string
  to: string
}

type GitHubSecret = {
  app: string
  name: string
  remote: string
  value: string
}

export default class New extends Command {
  static description = 'Create a new project'
  static flags = {
    bedrock_remote: Flags.string({
      char: 'b',
      description: 'bedrock importremote',
      env: 'IROOTS_NEW_BEDROCK_REMOTE',
      required: true,
    }),
    bedrock_remote_branch: Flags.string({
      default: 'main',
      description: 'the branch to use for your new bedrock remote',
      env: 'IROOTS_NEW_BEDROCK_REMOTE_BRANCH',
    }),
    bedrock_repo_pat: Flags.string({
      description: 'the bedrock personal access token for GitHub Actions to clone trellis',
      env: 'IROOTS_NEW_BEDROCK_REPO_PAT',
      required: true,
    }),
    bedrock_template_branch: Flags.string({
      default: 'master',
      description: 'bedrock template branch',
      env: 'IROOTS_NEW_BEDROCK_TEMPLATE_BRANCH',
      required: true,
    }),
    bedrock_template_remote: Flags.string({
      default: 'git@github.com:ItinerisLtd/bedrock.git',
      description: 'bedrock template remote',
      env: 'IROOTS_NEW_BEDROCK_TEMPLATE_REMOTE',
      required: true,
    }),
    deploy: Flags.boolean({
      allowNo: true,
      char: 'd',
      default: false,
      description: 'whether to deploy or not',
    }),
    display_name: Flags.string({
      description: 'the display name for the site',
      env: 'IROOTS_NEW_DISPLAY_NAME',
      relationships: [
        {
          flags: ['kinsta', 'sentry'],
          type: 'some',
        },
      ],
      required: true,
    }),
    git_push: Flags.boolean({
      allowNo: true,
      default: true,
      description: 'whether to push to git remotes or not',
    }),
    github: Flags.boolean({
      allowNo: true,
      default: true,
      description: 'whether to use GH CLI/API or not',
    }),
    github_team: Flags.string({
      default: 'php-team',
      description: 'the team to add to the created GitHub repositories',
    }),
    github_team_permission: Flags.string({
      default: 'maintain',
      description: 'the permission to set for the specified GitHub team',
    }),
    help: Flags.help({ char: 'h' }),
    kinsta: Flags.boolean({
      allowNo: true,
      default: true,
      description: 'whether or not to create A Kinsta site',
    }),
    kinsta_api_key: Flags.string({
      dependsOn: ['kinsta'],
      description: 'the API key for using the Kinsta API',
      env: 'IROOTS_KINSTA_API_KEY',
      required: true,
    }),
    kinsta_company: Flags.string({
      dependsOn: ['kinsta'],
      description: 'the company ID of your Kinsta account',
      env: 'IROOTS_KINSTA_COMPANY_ID',
      required: true,
    }),
    kinsta_free_environments: Flags.string({
      default: ['Staging'],
      description: 'the additional free environment names you wish to create',
      env: 'IROOTS_NEW_KINSTA_FREE_ENVIRONMENTS',
      multiple: true,
    }),
    php_version: Flags.string({
      default: '8.2',
      dependsOn: ['kinsta'],
      description: 'the PHP version to set on site environments',
      env: 'IROOTS_PHP_VERSION',
      options: ['8.0', '8.1', '8.2', '8.3', '8.4'],
      required: true,
    }),
    webroot: Flags.string({
      default: '/current/web',
      dependsOn: ['kinsta'],
      required: true,
    }),
    kinsta_premium_environments: Flags.string({
      default: ['UAT'],
      description: 'the additional premium environment names you wish to create',
      env: 'IROOTS_NEW_KINSTA_PREMIUM_ENVIRONMENTS',
      multiple: true,
    }),
    local: Flags.boolean({
      allowNo: true,
      char: 'l',
      default: true,
      description: 'whether to setup local site or not',
    }),
    multisite: Flags.boolean({
      default: false,
      description: 'whether or not to setup a WordPress multisite network',
      env: 'IROOTS_NEW_IS_MULTISITE',
      required: false,
    }),
    network_media_library: Flags.boolean({
      default: false,
      dependsOn: ['multisite'],
      description: 'whether or not to setup Network Media Library instead of WP Media Folder',
      env: 'IROOTS_NEW_NETWORK_MEDIA_LIBRARY',
      required: false,
    }),
    network_media_library_site_id: Flags.integer({
      default: 1,
      dependsOn: ['multisite', 'network_media_library'],
      description: 'the site ID you wish to use for the network media library',
      env: 'IROOTS_NEW_NETWORK_MEDIA_LIBRARY_SITE_ID',
      required: false,
    }),
    packagist: Flags.boolean({
      allowNo: true,
      default: true,
      description: 'whether or not to create a Private Packagist token for the new project',
    }),
    packagist_api_key: Flags.string({
      dependsOn: ['packagist'],
      description: 'The API key',
      env: 'IROOTS_PACKAGIST_API_KEY',
      required: true,
    }),
    packagist_api_secret: Flags.string({
      dependsOn: ['packagist'],
      description: 'The API SECRET',
      env: 'IROOTS_PACKAGIST_API_SECRET',
      required: true,
    }),
    sendgrid: Flags.boolean({
      allowNo: true,
      default: true,
      description: 'whether or not to create a SendGrid API key for the new project',
    }),
    sendgrid_api_key: Flags.string({
      dependsOn: ['sendgrid'],
      description: 'the SendGrid API key used to send requests to their API',
      env: 'IROOTS_SENDGRID_API_KEY',
      required: true,
    }),
    sentry: Flags.boolean({
      allowNo: true,
      default: true,
      description: 'whether or not to create a Sentry project',
    }),
    sentry_api_key: Flags.string({
      dependsOn: ['sentry'],
      description: 'The API key',
      env: 'IROOTS_SENTRY_API_KEY',
      required: true,
    }),
    sentry_organisation_slug: Flags.string({
      dependsOn: ['sentry'],
      description: 'The slug of the organization the resource belongs to.',
      env: 'IROOTS_SENTRY_ORGANISATION_SLUG',
      required: true,
    }),
    sentry_project_default_rules: Flags.boolean({
      default: true,
      dependsOn: ['sentry'],
      description:
        'Defaults to true where the behavior is to alert the user on every new issue. Setting this to false will turn this off and the user must create their own alerts to be notified of new issues.',
      required: false,
    }),
    sentry_project_platform: Flags.string({
      default: 'php',
      dependsOn: ['sentry'],
      description: 'The platform for the project.',
      required: true,
    }),
    sentry_project_slug: Flags.string({
      dependsOn: ['sentry'],
      description: 'Uniquely identifies a project. If ommitted, we will use the project display name.',
      required: false,
    }),
    sentry_team_slug: Flags.string({
      dependsOn: ['sentry'],
      description: 'The slug of the organization the resource belongs to.',
      env: 'IROOTS_SENTRY_TEAM_SLUG',
      required: true,
    }),
    site: Flags.string({
      char: 's',
      description: 'site key',
      env: 'IROOTS_NEW_SITE',
      required: true,
    }),
    theme_clone: Flags.boolean({
      allowNo: true,
      default: true,
      description: 'whether or not to clone the theme',
      env: 'IROOTS_NEW_THEME_CLONE',
      required: false,
    }),
    theme_template_branch: Flags.string({
      default: 'main',
      description: 'theme template branch',
      env: 'IROOTS_NEW_THEME_TEMPLATE_BRANCH',
      required: true,
    }),
    theme_template_remote: Flags.string({
      default: 'git@github.com:ItinerisLtd/sage.git',
      description: 'theme template remote',
      env: 'IROOTS_NEW_THEME_TEMPLATE_REMOTE',
      required: true,
    }),
    trellis_remote: Flags.string({
      char: 't',
      description: 'trellis remote',
      env: 'IROOTS_NEW_TRELLIS_REMOTE',
      required: true,
    }),
    trellis_remote_branch: Flags.string({
      default: 'main',
      description: 'the branch to use for your new trellis remote',
      env: 'IROOTS_NEW_TRELLIS_REMOTE_BRANCH',
    }),
    trellis_template_branch: Flags.string({
      default: 'master',
      description: 'trellis template branch',
      env: 'IROOTS_NEW_TRELLIS_TEMPLATE_BRANCH',
      required: true,
    }),
    trellis_template_remote: Flags.string({
      default: 'git@github.com:ItinerisLtd/trellis-kinsta.git',
      description: 'trellis template remote',
      env: 'IROOTS_NEW_TRELLIS_TEMPLATE_REMOTE',
      required: true,
    }),
    trellis_template_vault_pass: Flags.string({
      description: 'trellis template vault password',
      env: 'IROOTS_NEW_TRELLIS_TEMPLATE_VAULT_PASS',
      required: true,
    }),
    turnstile: Flags.boolean({
      allowNo: true,
      default: false,
      description: 'whether or not to create a Clouflare Turnstile instance',
    }),
    turnstile_account: Flags.string({
      dependsOn: ['turnstile'],
      description: 'The account identifier',
      env: 'IROOTS_CLOUDFLARE_ACCOUNT_ID',
      required: true,
    }),
    turnstile_api_key: Flags.string({
      dependsOn: ['turnstile'],
      description: 'The API key',
      env: 'IROOTS_CLOUDFLARE_API_KEY',
      required: true,
    }),
    wp_ssh_aliases: Flags.boolean({
      allowNo: true,
      default: true,
      description: 'whether to generate SSH aliases for WP CLI or not',
      env: 'IROOTS_NEW_WP_CLI_SSH_ALIASES',
      required: false,
    }),
  }
  static strict = false

  // eslint-disable-next-line no-warning-comments
  // TODO: needs a nice refactor.
  // eslint-disable-next-line complexity
  async run(): Promise<void> {
    const { flags } = await this.parse(New)
    const {
      bedrock_remote,
      bedrock_remote_branch,
      bedrock_repo_pat,
      bedrock_template_branch,
      bedrock_template_remote,
      deploy,
      display_name,
      git_push,
      github,
      github_team,
      github_team_permission,
      kinsta,
      kinsta_api_key,
      kinsta_company,
      kinsta_free_environments,
      php_version,
      webroot,
      kinsta_premium_environments,
      local,
      multisite,
      network_media_library,
      network_media_library_site_id,
      packagist,
      packagist_api_key,
      packagist_api_secret,
      sendgrid,
      sendgrid_api_key,
      sentry,
      sentry_api_key,
      sentry_organisation_slug,
      sentry_project_default_rules,
      sentry_project_platform,
      sentry_project_slug,
      sentry_team_slug,
      site,
      theme_clone,
      theme_template_branch,
      theme_template_remote,
      trellis_remote,
      trellis_remote_branch,
      trellis_template_branch,
      trellis_template_remote,
      trellis_template_vault_pass,
      turnstile,
      turnstile_account,
      turnstile_api_key,
      wp_ssh_aliases,
    } = flags

    if (existsSync(site)) {
      this.error(`Abort! Directory ${site} already exists`, { exit: 1 })
    }

    mkdirSync(site, { recursive: true })

    const { owner: bedrockRemoteOwner, repo: bedrockRemoteRepo } = await git.parseRemote(bedrock_remote)
    const bedrockRemote = `git@github.com:${bedrockRemoteOwner}/${bedrockRemoteRepo}`
    const { owner: trellisRemoteOwner, repo: trellisRemoteRepo } = await git.parseRemote(trellis_remote)
    const trellisRemote = `git@github.com:${trellisRemoteOwner}/${trellisRemoteRepo}`

    // Create Kinsta site
    if (kinsta) {
      const secondsToWait = 10
      ux.action.start('Creating Kinsta site live environment')
      const createSiteResponse = await createKinstaSite(kinsta_api_key, {
        company: kinsta_company,
        display_name,
        region: 'europe-west2',
      })
      const { idEnv: kinstaProductionEnvId, idSite: kinstaSiteId } = createSiteResponse.data
      ux.action.stop()

      ux.action.start(`Setting PHP version to ${php_version}`)
      // Wait a bit to ensure the site is ready to query.
      await wait(secondsToWait * 1000)
      await setPhpVersion(kinsta_api_key, kinstaProductionEnvId, php_version)
      ux.action.stop()

      ux.action.start(`Setting webroot to ${webroot}`)
      await setWebroot(kinsta_api_key, kinstaProductionEnvId, webroot)
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
          await wait(secondsToWait * 1000)
          const kinstaSiteLive = await getSite(kinsta_api_key, kinstaSiteId)
          const kinstaSiteName = kinstaSiteLive.name
          process.env.IROOTS_NEW_xxxKINSTA_SSH_USERNAMExxx = kinstaSiteName

          // Wait a bit to ensure the site is ready to query.
          await wait(secondsToWait * 1000)
          await cloneEnvironment(kinsta_api_key, kinstaSiteId, env)
          ux.action.stop()
          /* eslint-enable no-await-in-loop */
        }

        ux.action.start('Gathering environment details')
        await wait(secondsToWait * 1000)
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
        access: 'read',
        accessToAllPackages: true,
        description: trellisRemoteRepo,
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
        defaultRules: sentry_project_default_rules,
        name: display_name,
        organisationSlug: sentry_organisation_slug,
        platform: sentry_project_platform,
        slug: sentry_project_slug,
        teamSlug: sentry_team_slug,
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
        const { secret, sitekey } = createTurnstileSiteResponse

        ux.stdout(`Cloudflare Turnstile siteKey: ${sitekey}`)
        ux.stdout(`Cloudflare Turnstile secret: ${secret}`)

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
        teamPermission: 'admin',
        teamSlug: 'senior-team',
      })
      await gh.setTeamPermissions(bedrockRemoteOwner, bedrockRemoteRepo, {
        teamPermission: github_team_permission,
        teamSlug: github_team,
      })
      await gh.setTeamPermissions(trellisRemoteOwner, trellisRemoteRepo, {
        teamPermission: 'admin',
        teamSlug: 'senior-team',
      })
      await gh.setTeamPermissions(trellisRemoteOwner, trellisRemoteRepo, {
        teamPermission: github_team_permission,
        teamSlug: github_team,
      })
      ux.action.stop()
    }

    ux.action.start('Cloning Bedrock template repo')
    await git.clone(
      bedrock_template_remote,
      {
        branch: bedrock_template_branch,
        dir: 'bedrock',
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
        branch: theme_template_branch,
        dir: `${site}/bedrock/web/app/themes/${site}`,
      })
      rmSync(`${site}/bedrock/web/app/themes/${site}/.git`, { force: true, recursive: true })
      rmSync(`${site}/bedrock/web/app/themes/${site}/.github`, { force: true, recursive: true })
      rmSync(`${site}/bedrock/web/app/themes/${site}/.circleci`, { force: true, recursive: true })
      ux.action.stop()
    }

    ux.action.start('Cloning Trellis template repo')
    await git.clone(
      trellis_template_remote,
      {
        branch: trellis_template_branch,
        dir: 'trellis',
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
        `${site}/bedrock/web/app/themes/${site}/**/*.php`,
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
        answer = await password({ message: `What is ${placeholder}?` })
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
    for (const { from, to } of qAndAs) {
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
    const hours = Array.from({ length: (lastHour - firstHour) / step + 1 }, (_, index) => firstHour + index * step)
    const chosenHour = Math.floor(Math.random() * hours.length)
    const cronValue = `0 ${hours[chosenHour]} * * 1,2,3,4,5`
    await replaceInFile({
      files: `${site}/bedrock/.github/workflows/cd.yml`,
      from: /cron: .*/g,
      to: `cron: "${cronValue}"`,
    })

    ux.action.stop()

    ux.action.start(`Rekeying \`${site}/trellis/.vault_pass\``)
    rmSync(`${site}/trellis/.vault_pass`, { force: true, recursive: true })
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
      this.log(`Setting local PHP version to ${php_version}...`)
      await valetUse(php_version, {
        cwd: `${site}/bedrock`,
      })
      ux.action.start('Configuring Multisite')
      const composerRemovePackages = []
      const composerRequirePackages = ['itinerisltd/multisite-url-fixer', 'wpackagist-plugin/threewp-broadcast']

      // Why? It is not compatible with `itinerisltd/network-media-library`.
      if (network_media_library) {
        composerRemovePackages.push('itinerisltd/wp-media-folder')
        composerRequirePackages.push('itinerisltd/network-media-library')

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
      }

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

      const bedrockConfigFile = `${site}/bedrock/config/application.php`
      const bedrockConfigFileContents = readFileSync(bedrockConfigFile, 'utf8')
      let hasInsertedMultisiteBedrockConstants = false
      const pattern = /Config::define(.*);/gm
      const lastMatch = findLastMatch(bedrockConfigFileContents, pattern)
      if (lastMatch?.length) {
        const result = await replaceInFile({
          files: bedrockConfigFile,

          from: new RegExp(lastMatch.replaceAll(/[/\-\\^$*+?.()|[\]{}]/g, String.raw`\$&`)),
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
          app: 'actions',
          name: 'REPO_PAT',
          remote: bedrock_remote,
          value: bedrock_repo_pat,
        },
        {
          app: 'actions',
          name: 'ANSIBLE_VAULT_PASSWORD',
          remote: bedrock_remote,
          value: vaultPass,
        },
        {
          app: 'actions',
          name: 'ANSIBLE_VAULT_PASSWORD',
          remote: trellis_remote,
          value: vaultPass,
        },
        {
          app: 'codespaces',
          name: 'THEME_NAME',
          remote: bedrock_remote,
          value: site,
        },
      ]

      for (const { name, remote, value } of repoSecrets) {
        // eslint-disable-next-line no-await-in-loop
        await gh.setSecret(name, value, remote)
      }

      ux.action.stop()

      ux.action.start('Creating branch protection rules')
      await gh.createBranchProtection(
        {
          branch: bedrock_remote_branch,
          isAdminEnforced: true,
          owner: bedrockRemoteOwner,
          repo: bedrockRemoteRepo,
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
          branch: trellis_remote_branch,
          isAdminEnforced: true,
          owner: trellisRemoteOwner,
          repo: trellisRemoteRepo,
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
      this.log(`Setting local PHP version to ${php_version}...`)
      await valetUse(php_version, {
        cwd: `${site}/bedrock`,
      })

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

      ux.stdout('Linking Valet site')
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
      ux.stdout(`Don't forget to set your branch protection rules for ${remoteBranches}!`)
    }

    if (multisite) {
      ux.stdout("Don't forget to install the multisite DB!")
      ux.stdout(
        '$ wp core multisite-install --title="site title" --admin_user="username" --admin_password="password" --admin_email="you@example.com"',
      )
    }
  }
}
