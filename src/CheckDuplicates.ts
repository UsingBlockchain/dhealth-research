/**
 * This file is part of DHealth Research shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     DHealth Research
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */
 import {
  Account,
  Address,
  AggregateTransaction,
  Deadline,
  EmptyMessage,
  Mosaic,
  NamespaceId,
  RepositoryFactoryHttp,
  SignedTransaction,
  Transaction,
  TransferTransaction,
  UInt64,
} from 'symbol-sdk'
const fs = require('fs')

// internal dependencies
import { Research } from './Research'

const sleep = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
 
/**
 * @warning
 * @warning
 * @warning This research creates signed transactions for the dHealth Public Network.
 * @warning
 * @warning
 */
export class CheckDuplicates extends Research {

  public asynchronous: boolean = true

  public constructor() {
    super()
  }

  public async execute(
    args: any[] = []
  ): Promise<number> {

    if (args.length !== 1) {
      console.error('Usage: npm run start duplicates <INPUT_FILENAME>')
      return 1
    }

    let input = args.length ? args[0] : 'data/remotes.json'

    if (! fs.existsSync(input)) {
      console.error('File "remotes.json" not found. Please, run "npm run start remotes" first.')
      return 2
    }

    let json = JSON.parse(fs.readFileSync(input)),
        err: string[] = [],
        at = 0,
        cnt = 0,
        store = []

    console.log('Found ' + json.length + ' elligible rows')

    const equals = json.filter((r: any) => r.main === r.remote)
    const dupls  = json.filter((r: any) => json.find((r2: any) => r2.main === r.main && r2.remote != r.remote))

    equals.map(
      (e: any) => console.log('[EQL] ' + e.main)
    )

    dupls.map(
      (d: any) => console.log('[DPL] ' + d.main)
    )

    return 0
  }
}
