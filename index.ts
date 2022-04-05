/**
 * This file is part of DHealth Research shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     DHealth Research
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */
import process from 'process'
import { Research } from './src/Research'
import { NetworkByte } from './src/NetworkByte'
import { Vanity } from './src/Vanity'
import { Converter } from './src/Converter'
import { HarvesterExtract } from './src/HarvesterExtract'
import { RemoteToMainAccounts } from './src/RemoteToMainAccounts'
import { AirdropAccounts } from './src/AirdropAccounts'
import { TransactionPayload } from './src/TransactionPayload'
import { BroadcastPayloads } from './src/BroadcastPayloads'
import { CheckDuplicates } from './src/CheckDuplicates'
import { MetadataKeys } from './src/MetadataKeys'
import { AirdropChecks } from './src/AirdropChecks'
import { VotingUpgradeChecks } from './src/VotingUpgradeChecks'
import { NetworkApiVotingBalances } from './src/NetworkApiVotingBalances'

let research: Research,
    args: any[] = []

// - Tear Up
if (process.argv.includes('byte')
  || process.argv.includes('networkByte')
  || process.argv.includes('network-byte')) {

  research = new NetworkByte()
}
else if (process.argv.includes('vanity')) {

  args = process.argv.slice(process.argv.indexOf('vanity')+1)
  research = new Vanity()
}
else if (process.argv.includes('convert')) {

  args = process.argv.slice(process.argv.indexOf('convert')+1)
  research = new Converter()
}
else if (process.argv.includes('extract')) {

  args = process.argv.slice(process.argv.indexOf('extract')+1)
  research = new HarvesterExtract()
}
else if (process.argv.includes('remotes')) {

  args = process.argv.slice(process.argv.indexOf('remotes')+1)
  research = new RemoteToMainAccounts()
}
else if (process.argv.includes('airdrop')) {

  args = process.argv.slice(process.argv.indexOf('airdrop')+1)
  research = new AirdropAccounts()
}
else if (process.argv.includes('payload')) {

  args = process.argv.slice(process.argv.indexOf('payload')+1)
  research = new TransactionPayload()
}
else if (process.argv.includes('broadcast')) {

  args = process.argv.slice(process.argv.indexOf('broadcast')+1)
  research = new BroadcastPayloads()
}
else if (process.argv.includes('duplicates')) {

  args = process.argv.slice(process.argv.indexOf('duplicates')+1)
  research = new CheckDuplicates()
}
else if (process.argv.includes('metadata')) {

  args = process.argv.slice(process.argv.indexOf('metadata')+1)
  research = new MetadataKeys()
}
else if (process.argv.includes('airdropee')) {

  args = process.argv.slice(process.argv.indexOf('airdropee')+1)
  research = new AirdropChecks()
}
else if (process.argv.includes('voting')) {

  args = process.argv.slice(process.argv.indexOf('voting')+1)
  research = new VotingUpgradeChecks()
}
else if (process.argv.includes('netapi-voter-balances')) {

  args = process.argv.slice(process.argv.indexOf('netapi-voter-balances')+1)
  research = new NetworkApiVotingBalances()
}
else {
  console.error('Research type not identified (try with "byte" or "vanity")')
  process.exit(1)
}

if (research.asynchronous) {
  (async () => {
    const result = await research.execute(args)
    process.exit(result)
  })()
}
else { 
  // - Execute synchronously
  const result = research.execute(args)

  // - Tear Down
  process.exit(result)
}

