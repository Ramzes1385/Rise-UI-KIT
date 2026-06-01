<template>
	<div
		class="base-rating"
		:class="[variantClass, classes.root, { 'base-rating--readonly': isInteractive === false }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="slider"
		:aria-label="`Оценка от 0 до ${max}`"
		:aria-valuemin="0"
		:aria-valuemax="max"
		:aria-valuenow="modelValue"
		:tabindex="isInteractive ? 0 : -1"
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
import { BaseIcon } from '@components/BaseIcon'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import { computed, ref } from 'vue'

import './BaseRating.style.scss'
import type { BaseRatingEmits, BaseRatingProps } from './BaseRating.types'
import { rawValueFromPointer, snapRating, starFillPercent, valueFromPointer } from './BaseRating.utils'

const props = withDefaults(defineProps<BaseRatingProps>(), {
	modelValue: 0,
	max: 5,
	step: 1,
	icon: 'star',
	isHoverSmooth: true,
	isReadonly: false,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
})

const emit = defineEmits<BaseRatingEmits>()

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'icon', 'iconFilled'],
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-rating', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const hoverValue = ref(0)

const isInteractive = computed((): boolean => !props.isReadonly && !props.isDisabled)
const displayValue = computed((): number => (hoverValue.value > 0 ? hoverValue.value : props.modelValue))
const filledIcon = computed((): string => props.iconFilled || props.icon)

/** Процент заливки звезды по индексу */
function fillPercent(star: number): number {
	return starFillPercent(star, displayValue.value)
}

/** Доля позиции указателя внутри звезды (0..1) */
function pointerRatio(event: MouseEvent, target: EventTarget | null): number {
	/* istanbul ignore next — defensive: currentTarget звезды всегда HTMLElement */
	if (!(target instanceof HTMLElement)) return 1
	const rect = target.getBoundingClientRect()
	/* istanbul ignore next — defensive: отрисованная звезда всегда имеет ненулевую ширину */
	if (rect.width === 0) return 1
	return (event.clientX - rect.left) / rect.width
}

/** Рассчитать оценку по позиции указателя в звезде (точечно при isHoverSmooth) */
function valueAt(event: MouseEvent, star: number): number {
	const ratio = pointerRatio(event, event.currentTarget)
	return props.isHoverSmooth
		? rawValueFromPointer(star, ratio, props.max)
		: valueFromPointer({ star, ratio, step: props.step, max: props.max })
}

/** Выбор оценки по клику — фиксирует ровно то, что показывает предпросмотр */
function handleClick(event: MouseEvent, star: number): void {
	if (!isInteractive.value) return
	const value = valueAt(event, star)
	emit('update:modelValue', value)
	emit('change', value)
}

/** Предпросмотр оценки при наведении */
function handleHover(event: MouseEvent, star: number): void {
	if (!isInteractive.value) return
	hoverValue.value = valueAt(event, star)
}

/** Сброс предпросмотра */
function clearHover(): void {
	hoverValue.value = 0
}

/** Изменение оценки на шаг */
function changeBy(direction: number): void {
	const next = snapRating(props.modelValue + direction * props.step, props.step, props.max)
	emit('update:modelValue', next)
	emit('change', next)
}

/** Навигация стрелками */
function handleKeydown(event: KeyboardEvent): void {
	if (!isInteractive.value) return
	if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
		event.preventDefault()
		changeBy(1)
	} else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
		event.preventDefault()
		changeBy(-1)
	}
}
</script>
