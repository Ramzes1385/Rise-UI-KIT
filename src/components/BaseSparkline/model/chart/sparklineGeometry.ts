import type { SparklinePoint } from '../../types/BaseSparkline.types'

const PADDING = 4

export function sparklinePoints(values: readonly number[], context: { height: number; labels: readonly string[] }): SparklinePoint[] {
	const min = Math.min(...values)
	const range = Math.max(...values) - min
	const inner = context.height - PADDING * 2
	const step = values.length > 1 ? 100 / (values.length - 1) : 0
	return values.map((value, index) => ({
		x: values.length > 1 ? index * step : 50,
		y: range ? PADDING + (1 - (value - min) / range) * inner : context.height / 2,
		value,
		label: context.labels[index] ?? '',
	}))
}

export const linePath = (points: readonly SparklinePoint[]): string =>
	points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ')

export function areaPath(points: readonly SparklinePoint[], height: number): string {
	if (!points.length) return ''
	return `${linePath(points)} L${points[points.length - 1].x.toFixed(2)} ${height} L${points[0].x.toFixed(2)} ${height} Z`
}

export const barHeight = (value: number, values: readonly number[]): number => {
	const max = Math.max(...values.map(Math.abs)) || 1
	return Math.max(4, (Math.abs(value) / max) * 100)
}

export function nearestIndex(clientX: number, rect: { left: number; width: number }, count: number): number {
	if (count < 2 || rect.width === 0) return 0
	const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
	return Math.round(ratio * (count - 1))
}
