/**
 * This file is part of DHealth Research shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     DHealth Research
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */
import {
  Amount,
} from '@dhealthdapps/bridge-sdk'
import axios from 'axios';

// internal dependencies
import { Research } from './Research'

export class NetworkApiVotingBalances extends Research {

  public asynchronous: boolean = true

  public constructor() {
    super()
  }

  public async execute(
    args: any[] = []
  ): Promise<number> {
    let col_red = '\x1b[31m',
        col_green = '\x1b[32m',
        col_reset = '\x1b[0m'

    let pageNumber = 1,
        totalVotingNodeBalance: any = (new Amount(0)).plain.value,
        totalVotingBalance: any = (new Amount(0)).plain.value,
        totalNonVotingBalance: any = (new Amount(0)).plain.value,
        cntItems: any; // BigNumber.js
    do {
      const handler = await axios.get(
        `http://peers.dhealth.cloud:7903/network/voters?pageSize=100&pageNumber=${pageNumber}`
      );

      const response = handler.data; // axios wraps response in "data"
      const voters = response.data; // network-api wraps items in "data"
      cntItems = voters.length;

      if (cntItems > 0) {
        console.log(col_green + `Found page ${pageNumber} with ${voters.length} voter nodes.` + col_reset);
      }

      for (let i = 0, m = voters.length; i < m; i++) {
        const voterAmount = new Amount(voters[i].balance);
        const voterValue = voterAmount.plain.value;

        if (voters[i].voting === true) {
          // voting node
          totalVotingBalance = totalVotingBalance.plus(voterValue);
        }
        else {
          // non-voting node
          totalNonVotingBalance = totalNonVotingBalance.plus(voterValue);
        }
      }

      pageNumber++;
    }
    while (cntItems > 0);

    // grand total
    totalVotingNodeBalance = totalVotingBalance.plus(totalNonVotingBalance);

    console.log('');
    console.log(col_red + `Total non-voting balance: ${totalNonVotingBalance.shiftedBy(-6).toFormat()}` + col_reset)
    console.log(col_green + `Total voting balance: ${totalVotingBalance.shiftedBy(-6).toFormat()}` + col_reset)
    console.log(col_green + `Grand voting total balance: ${totalVotingNodeBalance.shiftedBy(-6).toFormat()}` + col_reset)
    console.log('');
    console.log(col_green + `Job done.` + col_reset)
    console.log('')

    return 0
  }
}
