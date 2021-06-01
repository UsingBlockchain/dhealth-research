/**
 * This file is part of DHealth Research shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     DHealth Research
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */
import { NetworkType, Account } from 'symbol-sdk'

// internal dependencies
import { Research } from './Research'

export class Vanity extends Research {
  public constructor() {
    super()
  }

  public execute(
    args: any[] = []
  ): number {
    if (!args.length) {
      console.error('Missing vanity word.')
      return 1
    }

    const word = args[0],
          num = args.length > 1 ? parseInt(args[1]) : 3
    let van = '',
        acct: Account,
        has: number = 0,
        it: number = 0

    while (has < num) {
      do {
        acct = Account.generateNewAccount(NetworkType.MAIN_NET)
        van = acct.address.plain().substr(1, word.length)

        if ((++it % 100 === 0 && it <= 1000)
          || (it % 1000 === 0 && it <= 10000)
          || (it % 5000 === 0)) {
          console.log('Generated a total of ' + it + ' keys...')
        }
      }
      while (van.toLowerCase() !== word.toLowerCase())

      console.log('')
      console.log('Found!')
      console.log('prv: ' + acct.privateKey)
      console.log('pub: ' + acct.publicKey)
      console.log('adr: ' + acct.address.plain())
      console.log('')
      has++
    }
    return 0
  }
}
