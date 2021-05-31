/**
 * This file is part of DHealth Research shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     DHealth Research
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */
import { RepositoryFactoryHttp, BlockOrderBy } from 'symbol-sdk'
const fs = require('fs')

// internal dependencies
import { Research } from './Research'

const sleep = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export class HarvesterExtract extends Research {

  public asynchronous: boolean = true

  public constructor() {
    super()
  }

  public async execute(
    args: any[] = []
  ): Promise<number> {
    let from: number = args.length ? parseInt(args[0]) : 1,
        to: number = args.length > 1 ? parseInt(args[1]) : 0,
        file: string = args.length > 2 ? args[2] : 'data/harvesters.' + Date.now() + '.json'

    const output = file,
          endpoint = 'http://ngl-dual-001.symbolblockchain.io:3000',
          factory = new RepositoryFactoryHttp(endpoint, {
            websocketUrl: endpoint.replace('http', 'ws') + '/ws',
          }),
          http = factory.createBlockRepository()

    console.log('Reading blockchain with endpoint:  ' + endpoint)
    console.log('Starting extract of harvesters to: ' + output)
    console.log('Range of blocks to be read:        ' + from + ' -> ' + (to > from ? to : 'present'))

    let at: number = from,
        cnt: number = 0,
        store = []

    if (fs.existsSync(output)) {
      store = JSON.parse(fs.readFileSync(output))
    }

    do {
      if (cnt > 0 && cnt % 5 === 0) {
        console.log("Waiting 1 second")
        console.log('')
        sleep(1000)
      }

      const page: number = Math.floor(at / 100 + 1)
      console.log("Reading page " + page)

      const blocks = await http.search({
        pageSize: 100,
        pageNumber: page,
        orderBy: BlockOrderBy.Height,
      }).toPromise()

      for (let i = 0, m = blocks.data.length; i < m; i++) {
        const b = blocks.data[i]
        store.push({
          height: b.height.compact(),
          signer: b.signer.address.plain()
        })
      }

      at += 100
      cnt++
    }
    while (to >= at)

    console.log('')
    console.log('Extracting to file "' + output + '"')

    fs.writeFileSync(output, JSON.stringify(store))
    return 0
  }
}
