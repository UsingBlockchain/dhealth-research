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
export class AirdropAccounts extends Research {

  public asynchronous: boolean = true

  public constructor() {
    super()
  }

  public async execute(
    args: any[] = []
  ): Promise<number> {

    if (args.length !== 3) {
      console.error('Usage: npm run start airdrop <INPUT_FILENAME> <OUTPUT_FILENAME> <PRIVATE_KEY>')
      return 1
    }

    let input = args.length ? args[0] : 'data/remotes.json',
        file: string = args.length > 1 ? args[1] : 'data/airdrop.' + Date.now() + '.json',
        privateKey: string = args.length > 2 ? args[2] : null

    if (! fs.existsSync(input)) {
      console.error('File "remotes.json" not found. Please, run "npm run start remotes" first.')
      return 2
    }
    else if (!privateKey || privateKey.length !== 64) {
      console.error('Please, provide a valid private key as a third argument.')
      return 3
    }

    const output = file,
          endpoint = 'http://dual-01.dhealth.cloud:3000',
          factory = new RepositoryFactoryHttp(endpoint, {
            websocketUrl: endpoint.replace('http', 'ws') + '/ws',
          }),
          http = factory.createAccountRepository(),
          networkType = await factory.getNetworkType().toPromise(),
          epochAdjustment = await factory.getEpochAdjustment().toPromise(),
          generationHash  = await factory.getGenerationHash().toPromise(),
          airdroper = Account.createFromPrivateKey(privateKey, networkType)

    console.log('Reading blockchain with endpoint:        ' + endpoint)
    console.log('Found network generation hash   :        ' + generationHash)
    console.log('Starting to prepare transactions: ' + output)
    console.log('Transaction signer plain address: ' + airdroper.address.plain())

    let json = JSON.parse(fs.readFileSync(input)),
        err: string[] = [],
        at = 0,
        cnt = 0,
        store = []

    console.log('Found ' + json.length + ' elligible airdrop accounts')

    if (fs.existsSync(output)) {
      store = JSON.parse(fs.readFileSync(output))
    }

    do {
      if (cnt > 0 && cnt % 5 === 0) {
        console.log("Waiting 1 second")
        console.log('')
        sleep(1000)
      }

      // 100 airdrops at a time
      const airdropees = json.slice(at, at+100).map(
        (u: any) => Address.createFromRawAddress(u.main)
      )

      // 1 aggregate per group of airdropees
      const transactions: Transaction[] = []
      for (let i = 0, m = airdropees.length; i < m; i++) {
        transactions.push(TransferTransaction.create(
          Deadline.create(epochAdjustment, 4),
          airdropees[i],
          [new Mosaic(new NamespaceId('dhealth.dhp'), UInt64.fromUint(10001000000)),],
          EmptyMessage,
          networkType,
          UInt64.fromUint(0),
        ).toAggregate(airdroper.publicAccount))
      }

      // bundle the 100 transfers
      const aggregate = AggregateTransaction.createComplete(
        Deadline.create(epochAdjustment, 4),
        transactions,
        networkType,
        [], // "unsigned"
        UInt64.fromUint(0), // maxFee
      )

      // sign aggregate
      const signedContract: SignedTransaction = airdroper.sign(aggregate, generationHash)
      store.push({
        index: cnt,
        contract: signedContract.payload,
        hash: signedContract.hash,
      })

      at += 100
      cnt++
    }
    while(at < json.length)

    console.log('')
    console.log('Created a total of ' + store.length + ' airdrop contracts.')
    console.log('Extracting to file "' + output + '"')

    fs.writeFileSync(output, JSON.stringify(store))
    if (err.length) {
      fs.writeFileSync(output.replace('.json', '') + '-errors.json', JSON.stringify(err))
    }

    return 0
  }
}
