import { buildMatrix } from './qrMatrix'
import { chooseVersion, dataCodewords, finalCodewords } from './qrData'
import type { QrMatrix, QrErrorLevel } from '../../types/BaseQrCode.types'

export function encodeQr(text: string, level: QrErrorLevel, mask?: number): QrMatrix | null {
	const bytes = [...new TextEncoder().encode(text)]
	const version = chooseVersion(bytes.length, level)
	if (version === null) return null
	const codewords = finalCodewords(dataCodewords(bytes, version, level), version, level)
	return buildMatrix(codewords, { version, level, mask })
}

export function qrPath(modules: readonly (readonly boolean[])[], margin: number): string {
	const commands: string[] = []
	modules.forEach((row, y) => {
		let x = 0
		while (x < row.length) {
			const start = x
			while (x < row.length && row[x]) x++
			if (x > start) commands.push(`M${start + margin} ${y + margin}h${x - start}v1h-${x - start}z`)
			else x++
		}
	})
	return commands.join('')
}
