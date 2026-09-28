/** Composable: логика BaseRange — значения ползунков, перетаскивание и их доступные имена */
import { computed, ref, useSlots } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { useFormField } from '@composables/useFormField'
import { useRangeDrag } from '@composables/useRangeDrag'
import { useRangeValues } from '@composables/useRangeValues'
import { useFormDisabled } from '@composables/useFormContext'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { Ref } from 'vue'
import type { UseRangeValuesReturn } from '@composables/useRangeValues'
import type { BaseRangeEmits, RangeProps } from '../types/BaseRange.types'

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

function useThumbDrag(props: RangeProps, values: UseRangeValuesReturn, track: { ref: Ref<HTMLElement | null>; isDisabled: () => boolean }) {
	return useRangeDrag({
		trackRef: track.ref,
		pointValues: values.pointValues,
		isDisabled: track.isDisabled,
		min: () => props.min,
		max: () => props.max,
		step: () => props.step,
		isVertical: () => props.isVertical,
		thumbMin: values.thumbMin,
		thumbMax: values.thumbMax,
		snapToStepValue: values.snapToStepValue,
		setPointValue: values.setPointValue,
		emitChange: values.emitChange,
	})
}

export function useBaseRange(props: RangeProps, emit: BaseRangeEmits) {
	// Блокировка: свой isDisabled или неактивная BaseForm вокруг (fieldset формы блокирует только нативные поля)
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
		isControlDisabled,
		rootRef,
		trackRef,
		hasThumbSlot: computed((): boolean => Boolean(slots.thumb)),
		...values,
		/** Доступное имя ползунка: у диапазона и точек — с ролью ползунка, чтобы скринридер различал их («Цена: минимум», «Точка 2») */
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
