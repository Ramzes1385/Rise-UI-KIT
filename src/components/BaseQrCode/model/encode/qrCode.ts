import { buildMatrix } from './qrMatrix'
import { chooseVersion, dataCodewords, finalCodewords } from './qrData'
import type { QrEncodeOptions, QrErrorLevel, QrMatrix } from '../../types/BaseQrCode.types'

export function encodeBytes(bytes: readonly number[], options: QrEncodeOptions): QrMatrix {
	const codewords = finalCodewords(dataCodewords(bytes, options.version, options.level), options.version, options.level)
	return buildMatrix(codewords, options)
}

export function encodeQr(text: string, level: QrErrorLevel, mask?: number): QrMatrix | null {
	const bytes = [...new TextEncoder().encode(text)]
	const version = chooseVersion(bytes.length, level)
	if (version === null) return null
	return encodeBytes(bytes, { version, level, mask })
}
