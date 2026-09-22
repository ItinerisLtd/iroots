import {expect} from 'chai'

import ChangeWebrootSubfolder from '../../../../src/commands/kinsta/env/webroot.js'

describe('kinsta env webroot flags', () => {
  it('defines env_id as a required flag with environment_id as an alias', () => {
    const flags = ChangeWebrootSubfolder.flags as Record<string, {aliases?: string[]; required?: boolean}>

    expect(flags.env_id).to.not.equal(undefined)
    expect(flags.env_id.required).to.equal(true)
    expect(flags.env_id.aliases).to.deep.equal(['environment_id'])
  })

  it('no longer defines a bare env flag', () => {
    const flags = ChangeWebrootSubfolder.flags as Record<string, unknown>

    expect(flags.env).to.equal(undefined)
  })
})
