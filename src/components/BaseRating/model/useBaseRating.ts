import { computed, ref } from 'vue'
import type { ComputedRef } from 'vue'
import { ratingBounds } from './ratingBounds'
import { UI_RATING } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { formatMessage, formatNumber } from '@/locales/state'
import { useFormField } from '@composables/form/useFormField'
import { useFormDisabled } from '@composables/form/useFormContext'
import type { StructuredData } from '@utils/seo/structuredDataUtils'
import { useStructuredData } from '@composables/seo/useStructuredData'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseRatingEmits, RatingBounds, RatingProps } from '../types/BaseRating.types'
import { rawValueFromPointer, snapRating, starFillPercent, stepDecimals, valueFromPointer } from '@utils/form/ratingUtils'

function pointerRatio(event: MouseEvent): number {
	const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
	if (rect.width === 0) return 1
	return (event.clientX - rect.left) / rect.width
}

const VALUE_MAX_DECIMALS = 4

function ratingSchema(bounds: RatingBounds): StructuredData | null {
	if (bounds.value <= 0) return null
	return { '@type': 'AggregateRating', ratingValue: bounds.value, bestRating: bounds.max, worstRating: Math.min(1, bounds.step) }
}

function formatRatingValue(value: number, minimumFractionDigits = 0): string {
	return formatNumber(value, { minimumFractionDigits, maximumFractionDigits: Math.max(minimumFractionDigits, VALUE_MAX_DECIMALS) })
}

function ratingAria(props: RatingProps, bounds: RatingBounds, isDisabled: boolean) {
	const values = { value: formatRatingValue(bounds.value), max: bounds.max }
	if (props.isReadonly && !isDisabled) return { role: 'img', 'aria-label': formatMessage(UI_RATING.VALUE_LABEL, values) }
	return {
		role: 'slider',
		tabindex: isDisabled ? undefined : 0,
		'aria-label': formatMessage(UI_RATING.RANGE_LABEL, { max: bounds.max }),
		'aria-valuemin': 0,
		'aria-valuemax': bounds.max,
		'aria-valuenow': bounds.value,
		'aria-valuetext': formatMessage(UI_RATING.VALUE_OF_MAX, values),
		'aria-disabled': isDisabled ? ('true' as const) : undefined,
	}
}

function createKeyActions(bounds: ComputedRef<RatingBounds>, commit: (value: number) => void): Record<string, () => void> {
	const changeBy = (steps: number): void => {
		const { value, step, max } = bounds.value
		commit(snapRating(value + steps * step, step, max))
	}
	const wholeStar = (): number => Math.max(1, bounds.value.step) / bounds.value.step
	return {
		ArrowRight: () => changeBy(1),
		ArrowUp: () => changeBy(1),
		ArrowLeft: () => changeBy(-1),
		ArrowDown: () => changeBy(-1),
		PageUp: () => changeBy(wholeStar()),
		PageDown: () => changeBy(-wholeStar()),
		Home: () => commit(0),
		End: () => commit(bounds.value.max),
	}
}

function usePointerValue(props: RatingProps, bounds: ComputedRef<RatingBounds>) {
	const steppedValueAt = (event: MouseEvent, star: number): number =>
		valueFromPointer({ star, ratio: pointerRatio(event), step: bounds.value.step, max: bounds.value.max })
	return {
		steppedValueAt,
		previewValueAt: (event: MouseEvent, star: number): number =>
			props.isHoverSmooth ? rawValueFromPointer(star, pointerRatio(event), bounds.value.max) : steppedValueAt(event, star),
	}
}

function useRatingInput(
	props: RatingProps,
	emit: BaseRatingEmits,
	state: { bounds: ComputedRef<RatingBounds>; isInteractive: ComputedRef<boolean> },
) {
	const { bounds, isInteractive } = state
	const hoverValue = ref(0)
	const hoverStepValue = ref(0)
	const { steppedValueAt, previewValueAt } = usePointerValue(props, bounds)
	const commit = (value: number): void => {
		emit('update:modelValue', value)
		emit('change', value)
	}
	const keyActions = createKeyActions(bounds, commit)
	const clearHover = (): void => {
		hoverValue.value = 0
		hoverStepValue.value = 0
	}

	return {
		hoverValue,
		hoverStepValue,
		handleClick(event: MouseEvent, star: number): void {
			if (!isInteractive.value) return
			const value = steppedValueAt(event, star)
			hoverValue.value = value
			hoverStepValue.value = value
			commit(value)
		},
		handleHover(event: MouseEvent, star: number): void {
			if (!isInteractive.value) return
			hoverValue.value = previewValueAt(event, star)
			hoverStepValue.value = steppedValueAt(event, star)
		},
		clearHover,
		handleKeydown(event: KeyboardEvent): void {
			if (!isInteractive.value) return
			const action = keyActions[event.key]
			if (!action) return
			event.preventDefault()
			clearHover()
			action()
		},
	}
}

export function useBaseRating(props: RatingProps, emit: BaseRatingEmits) {
	const isControlDisabled = useFormDisabled(() => props.isDisabled)
	const rootRef = ref<HTMLElement | null>(null)
	const formField = useFormField({ value: () => props.modelValue })
	const standard = useStandardBaseComponent('base-rating', props, ['root', 'icon', 'iconFilled', 'value'])
	const isInteractive = computed((): boolean => !props.isReadonly && !isControlDisabled.value)
	const bounds = computed((): RatingBounds => ratingBounds(props))
	const input = useRatingInput(props, emit, { bounds, isInteractive })
	const displayValue = computed((): number => (input.hoverValue.value > 0 ? input.hoverValue.value : bounds.value.value))
	const labelValue = computed((): number => (input.hoverStepValue.value > 0 ? input.hoverStepValue.value : bounds.value.value))

	return {
		...standard,
		ui: useUi(props, 'base-rating'),
		isControlDisabled,
		rootRef,
		isInteractive,
		starCount: computed((): number => bounds.value.max),
		filledIcon: computed((): string => props.iconFilled || (props.icon === 'star' ? 'star-filled' : props.icon)),
		ariaAttrs: computed(() => ratingAria(props, bounds.value, isControlDisabled.value)),
		fillStyle: (star: number): Record<string, string> => ({ '--rating-fill-size': `${starFillPercent(star, displayValue.value)}%` }),
		valueLabel: computed((): string => formatRatingValue(labelValue.value, stepDecimals(bounds.value.step))),
		valueStyle: computed(() => ({
			'--rating-value-chars': String(formatRatingValue(bounds.value.max, stepDecimals(bounds.value.step)).length),
		})),
		...input,
		...useStructuredData(
			'BaseRating',
			() => props.seo,
			() => ratingSchema(bounds.value),
		),
		exposed: {
			rootRef,
			focus: () => rootRef.value?.focus(),
			blur: () => rootRef.value?.blur(),
			validate: formField.validate,
			reset: formField.reset,
		},
	}
}
