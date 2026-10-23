import type { ChartFrame, ChartRect, ChartSlot, ChartSpan } from '../../types/BaseChart.types'

const BAND_FILL = 0.7
const STACK_FILL = 0.6

const fixed = (value: number): string => value.toFixed(2)

export function xPosition(index: number, frame: ChartFrame): number {
	if (frame.isBand) return ((index + 0.5) / frame.count) * 100
	return frame.count > 1 ? (index / (frame.count - 1)) * 100 : 50
}

export function yPosition(value: number, frame: ChartFrame): number {
	const { min, max } = frame.domain
	return (1 - (value - min) / (max - min)) * 100
}

function segments(spans: readonly ChartSpan[]): { index: number; span: readonly [number, number] }[][] {
	const result: { index: number; span: readonly [number, number] }[][] = [[]]
	spans.forEach((span, index) => {
		if (span) result[result.length - 1].push({ index, span })
		else if (result[result.length - 1].length) result.push([])
	})
	return result.filter(segment => segment.length)
}

export function linePath(spans: readonly ChartSpan[], frame: ChartFrame): string {
	return segments(spans)
		.map(segment =>
			(segment.length > 1 ? segment : [segment[0], segment[0]])
				.map(
					({ index, span }, order) => `${order ? 'L' : 'M'}${fixed(xPosition(index, frame))} ${fixed(yPosition(span[1], frame))}`,
				)
				.join(' '),
		)
		.join(' ')
}

export function areaPath(spans: readonly ChartSpan[], frame: ChartFrame): string {
	return segments(spans)
		.map(segment => {
			const top = segment.map(({ index, span }) => `${fixed(xPosition(index, frame))} ${fixed(yPosition(span[1], frame))}`)
			const bottom = [...segment]
				.reverse()
				.map(({ index, span }) => `${fixed(xPosition(index, frame))} ${fixed(yPosition(span[0], frame))}`)
			return `M${[...top, ...bottom].join(' L')} Z`
		})
		.join(' ')
}

export function bandSlot(order: number, total: number, isHidden = false): ChartSlot {
	const fill = total > 1 ? BAND_FILL : STACK_FILL
	const width = fill / Math.max(1, total)
	return { offset: (1 - fill) / 2 + order * width, width: isHidden ? 0 : width }
}

export function barRect(span: readonly [number, number], slot: ChartSlot & { index: number }, frame: ChartFrame): ChartRect {
	const band = 100 / frame.count
	const top = yPosition(Math.max(span[0], span[1]), frame)
	return {
		x: (slot.index + slot.offset) * band,
		y: top,
		width: slot.width * band,
		height: Math.max(0, yPosition(Math.min(span[0], span[1]), frame) - top),
	}
}

export function nearestIndex(ratio: number, frame: Pick<ChartFrame, 'count' | 'isBand'>): number {
	const clamped = Math.min(1, Math.max(0, ratio))
	if (frame.isBand) return Math.min(frame.count - 1, Math.floor(clamped * frame.count))
	return Math.round(clamped * (frame.count - 1))
}

export function tickIndexes(count: number, maxTicks: number): number[] {
	const step = Math.max(1, Math.ceil(count / Math.max(1, maxTicks)))
	return Array.from({ length: Math.ceil(count / step) }, (_, order) => order * step)
}
