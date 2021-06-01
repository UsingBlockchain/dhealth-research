/**
 * This file is part of DHealth Research shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     DHealth Research
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */
import { Address, NetworkType, Account } from 'symbol-sdk'

// internal dependencies
import { Research } from './Research'

export class Converter extends Research {
  public constructor() {
    super()
  }

  public execute(
    args: any[] = []
  ): number {
    if (!args.length) {
      console.error('Missing arguments')
      return 1
    }

    let from = args[0],
        type = args.length > 1 ? args[1] : 'pub',
        net = args.length > 2 ? args[2] : NetworkType.MAIN_NET,
        more = args.length > 3 ? args.slice(3) : []

    if (type !== 'pub' && type !== 'priv') {
      console.log('Missing type argument, one of "pub" and "priv" expected. Using "pub" as a default.')
      type = 'pub'
    }

    let all = [from].concat(more)
    for (let i = 0, m = all.length; i < m; i++) {
      let input = all[i]

      if (type === 'priv') {
        const acct = Account.createFromPrivateKey(input, net)
        console.log('')
        console.log('addr: ' + acct.address.plain())
        console.log('pubk: ' + acct.publicKey)
        console.log('pubk: ' + acct.privateKey)
      }
      else {
        const addr = Address.createFromPublicKey(input, net)
        console.log('')
        console.log('addr: ' + addr.plain())
        console.log('pubk: ' + input)
      }
    }
    return 0
  }
}
