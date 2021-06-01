/**
 * This file is part of DHealth Research shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     DHealth Research
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */
import { Address, RepositoryFactoryHttp, AccountType } from 'symbol-sdk'
const fs = require('fs')

// internal dependencies
import { Research } from './Research'

const sleep = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export class RemoteToMainAccounts extends Research {

  public asynchronous: boolean = true

  public constructor() {
    super()
  }

  public async execute(
    args: any[] = []
  ): Promise<number> {
    let input = args.length ? args[0] : 'data/harvesters.json',
        file: string = args.length > 1 ? args[1] : 'data/remotes.' + Date.now() + '.json'

    if (! fs.existsSync(input)) {
      console.error('File "harvesters.json" not found. Please, run "npm run start extract" first.')
      return 0
    }

    const output = file,
          endpoint = 'http://ngl-dual-001.symbolblockchain.io:3000',
          factory = new RepositoryFactoryHttp(endpoint, {
            websocketUrl: endpoint.replace('http', 'ws') + '/ws',
          }),
          http = factory.createAccountRepository(),
          net = await factory.getNetworkType().toPromise()

    console.log('Reading blockchain with endpoint:        ' + endpoint)
    console.log('Starting extract of airdrop accounts to: ' + output)

    let json = JSON.parse(fs.readFileSync(input)),
        err = [],
        at = 0,
        cnt = 0,
        store = [],
        known: string[] = []

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

      // 100 accounts in one request
      const infos = await http.getAccountsInfo(json.slice(at, at+100).map(
        (r: any) => Address.createFromRawAddress(r.signer)
      )).toPromise()

      for (let i = 0, m = infos.length; i < m; i++) {
        let info = infos[i],
            link = info.supplementalPublicKeys.linked,
            addr = info.accountType === AccountType.Main
              ? info.address.plain()
              : null

        if (known.includes(info.address.plain())) {
          continue;
        }

        // is it a remote account?
        if (!! link && info.accountType === AccountType.Remote) {
          addr = Address.createFromPublicKey(link.publicKey, net).plain()
        }
        else if (info.accountType !== AccountType.Main) {
          err.push('Account ' + info.address.plain() + ' (' + info.publicKey + ') is unlinked.')
          console.error('Account ' + info.address.plain() + ' (' + info.publicKey + ') is unlinked.')
          continue
        }

        console.log('main: ' + addr + ' ; remote: ' + (!!link ? info.address.plain() : addr))
        store.push({main: addr, remote: !!link ? info.address.plain() : addr})
        known.push(info.address.plain())
      }

      at += 100
      cnt++
    }
    while(at < json.length)

    console.log('')
    console.log('Found a total of ' + store.length + ' elligible accounts.')
    console.log('Extracting to file "' + output + '"')

    fs.writeFileSync(output, JSON.stringify(store))
    if (err.length) {
      fs.writeFileSync(output.replace('.json', '') + '-errors.json', JSON.stringify(err))
    }

    return 0
  }
}
