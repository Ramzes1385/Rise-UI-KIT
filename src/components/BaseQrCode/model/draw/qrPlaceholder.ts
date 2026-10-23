import { finderPath, modulePath } from './qrShapes'
import type { QrSvgParts } from '../../types/BaseQrCode.types'

const SIZE = 25

const PATTERN = Array.from({ length: SIZE }, (_, y) => Array.from({ length: SIZE }, (_, x) => (x * 3 + y * 5 + ((x * y) % 7)) % 4 < 2))

export function placeholderParts(margin: number, colors: QrSvgParts['colors']): QrSvgParts {
	return {
		viewSize: SIZE + margin * 2,
		colors,
		modules: modulePath(PATTERN, { margin, shape: 'square', area: null }),
		finder: finderPath(SIZE, margin, 'square'),
		crisp: { modules: true, finder: true },
		logo: null,
	}
}
