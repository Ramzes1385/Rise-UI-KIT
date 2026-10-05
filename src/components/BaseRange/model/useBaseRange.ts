import type { Ref } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { computed, ref, useSlots } from 'vue'
import { useUi } from '@composables/base/useUi'
import { toPercent } from '@utils/form/rangeUtils'
import { useFormField } from '@composables/form/useFormField'
import { useRangeDrag } from '@composables/range/useRangeDrag'
import { useFormDisabled } from '@composables/form/useFormContext'
import { useRangeValues } from '@composables/range/useRangeValues'
import type { BaseRangeEmits, RangeProps } from '../types/BaseRange.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { UseRangeValuesReturn } from '@composables/range/useRangeValues'

const RANGE_ELEMENTS = [
	'root',
	'label',
	'labelMin',
	'labelValue',
	'labelMax',
	'body',
	'trackWrapper',
	'track',
	'fill',
	'thumbContainer',
	'thumb',
	'thumbDot',
	'marks',
	'mark',
	'markTick',
	'markText',
]

function fillStyle(from: number, to: number): Record<string, string> {
	return { '--range-fill-start': `${Math.min(from, to)}%`, '--range-fill-end': `${Math.max(from, to)}%` }
}

function useRangeGeometry(values: UseRangeValuesReturn) {
	const percent = (value: number): number => toPercent({ value, min: values.bounds.value.min, max: values.bounds.value.max })
	return {
		fillSegments: computed((): Record<string, string>[] => {
			const percents = values.pointValues.value.map(percent)
			if (values.mode.value === 'single') return [fillStyle(0, percents[0])]
			return percents.slice(0, -1).map((from, index) => fillStyle(from, percents[index + 1]))
		}),
		thumbStyle: (value: number): Record<string, string> => ({ '--range-offset': String(percent(value)) }),
	}
}

function useThumbDrag(props: RangeProps, values: UseRangeValuesReturn, track: { ref: Ref<HTMLElement | null>; isDisabled: () => boolean }) {
	const isMoved = ref(false)
	let isJump = false
	const drag = useRangeDrag({
		trackRef: track.ref,
		pointValues: values.pointValues,
		isDisabled: track.isDisabled,
		min: () => values.bounds.value.min,
		max: () => values.bounds.value.max,
		step: () => values.bounds.value.step,
		isVertical: () => props.isVertical,
		thumbMin: values.thumbMin,
		thumbMax: values.thumbMax,
		snapToStepValue: values.snapToStepValue,
		setPointValue: (index: number, value: number): void => {
			if (drag.activeIndex.value !== null && !isJump) isMoved.value = true
			values.setPointValue(index, value)
		},
		emitChange: values.emitChange,
	})

	return {
		...drag,
		isDragging: computed((): boolean => isMoved.value && drag.activeIndex.value !== null),
		handleThumbDown(payload: { event: MouseEvent | TouchEvent; index: number }): void {
			isMoved.value = false
			drag.handleThumbDown(payload)
		},
		handleTrackDown(event: MouseEvent): void {
			isMoved.value = false
			isJump = true
			drag.handleTrackDown(event)
			isJump = false
		},
	}
}

export function useBaseRange(props: RangeProps, emit: BaseRangeEmits) {
	const isControlDisabled = useFormDisabled(() => props.isDisabled)
	const standard = useStandardBaseComponent('base-range', props, RANGE_ELEMENTS)
	const slots = useSlots()
	const rootRef = ref<HTMLElement | null>(null)
	const trackRef = ref<HTMLElement | null>(null)
	const formField = useFormField({ value: () => props.modelValue })
	const values = useRangeValues({ props, emit })
	const thumb = (): HTMLElement | null | undefined => rootRef.value?.querySelector<HTMLElement>('.base-range__thumb')

	return {
		...standard,
		ui: useUi(props, 'base-range'),
		isControlDisabled,
		rootRef,
		trackRef,
		hasThumbSlot: computed((): boolean => Boolean(slots.thumb)),
		...values,
		...useRangeGeometry(values),
		thumbLabel(index: number): string {
			if (values.mode.value === 'single') return props.ariaLabel || UI_ARIA.RANGE_VALUE
			let role: string = `${UI_ARIA.RANGE_POINT} ${index + 1}`
			if (values.mode.value === 'range') role = index === 0 ? UI_ARIA.RANGE_MIN : UI_ARIA.RANGE_MAX
			return props.ariaLabel ? `${props.ariaLabel}: ${role.toLowerCase()}` : role
		},
		...useThumbDrag(props, values, { ref: trackRef, isDisabled: () => isControlDisabled.value }),
		exposed: {
			rootRef,
			focus: () => thumb()?.focus(),
			blur: () => thumb()?.blur(),
			validate: formField.validate,
			reset: formField.reset,
		},
	}
}
