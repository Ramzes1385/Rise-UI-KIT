import type { BaseRangeEmits, BaseRangeProps } from '@components/BaseRange/model/BaseRange.types'
import type { ComputedRef } from 'vue'

export type RangeMode = 'single' | 'range' | 'points'

export interface UseRangeValuesOptions {
	props: BaseRangeProps
	emit: BaseRangeEmits
}

export interface UseRangeValuesReturn {
	mode: ComputedRef<RangeMode>
	pointValues: ComputedRef<number[]>
	labelText: ComputedRef<string>
	tooltipPosition: ComputedRef<'top' | 'right'>
	fillSegments: ComputedRef<Record<string, string>[]>
	thumbStyle: (value: number) => Record<string, string>
	markStyle: (value: number) => Record<string, string>
	thumbMin: (index: number) => number
	thumbMax: (index: number) => number
	snapToStepValue: (value: number) => number
	setPointValue: (index: number, rawValue: number) => void
	emitChange: () => void
}
