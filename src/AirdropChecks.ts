/**
 * This file is part of DHealth Research shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     DHealth Research
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */
import {
  Address,
  MosaicId,
  Order,
  ReceiptType,
  RepositoryFactoryHttp,
  TransactionGroup,
  TransactionType,
} from 'symbol-sdk'

// internal dependencies
import { Research } from './Research'

export class AirdropChecks extends Research {

  public asynchronous: boolean = true

  public constructor() {
    super()
  }

  public async execute(
    args: any[] = []
  ): Promise<number> {
    if (!args.length) {
      console.error('Missing arguments')
      return 1
    }

    let from = args[0],
        more = args.length > 1 ? args.slice(1) : [],
        // dHealth
        dhp_endpoint = 'http://dual-01.dhealth.cloud:3000',
        dhp_mosaicId = new MosaicId('39E0C49FA322A459'),
        dhp_factory = new RepositoryFactoryHttp(dhp_endpoint, {
          websocketUrl: dhp_endpoint.replace('http', 'ws') + '/ws',
        }),
        // Symbol
        xym_endpoint = 'http://dual-001.symbol.ninja:3000',
        xym_factory = new RepositoryFactoryHttp(xym_endpoint, {
          websocketUrl: xym_endpoint.replace('http', 'ws') + '/ws',
        }),
        // repositories
        dhp_transactionHttp = dhp_factory.createTransactionRepository(),
        xym_receiptHttp = xym_factory.createReceiptRepository(),
        col_red = '\x1b[31m',
        col_green = '\x1b[32m',
        col_reset = '\x1b[0m'

    let all = [from].concat(more)
    for (let i = 0, m = all.length; i < m; i++) {
      let address = Address.createFromRawAddress(all[i])

      // 1. Read Symbol account info
      const xHarvest = await xym_receiptHttp.searchReceipts({
        targetAddress: address,
        receiptTypes: [ReceiptType.Harvest_Fee],
        pageSize: 100,
        order: Order.Asc,
      }).toPromise().catch(e => ({data: []}))

      // 2.1 Must have harvested at least once on Symbol
      console.log(`[DEBUG] Checking harvested blocks for ${address.plain()}`)
      if (!xHarvest.data || !xHarvest.data.length) {
        console.log(col_red + `Account ${address.plain()} never harvested on Symbol.` + col_reset)
        console.log('')
        continue
      }

      // 2.2 Must have harvested pre-200k on Symbol
      console.log(`[DEBUG] Checking first harvested block for ${address.plain()}`)
      const fstHarvest = xHarvest.data[0].height.compact()
      if (fstHarvest > 200_000) {
        console.log(col_red + `Account ${address.plain()} first harvested in block ${fstHarvest}` + col_reset)
        console.log('')
        continue
      }

      // 2.3 Must *not* have received DHP before
      console.log(`[DEBUG] Checking transactions for ${address.plain()}`)
      const transactions = await dhp_transactionHttp.search({
        recipientAddress: address,
        // airdrop account: NAIR25NFUGWSNVHASSQEW5MY5ETJ7FYT6WZZN4Y
        signerPublicKey: 'E8874B374E8898C8BFEA5B91C4C43A1010D7D9D932D825F61A2AF2F7770C2527',
        group: TransactionGroup.Confirmed,
        order: Order.Asc,
        embedded: true,
        type: [TransactionType.TRANSFER],
      }).toPromise().catch(e => ({data: []}))

      if (transactions.data && transactions.data.length) {
        console.log(col_red + `Account ${address.plain()} already participated in the airdrop.` + col_reset)
        console.log('')
        continue
      }

      console.log(col_green + `Account ${address.plain()} is eligible for the airdrop.` + col_reset)
      console.log('')
    }

    return 0
  }
}
