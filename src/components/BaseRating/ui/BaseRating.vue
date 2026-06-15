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
import { useBaseComponent } from '@composables/useBaseComponent'
import { computed, ref } from 'vue'
import type { PropType } from 'vue'

import '../styles/BaseRating.style.scss'
import type { BaseRatingEmits, BaseRatingProps } from '../model/BaseRating.types'
import { rawValueFromPointer, snapRating, starFillPercent, valueFromPointer } from '../model/BaseRating.utils'

/* eslint-disable vue/require-default-prop -- intentionally optional props keep Vue runtime behavior unchanged after withDefaults removal */
const props = defineProps({
	modelValue: { type: Number, default: 0 },
	max: { type: Number, default: 5 },
	step: { type: Number, default: 1 },
	isHoverSmooth: { type: Boolean, default: true },
	icon: { type: String, default: 'star' },
	iconFilled: String,
	isReadonly: { type: Boolean, default: false },
	isDisabled: { type: Boolean, default: false },
	variant: { type: String as PropType<BaseRatingProps['variant']>, default: 'default' },
	sizeScale: { type: Number, default: 100 },
	color: Object as PropType<BaseRatingProps['color']>,
	customClass: [String, Object] as PropType<BaseRatingProps['customClass']>,
})
/* eslint-enable vue/require-default-prop */

const modelValue = computed(() => props.modelValue ?? 0)
const max = computed(() => props.max ?? 5)
const step = computed(() => props.step ?? 1)
const icon = computed(() => props.icon ?? 'star')
const isHoverSmooth = computed(() => props.isHoverSmooth)
const isReadonly = computed(() => props.isReadonly ?? false)
const isDisabled = computed(() => props.isDisabled ?? false)
const sizeScale = computed(() => props.sizeScale ?? 100)

const emit = defineEmits<BaseRatingEmits>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-rating',
	getVariant: () => props.variant,
	getSizeScale: () => sizeScale.value,
	getColor: () => props.color,
	getClass: () => props.customClass,
	elementKeys: ['root', 'icon', 'iconFilled'],
})

const hoverValue = ref(0)

const isInteractive = computed((): boolean => !isReadonly.value && !isDisabled.value)
const displayValue = computed((): number => (hoverValue.value > 0 ? hoverValue.value : modelValue.value))
const filledIcon = computed((): string => props.iconFilled || icon.value)

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

/** Рассчитать оценку по позиции указателя в звезде (точечно при isHoverSmooth) */
function valueAt(event: MouseEvent, star: number): number {
	const ratio = pointerRatio(event, event.currentTarget)
	return isHoverSmooth.value
		? rawValueFromPointer(star, ratio, max.value)
		: valueFromPointer({ star, ratio, step: step.value, max: max.value })
}

/** Выбор оценки по клику — фиксирует ровно то, что показывает предпросмотр */
function handleClick(event: MouseEvent, star: number): void {
	if (!isInteractive.value) return
	const value = valueAt(event, star)
	emit('update:modelValue', value)
	emit('change', value)
}

function handleHover(event: MouseEvent, star: number): void {
	if (!isInteractive.value) return
	hoverValue.value = valueAt(event, star)
}

function clearHover(): void {
	hoverValue.value = 0
}

function changeBy(direction: number): void {
	const next = snapRating(modelValue.value + direction * step.value, step.value, max.value)
	emit('update:modelValue', next)
	emit('change', next)
}

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
