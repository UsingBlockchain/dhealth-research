/**
 * This file is part of DHealth Research shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     DHealth Research
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */
import * as readlineSync from 'readline-sync';
import {
  AggregateTransaction,
  RepositoryFactoryHttp,
  SignedTransaction,
  TransactionMapping,
  TransactionType,
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
export class BroadcastPayloads extends Research {

  public asynchronous: boolean = true

  public constructor() {
    super()
  }

  public async execute(
    args: any[] = []
  ): Promise<number> {

    if (! args.length) {
      console.error('Usage: npm run start broadcast <INPUT_FILENAME> [OUTPUT_FILENAME]')
      return 1
    }

    let input = args.length ? args[0] : 'data/airdrop.json',
        file: string = args.length > 1 ? args[1] : 'data/broadcast.' + Date.now() + '.json'

    if (! fs.existsSync(input)) {
      console.error('File "airdrop.json" not found. Please, run "npm run start airdrop" first.')
      return 2
    }

    const output = file,
          endpoint = 'http://dual-01.dhealth.cloud:3000',
          factory = new RepositoryFactoryHttp(endpoint, {
            websocketUrl: endpoint.replace('http', 'ws') + '/ws',
          }),
          networkType = await factory.getNetworkType().toPromise(),
          generationHash  = await factory.getGenerationHash().toPromise(),
          transactionHttp = factory.createTransactionRepository()

    console.log('Reading blockchain with endpoint:        ' + endpoint)
    console.log('Found network generation hash   :        ' + generationHash)
    console.log('Exporting result transactions to: ' + output)

    let json = JSON.parse(fs.readFileSync(input)),
        err: string[] = [],
        cnt = 0,
        store = []

    console.log('Found ' + json.length + ' elligible airdrop contracts')

    if (fs.existsSync(output)) {
      store = JSON.parse(fs.readFileSync(output))
    }

    do {
      // 1 contract at a time
      const contractBytes = json[cnt].contract
      const contractHash  = json[cnt].hash
      const transaction: AggregateTransaction = TransactionMapping.createFromPayload(contractBytes) as AggregateTransaction

      console.log('')
      console.log("Transaction:    ", contractHash)
      console.log("Payload len:    ", contractBytes.length)
      console.log("Signer:         ", transaction.signer!.address.plain())
      console.log("Embedded #:     ", transaction.innerTransactions.length)
      console.log('')

      if (! readlineSync.keyInYN('Do you want to broadcast this contract?')) {
        err.push('Contract with index ' + cnt + ' was NOT broadcast to the network.')
        cnt++
        continue
      }

      console.log('')
      console.log('Now broadcasting ' + contractHash + ' with ' + transaction.innerTransactions.length + ' embedded transactions.')

      try {
        const response = await transactionHttp.announce(new SignedTransaction(
          contractBytes,
          contractHash,
          transaction.signer!.publicKey,
          transaction.type,
          networkType,
        )).toPromise()

        console.log('[OK] Done broadcast of ' + contractHash + ' with: ' + response.message)

        store.push({
          index: cnt,
          hash: contractHash,
          res: response.message,
        })
      }
      catch (e) {
        err.push('Error happened while broadcasting transaction with hash: ' + contractHash)
        console.error('[ERR] Error happened while broadcasting transaction with hash: ' + contractHash)
        fs.writeFileSync(output.replace('.json', '') + '-debug.json', JSON.stringify(e))
        break
      }

      cnt++
    }
    while(cnt < json.length && readlineSync.keyInYN(
      'Do you want to continue broadcasting contracts?'
    ))

    console.log('')
    console.log('Broadcasted a total of ' + store.length + ' airdrop contracts.')
    console.log('Extracting to file "' + output + '"')

    fs.writeFileSync(output, JSON.stringify(store))
    if (err.length) {
      fs.writeFileSync(output.replace('.json', '') + '-errors.json', JSON.stringify(err))
    }

    return 0
  }
}
