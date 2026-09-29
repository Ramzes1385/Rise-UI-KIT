import { computed, ref } from 'vue'
import type { ComputedRef } from 'vue'
import { UI_RATING } from '@/locales/messages'
import { useFormField } from '@composables/form/useFormField'
import { useFormDisabled } from '@composables/form/useFormContext'
import type { BaseRatingEmits, RatingProps } from '../types/BaseRating.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { rawValueFromPointer, snapRating, starFillPercent, valueFromPointer } from '@utils/form/ratingUtils'

function pointerRatio(event: MouseEvent): number {
	const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
	if (rect.width === 0) return 1
	return (event.clientX - rect.left) / rect.width
}

function ratingAria(props: RatingProps, isDisabled: boolean) {
	const valueText = `${props.modelValue} ${UI_RATING.OF} ${props.max}`
	if (props.isReadonly && !isDisabled) return { role: 'img', 'aria-label': `${UI_RATING.LABEL} ${valueText}` }
	return {
		role: 'slider',
		tabindex: isDisabled ? undefined : 0,
		'aria-label': `${UI_RATING.ARIA_PREFIX} ${props.max}`,
		'aria-valuemin': 0,
		'aria-valuemax': props.max,
		'aria-valuenow': props.modelValue,
		'aria-valuetext': valueText,
		'aria-disabled': isDisabled ? ('true' as const) : undefined,
	}
}

function createKeyActions(props: RatingProps, commit: (value: number) => void): Record<string, () => void> {
	const changeBy = (direction: number): void => commit(snapRating(props.modelValue + direction * props.step, props.step, props.max))
	return {
		ArrowRight: () => changeBy(1),
		ArrowUp: () => changeBy(1),
		ArrowLeft: () => changeBy(-1),
		ArrowDown: () => changeBy(-1),
		Home: () => commit(0),
		End: () => commit(props.max),
	}
}

function usePointerValue(props: RatingProps) {
	const steppedValueAt = (event: MouseEvent, star: number): number =>
		valueFromPointer({ star, ratio: pointerRatio(event), step: props.step, max: props.max })
	return {
		steppedValueAt,
		previewValueAt: (event: MouseEvent, star: number): number =>
			props.isHoverSmooth ? rawValueFromPointer(star, pointerRatio(event), props.max) : steppedValueAt(event, star),
	}
}

function useRatingInput(props: RatingProps, emit: BaseRatingEmits, isInteractive: ComputedRef<boolean>) {
	const hoverValue = ref(0)
	const { steppedValueAt, previewValueAt } = usePointerValue(props)
	const commit = (value: number): void => {
		emit('update:modelValue', value)
		emit('change', value)
	}
	const keyActions = createKeyActions(props, commit)

	return {
		hoverValue,
		handleClick(event: MouseEvent, star: number): void {
			if (!isInteractive.value) return
			const value = steppedValueAt(event, star)
			hoverValue.value = value
			commit(value)
		},
		handleHover(event: MouseEvent, star: number): void {
			if (isInteractive.value) hoverValue.value = previewValueAt(event, star)
		},
		clearHover(): void {
			hoverValue.value = 0
		},
		handleKeydown(event: KeyboardEvent): void {
			if (!isInteractive.value) return
			const action = keyActions[event.key]
			if (!action) return
			event.preventDefault()
			action()
		},
	}
}

export function useBaseRating(props: RatingProps, emit: BaseRatingEmits) {
	const isControlDisabled = useFormDisabled(() => props.isDisabled)
	const rootRef = ref<HTMLElement | null>(null)
	const formField = useFormField({ value: () => props.modelValue })
	const standard = useStandardBaseComponent('base-rating', props, ['root', 'icon', 'iconFilled'])
	const isInteractive = computed((): boolean => !props.isReadonly && !isControlDisabled.value)
	const input = useRatingInput(props, emit, isInteractive)
	const displayValue = computed((): number => (input.hoverValue.value > 0 ? input.hoverValue.value : props.modelValue))

	return {
		...standard,
		isControlDisabled,
		rootRef,
		isInteractive,
		filledIcon: computed((): string => props.iconFilled || (props.icon === 'star' ? 'star-filled' : props.icon)),
		ariaAttrs: computed(() => ratingAria(props, isControlDisabled.value)),
		fillPercent: (star: number): number => starFillPercent(star, displayValue.value),
		...input,
		exposed: {
			rootRef,
			focus: () => rootRef.value?.focus(),
			blur: () => rootRef.value?.blur(),
			validate: formField.validate,
			reset: formField.reset,
		},
	}
}
