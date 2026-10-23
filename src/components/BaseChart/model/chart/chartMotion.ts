import type { ChartMotionState, ChartSpan } from '../../types/BaseChart.types'

const HEAD = 2
const SLOT_SIZE = 2
const SPAN_SIZE = 2

export function packMotion(state: ChartMotionState): number[] {
	return [
		state.min,
		state.max,
		...state.slots.flatMap(slot => [slot.offset, slot.width]),
		...state.spans.flatMap(list => list.flatMap(span => (span ? [span[0], span[1]] : [Number.NaN, Number.NaN]))),
	]
}

function readSpan(vector: readonly number[], start: number): ChartSpan {
	const base = vector[start]
	const top = vector[start + 1]
	return Number.isFinite(base) && Number.isFinite(top) ? ([base, top] as const) : null
}

export function unpackMotion(vector: readonly number[], seriesCount: number, count: number): ChartMotionState {
	const spansStart = HEAD + seriesCount * SLOT_SIZE
	return {
		min: vector[0],
		max: vector[1],
		slots: Array.from({ length: seriesCount }, (_, index) => ({
			offset: vector[HEAD + index * SLOT_SIZE],
			width: vector[HEAD + index * SLOT_SIZE + 1],
		})),
		spans: Array.from({ length: seriesCount }, (_, series) =>
			Array.from({ length: count }, (_, index) => readSpan(vector, spansStart + (series * count + index) * SPAN_SIZE)),
		),
	}
}

export function baselineState(state: ChartMotionState): ChartMotionState {
	const base = Math.min(state.max, Math.max(state.min, 0))
	return { ...state, spans: state.spans.map(list => list.map(span => (span ? ([base, base] as const) : null))) }
}

export function motionStructure(spans: readonly ChartSpan[][], layout: string): string {
	return `${layout}|${spans.map(list => list.map(span => (span ? 1 : 0)).join('')).join('/')}`
}
