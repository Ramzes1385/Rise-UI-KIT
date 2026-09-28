/** Composable: логика BaseRating — предпросмотр под указателем, выбор кликом и клавишами слайдера */
import { computed, ref } from 'vue'
import type { ComputedRef } from 'vue'
import { UI_RATING } from '@/locales/messages'
import { useFormField } from '@composables/useFormField'
import { useFormDisabled } from '@composables/useFormContext'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseRatingEmits, RatingProps } from '../types/BaseRating.types'
import { rawValueFromPointer, snapRating, starFillPercent, valueFromPointer } from '@utils/ratingUtils'

function pointerRatio(event: MouseEvent, target: EventTarget | null): number {
	/* istanbul ignore next — defensive: currentTarget звезды всегда HTMLElement */
	if (!(target instanceof HTMLElement)) return 1
	const rect = target.getBoundingClientRect()
	/* istanbul ignore next — defensive: отрисованная звезда всегда имеет ненулевую ширину */
	if (rect.width === 0) return 1
	return (event.clientX - rect.left) / rect.width
}

/**
 * ARIA корня. Интерактивный и отключённый рейтинг — slider: значение, границы и текст «3 из 5»; отключённый —
 * aria-disabled и без tabindex (не получает фокус ни с клавиатуры, ни кликом). Только чтение — изображение
 * с оценкой в имени («Оценка 4.5 из 5»): менять его нельзя
 */
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

/** Клавиши слайдера: стрелки — шаг step (вправо/вверх — больше), Home — 0, End — максимум */
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

/** Оценка по позиции указателя в звезде: клик — всегда с привязкой к step, предпросмотр при isHoverSmooth — попиксельно */
function usePointerValue(props: RatingProps) {
	const steppedValueAt = (event: MouseEvent, star: number): number =>
		valueFromPointer({ star, ratio: pointerRatio(event, event.currentTarget), step: props.step, max: props.max })
	return {
		steppedValueAt,
		previewValueAt: (event: MouseEvent, star: number): number =>
			props.isHoverSmooth
				? rawValueFromPointer(star, pointerRatio(event, event.currentTarget), props.max)
				: steppedValueAt(event, star),
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
			// Сразу показываем зафиксированную оценку, иначе до движения курсора видна плавная заливка предпросмотра
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
	// Блокировка: свой isDisabled или неактивная BaseForm вокруг (fieldset формы блокирует только нативные поля)
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
		// Заполненная иконка: явный iconFilled; для звезды по умолчанию — сплошная звезда (форма, а не только цвет), иначе та же icon
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
