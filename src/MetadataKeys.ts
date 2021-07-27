/**
 * This file is part of DHealth Research shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     DHealth Research
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */
 import { KeyGenerator } from 'symbol-sdk'

 // internal dependencies
 import { Research } from './Research'
 
 export class MetadataKeys extends Research {
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
 
     let key = args[0]
     console.log(KeyGenerator.generateUInt64Key(key).toHex())
     return 0
   }
 }
 

