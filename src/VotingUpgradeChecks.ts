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
  NetworkType,
  Order,
  ReceiptType,
  RepositoryFactoryHttp,
  TransactionGroup,
  TransactionType,
} from 'symbol-sdk'

// internal dependencies
import { Research } from './Research'

export class VotingUpgradeChecks extends Research {

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

    let node = args[0],
        more = args.length > 1 ? args.slice(1) : [],
        col_red = '\x1b[31m',
        col_green = '\x1b[32m',
        col_reset = '\x1b[0m'

    let all = [node].concat(more)
    for (let i = 0, m = all.length; i < m; i++) {
      const endpoint = `http://${all[i]}:3000`

      // connect to node
      const factory = new RepositoryFactoryHttp(endpoint, {
        websocketUrl: endpoint.replace('http', 'ws') + '/ws',
      })

      // prepare requests
      const nodeHttp = factory.createNodeRepository(),
            acctHttp = factory.createAccountRepository()

      // 1. Read harvesters
      console.log(`[DEBUG] Checking harvesters for ${endpoint}`)
      const hPublicKeys = await nodeHttp.getUnlockedAccount().toPromise()
      if (!hPublicKeys.length) {
        console.log(col_red + `Node with URL ${endpoint} does not have unlocked accounts.` + col_reset)
        console.log('')
        continue
      }

      const fstHarvester = hPublicKeys.shift()
      console.log(`[DEBUG] Found harvester public key ${fstHarvester} for ${endpoint}`)

      let accountInfo
      try {
        accountInfo = await acctHttp.getAccountInfo(Address.createFromPublicKey(
          fstHarvester!, NetworkType.MAIN_NET
        )).toPromise()
      }
      catch (e) {
        console.log(col_red + `Remote account of node ${endpoint} is unknown.` + col_reset)
        console.log('')
        continue
      }

      // if node has a remote account, query its information
      if (!! accountInfo.supplementalPublicKeys.linked) {
        try {
          accountInfo = await acctHttp.getAccountInfo(Address.createFromPublicKey(
            accountInfo.supplementalPublicKeys.linked.publicKey, NetworkType.MAIN_NET
          )).toPromise()
        }
        catch(e) {
          console.log(col_red + `Main account of node ${endpoint} is unknown.` + col_reset)
          console.log('')
          continue
        }
      }

      // 2. Check whether *any* voting keys are set.
      let numVotingKeys = 0
      if (!! accountInfo.supplementalPublicKeys.voting) {
        numVotingKeys = accountInfo.supplementalPublicKeys.voting.length
        console.log(`[DEBUG] Found ${numVotingKeys} voting keys for ${endpoint}`)
      }

      // 3. Check min balance for voting (2'000'000 DHP)
      if (! accountInfo.mosaics.length) {
        console.log(col_red + `Node with URL ${endpoint} does not participate in voting.` + col_reset)
        console.log('')
        continue
      }

      // Get DHP balance
      const dhpBalance = accountInfo.mosaics.find(
        m => m.id.toHex() === '39E0C49FA322A459'
      )

      if (! dhpBalance) {
        console.log(col_red + `Node with URL ${endpoint} does not participate in voting.` + col_reset)
        console.log('')
        continue
      }

      const totalStake = dhpBalance.amount.compact() / Math.pow(10, 6)
      if (totalStake < 2_000_000) {
        console.log(col_red + `Node with URL ${endpoint} does not participate in voting.` + col_reset)
        console.log('')
        continue
      }

      const latestVotingKey = accountInfo.supplementalPublicKeys.voting!.pop()!

      if (numVotingKeys === 1 && latestVotingKey.startEpoch === 1) {
        console.log(col_red + `Node with URL ${endpoint} has not updated voting keys but participates in voting with ${totalStake} dhealth.dhp.` + col_reset)
        console.log('')
        continue
      }

      console.log(col_green + `Node ${endpoint} updated voting keys and participates in voting with ${totalStake} dhealth.dhp.` + col_reset)
      console.log('')
    }

    return 0
  }
}
