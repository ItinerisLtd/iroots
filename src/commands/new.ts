import {Command, flags} from '@oclif/command'
import cli from 'cli-ux'
import * as crypto from 'crypto'
import * as fs from 'fs-extra'
import * as globby from 'globby'
import * as replace from 'replace-in-file'

import * as anisble from '../lib/anisble'
import * as git from '../lib/git'
import * as trellis from '../lib/trellis'

type QAndA = {
  from: string,
  to: string,
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
    bedrock_remote: flags.string({
      char: 'b',
      description: 'bedrock remote',
      env: 'IROOTS_NEW_BEDROCK_REMOTE',
      required: true,
    }),
    trellis_remote: flags.string({
      char: 't',
      description: 'trellis remote',
      env: 'IROOTS_NEW_TRELLIS_REMOTE',
      required: true,
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

  async run() {
    const {flags} = this.parse(New)
    const {site, bedrock_remote, trellis_remote, bedrock_template_remote, bedrock_template_branch, trellis_template_remote, trellis_template_branch, trellis_template_vault_pass} = flags

    if (fs.existsSync(site)) {
      this.error(`Abort! Directory ${site} already exists`, {exit: 1})
    }
    fs.ensureDirSync(site)

    this.log('Cloning Bedrock...')
    await git.clone(bedrock_template_remote, {
      dir: 'bedrock',
      branch: bedrock_template_branch,
      origin: 'upstream'
    }, {
      cwd: site,
    })
    await git.renameCurrentBranch('master', {
      cwd: `${site}/bedrock`,
    })
    await git.removeRemote('upstream', {
      cwd: `${site}/bedrock`,
    })
    await git.addRemote('origin', bedrock_remote, {
      cwd: `${site}/bedrock`,
    })

    this.log('Cloning Trellis...')
    await git.clone(trellis_template_remote, {
      dir: 'trellis',
      branch: trellis_template_branch,
      origin: 'upstream'
    }, {
      cwd: site,
    })
    await git.renameCurrentBranch('master', {
      cwd: `${site}/trellis`,
    })
    await git.removeRemote('upstream', {
      cwd: `${site}/trellis`,
    })
    await git.addRemote('origin', trellis_remote, {
      cwd: `${site}/trellis`,
    })

    this.log(`Writing vault password into ${site}/trellis/.vault_pass ...`)
    fs.writeFileSync(`${site}/trellis/.vault_pass`, trellis_template_vault_pass)

    this.log('Decrypting vault.yml...')
    await anisble.vaultDecrypt('group_vars/all/vault.yml', {
      cwd: `${site}/trellis`,
    })
    await anisble.vaultDecrypt('group_vars/development/vault.yml', {
      cwd: `${site}/trellis`,
    })
    await anisble.vaultDecrypt('group_vars/production/vault.yml', {
      cwd: `${site}/trellis`,
    })
    await anisble.vaultDecrypt('group_vars/staging/vault.yml', {
      cwd: `${site}/trellis`,
    })

    this.log('Looking for files to perform search and replace...')
    const yamls = await globby([
      `${site}/trellis/hosts/*`,
      `${site}/trellis/group_vars/*/*.yml`,
      `${site}/bedrock/config/*`,
    ])

    this.log('Searching for placeholders...')
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

    this.log('Q&A...')
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

    this.log('Searching and replacing...')
    for (let {from, to} of qAndAs) {
      const regex = new RegExp(from, 'img')

      await replace({
        files: yamls,
        from: regex,
        to,
      })
    }
    await replace({
      files: yamls,
      from: /"generateme"/g,
      to: () => crypto.randomBytes(64).toString('hex'),
    })

    this.log(`Rekeying ${site}/trellis/.vault_pass ...`)
    fs.removeSync(`${site}/trellis/.vault_pass`)
    const vaultPass = crypto.randomBytes(256).toString('hex')
    fs.writeFileSync(`${site}/trellis/.vault_pass`, vaultPass)
    await anisble.vaultEncrypt('group_vars/all/vault.yml', {
      cwd: `${site}/trellis`,
    })
    await anisble.vaultEncrypt('group_vars/development/vault.yml', {
      cwd: `${site}/trellis`,
    })
    await anisble.vaultEncrypt('group_vars/production/vault.yml', {
      cwd: `${site}/trellis`,
    })
    await anisble.vaultEncrypt('group_vars/staging/vault.yml', {
      cwd: `${site}/trellis`,
    })

    this.log('Commiting Trellis changes...')
    await git.add('.', {
      cwd: `${site}/trellis`,
    })
    await git.commit('iRoots: Search and replace placeholders', {
      cwd: `${site}/trellis`,
    })
    await git.commit('iRoots: Search and replace placeholders', {
      cwd: `${site}/bedrock`,
    })

    this.log('Pushing Trellis changes...')
    await git.push('origin', 'master', {
      cwd: `${site}/trellis`,
    })

    this.log('Pushing to Bedrock...')
    await git.push('origin', 'master', {
      cwd: `${site}/bedrock`,
    })
    await git.push('origin', 'master:staging', {
      cwd: `${site}/bedrock`,
    })
    await git.push('origin', 'master:production', {
      cwd: `${site}/bedrock`,
    })

    this.log('Installing galaxy roles...')
    await anisble.galaxyInstall('galaxy.yml', {
      cwd: `${site}/trellis`,
    })

    this.log('Deploying...')
    await trellis.deploy('staging', site, {
      cwd: `${site}/trellis`,
    })
    await trellis.deploy('production', site, {
      cwd: `${site}/trellis`,
    })
  }
}
