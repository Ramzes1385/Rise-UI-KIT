import type { PieSegment, PieSegmentView } from '../../types/BasePieChart.types'

export const RADIUS = 15.915

export const PIE_RADIUS = 10.5

const CIRCUMFERENCE = 100

const GAP = 0.8

export function foldSegments(segments: readonly PieSegment[], context: { max: number; other: string }): PieSegment[] {
	const colored = segments.map((segment, index) => ({ ...segment, color: segment.color ?? `var(--rise-chart-${(index % 8) + 1})` }))
	if (colored.length <= context.max) return colored
	const rest = colored.slice(context.max - 1)
	const other = { label: context.other, value: rest.reduce((sum, segment) => sum + segment.value, 0), color: 'var(--rise-text-dimmed)' }
	return [...colored.slice(0, context.max - 1), other]
}

export function segmentViews(segments: readonly PieSegment[]): PieSegmentView[] {
	const total = segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0)
	let start = 0
	return segments.map(segment => {
		const percent = total ? (Math.max(0, segment.value) / total) * 100 : 0
		const length = segments.length > 1 ? Math.max(0, percent - GAP) : percent
		const view = {
			label: segment.label,
			value: segment.value,
			color: segment.color as string,
			percent,
			dash: `${length} ${CIRCUMFERENCE - length}`,
			offset: 25 - start,
		}
		start += percent
		return view
	})
}
