import { ASN1ParseError } from './error';

export const UNIVERSAL_TAG = {
  BOOLEAN: 0x01,
  INTEGER: 0x02,
  BIT_STRING: 0x03,
  OCTET_STRING: 0x04,
  OBJECT_IDENTIFIER: 0x06,
  SEQUENCE: 0x10,
  SET: 0x11,
  PRINTABLE_STRING: 0x13,
  UTC_TIME: 0x17,
  GENERALIZED_TIME: 0x18,
};

const TAG_CLASS = {
  UNIVERSAL: 0x00,
  APPLICATION: 0x01,
  CONTEXT_SPECIFIC: 0x02,
  PRIVATE: 0x03,
};

// https://learn.microsoft.com/en-us/windows/win32/seccertenroll/about-encoded-tag-bytes
export class ASN1Tag {
  readonly number: number;
  readonly constructed: boolean;
  readonly class: number;

  constructor(enc: number) {
    // Bits 0 through 4 are the tag number
    this.number = enc & 0x1f;

    // Bit 5 is the constructed bit
    this.constructed = (enc & 0x20) === 0x20;

    // Bit 6 & 7 are the class
    this.class = enc >> 6;

    if (this.number === 0x1f) {
      throw new ASN1ParseError('long form tags not supported');
    }

    if (this.class === TAG_CLASS.UNIVERSAL && this.number === 0x00) {
      throw new ASN1ParseError('unsupported tag 0x00');
    }
  }

  public isUniversal(): boolean {
    return this.class === TAG_CLASS.UNIVERSAL;
  }

  public isContextSpecific(num?: number): boolean {
    const res = this.class === TAG_CLASS.CONTEXT_SPECIFIC;
    return num ? res && this.number === num : res;
  }

  public isBoolean(): boolean {
    return this.isUniversal() && this.number === UNIVERSAL_TAG.BOOLEAN;
  }

  public isInteger(): boolean {
    return this.isUniversal() && this.number === UNIVERSAL_TAG.INTEGER;
  }

  public isBitString(): boolean {
    return this.isUniversal() && this.number === UNIVERSAL_TAG.BIT_STRING;
  }

  public isOctetString(): boolean {
    return this.isUniversal() && this.number === UNIVERSAL_TAG.OCTET_STRING;
  }

  public isOID(): boolean {
    return (
      this.isUniversal() && this.number === UNIVERSAL_TAG.OBJECT_IDENTIFIER
    );
  }

  public isUTCTime(): boolean {
    return this.isUniversal() && this.number === UNIVERSAL_TAG.UTC_TIME;
  }

  public isGeneralizedTime(): boolean {
    return this.isUniversal() && this.number === UNIVERSAL_TAG.GENERALIZED_TIME;
  }
}
