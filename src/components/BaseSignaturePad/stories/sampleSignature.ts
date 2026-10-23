import type { SignatureStroke } from '../types/BaseSignaturePad.types'

const round = (value: number): number => Math.round(value * 10) / 10

const LOOPS = Array.from({ length: 96 }, (_, index) => {
	const angle = (index / 95) * Math.PI * 7
	return { x: round(92 + angle * 11 - 15 * Math.sin(angle)), y: round(92 - 24 * Math.cos(angle) * (1 - angle / 44)) }
})

const UNDERLINE = Array.from({ length: 24 }, (_, index) => {
	const step = index / 23
	return { x: round(64 + 300 * step), y: round(130 + 16 * step * (1 - step) - 10 * step) }
})

export const SAMPLE_SIGNATURE: SignatureStroke[] = [
	[
		{ x: 48, y: 118 },
		{ x: 60, y: 80 },
		{ x: 72, y: 40 },
		{ x: 80, y: 76 },
		{ x: 86, y: 112 },
	],
	LOOPS,
	UNDERLINE,
]
