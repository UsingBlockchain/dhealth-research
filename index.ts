/**
 * This file is part of DHealth Research shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     DHealth Research
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */
import process from 'process'
import { NetworkByte } from './src/NetworkByte'

// - Tear Up
const research = new NetworkByte()

// - Execute
const result = research.execute()

// - Tear Down
process.exit(result)