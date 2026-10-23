import type { ComputedRef } from 'vue'
import { computed, ref, useId } from 'vue'
import { useUi } from '@composables/base/useUi'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { useSlidingIndicator } from '@composables/interaction/useSlidingIndicator'
import { useFieldControl, useFormDisabled } from '@composables/form/useFormContext'
import type { BaseSegmentedEmits, BaseSegmentedProps } from '../types/BaseSegmented.types'

function useSegmentedIndicator(props: BaseSegmentedProps, isControlDisabled: ComputedRef<boolean>) {
	const trackRef = ref<HTMLElement | null>(null)
	const activeIndex = computed(() => props.options.findIndex(option => option.value === props.modelValue))
	const indicator = useSlidingIndicator(trackRef, activeIndex)

	return {
		trackRef,
		indicatorStyle: indicator.style,
		isIndicatorVisible: indicator.isVisible,
		isIndicatorInstant: indicator.isInstant,
		isIndicatorDisabled: computed(() => isControlDisabled.value || Boolean(props.options[activeIndex.value]?.isDisabled)),
	}
}

export function useBaseSegmented(props: BaseSegmentedProps, emit: BaseSegmentedEmits) {
	const ownId = useId()
	const labelId = `${ownId}-label`
	const errorId = `${ownId}-error`
	const control = useFieldControl({
		isLabelable: false,
		describedBy: () => (props.error ? errorId : undefined),
		hasError: () => Boolean(props.error),
	})
	const isControlDisabled = useFormDisabled(() => props.isDisabled)

	return {
		...useStandardBaseComponent('base-segmented', props, ['root', 'label', 'track', 'segment', 'error']),
		...useSegmentedIndicator(props, isControlDisabled),
		ui: useUi(props, 'base-segmented'),
		labelId,
		errorId,
		radioName: computed(() => props.name ?? `rise-segmented-${ownId}`),
		isControlDisabled,
		control,
		labelledBy: computed(() => (props.label ? labelId : control.fieldLabelId.value)),
		select(value: string | number): void {
			emit('update:modelValue', value)
			emit('change', value)
		},
	}
}
