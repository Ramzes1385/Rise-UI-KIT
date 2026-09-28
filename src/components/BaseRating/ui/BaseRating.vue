<template>
	<div
		ref="rootRef"
		class="base-rating"
		:class="[
			variantClass,
			classes.root,
			{
				'base-rating--interactive': isInteractive,
				'base-rating--readonly': isReadonly,
				'base-rating--disabled': isControlDisabled,
			},
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		v-bind="ariaAttrs"
		@mouseleave="clearHover"
		@keydown="handleKeydown">
		<span
			v-for="star in max"
			:key="star"
			class="base-rating__star"
			@click="handleClick($event, star)"
			@mousemove="handleHover($event, star)">
			<BaseIcon :name="icon" :size-scale="sizeScale" :custom-class="classes.icon" aria-label="" />
			<span class="base-rating__star-fill" :style="{ width: `${fillPercent(star)}%` }">
				<BaseIcon :name="filledIcon" :size-scale="sizeScale" :custom-class="classes.iconFilled" aria-label="" />
			</span>
		</span>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { UI_RATING } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { kitDefaults } from '@composables/useDefaults'
import { useFormField } from '@composables/useFormField'
import { useFormDisabled } from '@composables/useFormContext'
import { rawValueFromPointer, snapRating, starFillPercent, valueFromPointer } from '@utils/ratingUtils'
import '../styles/BaseRating.style.scss'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseRatingEmits, BaseRatingProps, BaseRatingSlots } from '../model/BaseRating.types'

const props = withDefaults(
	defineProps<BaseRatingProps>(),
	kitDefaults('BaseRating', {
		modelValue: 0,
		max: 5,
		step: 1,
		isHoverSmooth: true,
		icon: 'star',
		isReadonly: false,
		isDisabled: false,
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

/** Блокировка: свой isDisabled или неактивная BaseForm вокруг (fieldset формы блокирует только нативные поля) */
const isControlDisabled = useFormDisabled(() => props.isDisabled)

const emit = defineEmits<BaseRatingEmits>()

defineSlots<BaseRatingSlots>()

const rootRef = ref<HTMLElement | null>(null)

const formField = useFormField({
	value: () => props.modelValue,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-rating', props, [
	'root',
	'icon',
	'iconFilled',
])

const hoverValue = ref(0)

const isInteractive = computed((): boolean => !props.isReadonly && !isControlDisabled.value)
const displayValue = computed((): number => (hoverValue.value > 0 ? hoverValue.value : props.modelValue))
/** Заполненная иконка: явный iconFilled; для звезды по умолчанию — сплошная звезда (форма, а не только цвет), иначе та же icon. */
const filledIcon = computed((): string => props.iconFilled || (props.icon === 'star' ? 'star-filled' : props.icon))

/**
 * ARIA корня. Интерактивный и отключённый рейтинг — slider: значение, границы и текст «3 из 5»; отключённый —
 * aria-disabled и без tabindex (не получает фокус ни с клавиатуры, ни кликом). Только чтение — изображение
 * с оценкой в имени («Оценка 4.5 из 5»): менять его нельзя.
 */
const ariaAttrs = computed(() => {
	const valueText = `${props.modelValue} ${UI_RATING.OF} ${props.max}`
	if (props.isReadonly && !isControlDisabled.value) {
		return { role: 'img', 'aria-label': `${UI_RATING.LABEL} ${valueText}` }
	}
	return {
		role: 'slider',
		tabindex: isControlDisabled.value ? undefined : 0,
		'aria-label': `${UI_RATING.ARIA_PREFIX} ${props.max}`,
		'aria-valuemin': 0,
		'aria-valuemax': props.max,
		'aria-valuenow': props.modelValue,
		'aria-valuetext': valueText,
		'aria-disabled': isControlDisabled.value ? ('true' as const) : undefined,
	}
})

function fillPercent(star: number): number {
	return starFillPercent(star, displayValue.value)
}

function pointerRatio(event: MouseEvent, target: EventTarget | null): number {
	/* istanbul ignore next — defensive: currentTarget звезды всегда HTMLElement */
	if (!(target instanceof HTMLElement)) return 1
	const rect = target.getBoundingClientRect()
	/* istanbul ignore next — defensive: отрисованная звезда всегда имеет ненулевую ширину */
	if (rect.width === 0) return 1
	return (event.clientX - rect.left) / rect.width
}

/** Рассчитать оценку по позиции указателя в звезде с привязкой к step */
function steppedValueAt(event: MouseEvent, star: number): number {
	const ratio = pointerRatio(event, event.currentTarget)
	return valueFromPointer({ star, ratio, step: props.step, max: props.max })
}

/** Значение предпросмотра: при isHoverSmooth заливка следует за курсором попиксельно, иначе — по step */
function previewValueAt(event: MouseEvent, star: number): number {
	if (!props.isHoverSmooth) return steppedValueAt(event, star)
	return rawValueFromPointer(star, pointerRatio(event, event.currentTarget), props.max)
}

/** Выбранная пользователем оценка: v-model и change */
function commit(value: number): void {
	emit('update:modelValue', value)
	emit('change', value)
}

/** Выбор оценки по клику — всегда с привязкой к step: isHoverSmooth влияет только на предпросмотр */
function handleClick(event: MouseEvent, star: number): void {
	if (!isInteractive.value) return
	const value = steppedValueAt(event, star)
	// Сразу показываем зафиксированную оценку, иначе до движения курсора видна плавная заливка предпросмотра
	hoverValue.value = value
	commit(value)
}

function handleHover(event: MouseEvent, star: number): void {
	if (!isInteractive.value) return
	hoverValue.value = previewValueAt(event, star)
}

function clearHover(): void {
	hoverValue.value = 0
}

function changeBy(direction: number): void {
	commit(snapRating(props.modelValue + direction * props.step, props.step, props.max))
}

/** Клавиши слайдера: стрелки — шаг step (вправо/вверх — больше), Home — 0, End — максимум */
const KEY_ACTIONS: Record<string, () => void> = {
	ArrowRight: () => changeBy(1),
	ArrowUp: () => changeBy(1),
	ArrowLeft: () => changeBy(-1),
	ArrowDown: () => changeBy(-1),
	Home: () => commit(0),
	End: () => commit(props.max),
}

function handleKeydown(event: KeyboardEvent): void {
	if (!isInteractive.value) return
	const action = KEY_ACTIONS[event.key]
	if (!action) return
	event.preventDefault()
	action()
}

defineExpose({
	rootRef,
	focus: () => rootRef.value?.focus(),
	blur: () => rootRef.value?.blur(),
	validate: formField.validate,
	reset: formField.reset,
})
</script>
