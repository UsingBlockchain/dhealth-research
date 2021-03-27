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
else {
  console.error('Research type not identified (try with "byte" or "vanity")')
  process.exit(1)
}

// - Execute
const result = research.execute(args)

// - Tear Down
process.exit(result)
