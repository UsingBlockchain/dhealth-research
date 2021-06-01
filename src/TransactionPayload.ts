/**
 * This file is part of DHealth Research shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     DHealth Research
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */
import { AggregateTransaction, TransactionMapping, TransferTransaction, TransactionType, Transaction } from 'symbol-sdk'

// internal dependencies
import { Research } from './Research'

export class TransactionPayload extends Research {
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

    let payload = args[0],
        more = args.length > 1 ? args.slice(1) : []

    let all = [payload].concat(more)
    for (let i = 0, m = all.length; i < m; i++) {
      let input = all[i]
      const tx = TransactionMapping.createFromPayload(input)

      console.log('')
      console.log('typeof tx          : ', typeof tx)
      console.log('tx.type            : ', tx.type)
      console.log('tx.networkType     : ', tx.networkType)
      console.log('tx.deadline        : ', tx.deadline.toLocalDateTime(1616978397).toString()) // NETWORK EPOCH ADJUSTMENT
      console.log('tx.maxFee          : ', tx.maxFee.compact())
      console.log('tx.transactionInfo : ', JSON.stringify(tx.transactionInfo))

      if ([
        TransactionType.AGGREGATE_COMPLETE,
        TransactionType.AGGREGATE_BONDED,
      ].includes(tx.type)) {
        const aggr = tx as AggregateTransaction

        console.log('tx.children        :', aggr.innerTransactions.length)
        aggr.innerTransactions.map(
          inner => this.printTransactionTypeDetails(inner, '\t')
        )
      }
      else this.printTransactionTypeDetails(tx)
    }
    return 0
  }

  protected printTransactionTypeDetails(tx: Transaction, prefix: string = '') {
    if (TransactionType.TRANSFER === tx.type) {
      const transfer = tx as TransferTransaction
      console.log(prefix + 'tx.recipientAddress: ', transfer.recipientAddress.plain())

      transfer.mosaics.map(
        m => console.log(prefix + 'tx.mosaic[' + m.id.toHex() + ']: ', m.amount.compact())
      )
    }
    // XXX other transaction types
  }
}
 