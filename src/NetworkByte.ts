/**
 * This file is part of DHealth Research shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     DHealth Research
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */
import { Convert } from 'symbol-sdk'

// internal dependencies
import { Research } from './Research'

class Traits {
  public static Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  public static encodeBlock = (
    input: any,
    inputOffset: number,
    output: any,
    outputOffset: number,
  ): any => {
    output[outputOffset + 0] = Traits.Alphabet[input[inputOffset + 0] >> 3];
    output[outputOffset + 1] = Traits.Alphabet[((input[inputOffset + 0] & 0x07) << 2) | (input[inputOffset + 1] >> 6)];
    output[outputOffset + 2] = Traits.Alphabet[(input[inputOffset + 1] & 0x3e) >> 1];
    output[outputOffset + 3] = Traits.Alphabet[((input[inputOffset + 1] & 0x01) << 4) | (input[inputOffset + 2] >> 4)];
    output[outputOffset + 4] = Traits.Alphabet[((input[inputOffset + 2] & 0x0f) << 1) | (input[inputOffset + 3] >> 7)];
    output[outputOffset + 5] = Traits.Alphabet[(input[inputOffset + 3] & 0x7f) >> 2];
    output[outputOffset + 6] = Traits.Alphabet[((input[inputOffset + 3] & 0x03) << 3) | (input[inputOffset + 4] >> 5)];
    output[outputOffset + 7] = Traits.Alphabet[input[inputOffset + 4] & 0x1f];
  }

  public static toBase32 = (
    data: Uint8Array,
  ): string => {
    if (0 !== data.length % 5) {
      // add 0 bytes
      data.copyWithin(5 - data.length, 1)
    }

    const output = new Array((data.length / 5) * 5);
    for (let i = 0; i < data.length / 5; ++i) {
      Traits.encodeBlock(data, i * 5, output, i * 5);
    }

    return output.join('');
  }
}

export class NetworkByte extends Research {
  public constructor() {
    super()
  }

  public execute(
    args: any[] = []
  ): number {
    for (let i = 1; i < 256; i++) {
      const uint8 = Convert.numberToUint8Array(i, 2)

      console.log(
        Traits.toBase32(uint8) + ' = ' + 
        Convert.uint8ToHex(uint8) + ' = ' +
        i
      )
    }
    return 0
  }
}
