import { GRID_BREAKPOINTS } from '../types/BaseGrid.types'
import type { GridSpan } from '../types/BaseGridItem.types'
import type { GridResponsive, GridStep, StepValues } from '../types/BaseGrid.types'

const STEPS: readonly GridStep[] = ['base', ...GRID_BREAKPOINTS]

function isStepObject<T>(value: GridResponsive<T>): value is { base?: T } & StepValues<T> {
	return typeof value === 'object' && value !== null
}
function toSteps<T>(value: GridResponsive<T> | undefined): StepValues<T> {
	if (value === undefined) return {}
	return isStepObject(value) ? value : { base: value }
}
export function responsiveVars<T extends string | number>(prefix: string, value: GridResponsive<T> | undefined): Record<string, T> {
	const steps = toSteps(value)
	const vars: Record<string, T> = {}
	for (const step of STEPS) {
		const stepValue = steps[step]
		if (stepValue !== undefined) vars[`--${prefix}-${step}`] = stepValue
	}
	return vars
}
export function toGridColumn(span: GridSpan, offset: number): string {
	const end = span === 'full' ? '-1' : `span ${span}`
	if (offset > 0) return `${offset + 1} / ${end}`
	return span === 'full' ? '1 / -1' : end
}
export function columnVars(span: GridResponsive<GridSpan> | undefined, offset: GridResponsive<number> | undefined): Record<string, string> {
	const spans = toSteps(span)
	const offsets = toSteps(offset)
	const vars: Record<string, string> = {}
	let currentSpan: GridSpan = 1
	let currentOffset = 0
	for (const step of STEPS) {
		if (spans[step] === undefined && offsets[step] === undefined) continue
		currentSpan = spans[step] ?? currentSpan
		currentOffset = offsets[step] ?? currentOffset
		vars[`--base-grid-item-column-${step}`] = toGridColumn(currentSpan, currentOffset)
	}
	return vars
}
