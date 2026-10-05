import type { ChartDomain, ChartSpan } from '../../types/BaseChart.types'

const NICE_STEPS: readonly (readonly [number, number])[] = [
	[Math.sqrt(50), 10],
	[Math.sqrt(10), 5],
	[Math.SQRT2, 2],
]
const EPSILON = 1e-9

const clean = (value: number): number => Number(value.toPrecision(12))

function niceStep(span: number, count: number): number {
	const raw = span / Math.max(1, count)
	const power = 10 ** Math.floor(Math.log10(raw))
	const error = raw / power
	return (NICE_STEPS.find(([limit]) => error >= limit)?.[1] ?? 1) * power
}

function widen(low: number, high: number): [number, number] {
	if (low !== high) return [low, high]
	if (low === 0) return [0, 1]
	const half = Math.abs(low) / 2
	return [low - half, high + half]
}

export function chartDomain(values: readonly number[], count: number): ChartDomain {
	const [low, high] = widen(Math.min(...values), Math.max(...values))
	const step = niceStep(high - low, count)
	const min = clean(Math.floor(low / step + EPSILON) * step)
	const max = clean(Math.ceil(high / step - EPSILON) * step)
	const length = Math.round((max - min) / step) + 1
	return { min, max, ticks: Array.from({ length }, (_, index) => clean(min + index * step)) }
}

export function seriesSpans(values: readonly (number | null)[], count: number): ChartSpan[] {
	return Array.from({ length: count }, (_, index) => {
		const value = values[index]
		return typeof value === 'number' && Number.isFinite(value) ? ([0, value] as const) : null
	})
}

export function stackSpans(series: readonly (readonly (number | null)[])[], count: number, hidden: readonly boolean[] = []): ChartSpan[][] {
	const positive = new Array<number>(count).fill(0)
	const negative = new Array<number>(count).fill(0)
	return series.map((values, order) =>
		seriesSpans(values, count).map((span, index) => {
			if (!span) return null
			const sums = span[1] >= 0 ? positive : negative
			const base = sums[index]
			if (hidden[order]) return [base, base] as const
			sums[index] = base + span[1]
			return [base, base + span[1]] as const
		}),
	)
}

export function spanExtent(spans: readonly ChartSpan[][], hasZero: boolean): number[] {
	const values = spans.flatMap(list => list.flatMap(span => (span ? [span[1]] : [])))
	return hasZero || !values.length ? [0, ...values] : values
}
