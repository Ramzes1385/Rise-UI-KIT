<template>
	<div
		class="base-range"
		:class="[
			`base-range--${variant}`,
			{
				'base-range--disabled': isDisabled,
				'base-range--vertical': isVertical,
			},
		]"
		:style="sizeScaleStyle">
		<!-- Метка значения -->
		<div v-if="hasLabel" class="base-range__label">
			<span class="base-range__label-min">{{ min }}</span>
			<span class="base-range__label-value">{{
				isRange ? `${rangeValue?.[0]} — ${rangeValue?.[1]}` : modelValue
			}}</span>
			<span class="base-range__label-max">{{ max }}</span>
		</div>

		<div class="base-range__track-wrapper" ref="trackRef">
			<!-- Трек -->
			<div class="base-range__track">
				<div class="base-range__fill" :style="fillStyle"></div>
			</div>

			<!-- Метки -->
			<div v-if="marks.length" class="base-range__marks">
				<span v-for="mark in marks" :key="mark.value" class="base-range__mark" :style="markStyle(mark.value)">
					<span class="base-range__mark-dot"></span>
					<span v-if="mark.label" class="base-range__mark-text">{{ mark.label }}</span>
				</span>
			</div>

			<!-- Ползунок 1 (одиночный или левый диапазон) -->
			<div
				class="base-range__thumb"
				:style="thumbStyle(firstValue)"
				@mousedown="handleThumbDown($event, 'first')"
				@touchstart.prevent="handleThumbDown($event, 'first')">
				<span v-if="hasTooltip" class="base-range__tooltip">{{ firstValue }}</span>
			</div>

			<!-- Ползунок 2 (правый диапазон) -->
			<div
				v-if="isRange"
				class="base-range__thumb"
				:style="thumbStyle(rangeValue?.[1] ?? max)"
				@mousedown="handleThumbDown($event, 'second')"
				@touchstart.prevent="handleThumbDown($event, 'second')">
				<span v-if="hasTooltip" class="base-range__tooltip">{{ rangeValue?.[1] }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { snapToStep, toPercent } from '@/shared/utils/rangeUtils'
import { computed, ref } from 'vue'
import './BaseRange.style.scss'
import type { BaseRangeEmits, BaseRangeProps } from './BaseRange.types'

const props = withDefaults(defineProps<BaseRangeProps>(), {
	modelValue: 0,
	min: 0,
	max: 100,
	step: 1,
	variant: 'primary',
	isDisabled: false,
	hasTooltip: false,
	marks: () => [],
	isVertical: false,
	hasLabel: false,
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })

const emit = defineEmits<BaseRangeEmits>()

const trackRef = ref<HTMLElement | null>(null)
const activeThumb = ref<'first' | 'second' | null>(null)

/** Режим диапазона */
const isRange = computed((): boolean => !!props.rangeValue)

/** Первое значение */
const firstValue = computed((): number => {
	if (isRange.value && props.rangeValue) return props.rangeValue[0]
	return props.modelValue
})

/** Процент значения на шкале */
function percent(value: number): number {
	return toPercent({ value, min: props.min, max: props.max })
}

/** Стиль заливки трека */
const fillStyle = computed((): Record<string, string> => {
	if (isRange.value && props.rangeValue) {
		const left = percent(props.rangeValue[0])
		const right = percent(props.rangeValue[1])
		if (props.isVertical) {
			return { bottom: `${left}%`, height: `${right - left}%` }
		}
		return { left: `${left}%`, width: `${right - left}%` }
	}
	const p = percent(firstValue.value)
	if (props.isVertical) {
		return { bottom: '0', height: `${p}%` }
	}
	return { left: '0', width: `${p}%` }
})

/** Стиль ползунка */
function thumbStyle(value: number): Record<string, string> {
	const p = percent(value)
	if (props.isVertical) {
		return { bottom: `${p}%` }
	}
	return { left: `${p}%` }
}

/** Стиль метки */
function markStyle(value: number): Record<string, string> {
	const p = percent(value)
	if (props.isVertical) {
		return { bottom: `${p}%` }
	}
	return { left: `${p}%` }
}

/** Привязка значения к шагу */
function snapToStepValue(value: number): number {
	return snapToStep({ value, min: props.min, max: props.max, step: props.step })
}

/** Получить значение из позиции */
function getValueFromEvent(e: MouseEvent | TouchEvent): number {
	if (!trackRef.value) return props.min
	const rect = trackRef.value.getBoundingClientRect()
	const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
	const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

	let ratio: number
	if (props.isVertical) {
		ratio = 1 - (clientY - rect.top) / rect.height
	} else {
		ratio = (clientX - rect.left) / rect.width
	}

	const raw = props.min + ratio * (props.max - props.min)
	return snapToStepValue(raw)
}

/** Начало перетаскивания */
function handleThumbDown(e: MouseEvent | TouchEvent, thumb: 'first' | 'second'): void {
	if (props.isDisabled) return
	activeThumb.value = thumb

	const moveEvent = e instanceof MouseEvent ? 'mousemove' : 'touchmove'
	const upEvent = e instanceof MouseEvent ? 'mouseup' : 'touchend'

	function handleMove(ev: MouseEvent | TouchEvent): void {
		if (!activeThumb.value) return
		const val = getValueFromEvent(ev)

		if (activeThumb.value === 'first') {
			if (isRange.value && props.rangeValue) {
				const clamped = Math.min(val, props.rangeValue[1])
				emit('update:rangeValue', [clamped, props.rangeValue[1]])
			} else {
				emit('update:modelValue', val)
			}
		} else if (activeThumb.value === 'second' && props.rangeValue) {
			const clamped = Math.max(val, props.rangeValue[0])
			emit('update:rangeValue', [props.rangeValue[0], clamped])
		}
	}

	function handleUp(): void {
		activeThumb.value = null
		document.removeEventListener(moveEvent, handleMove)
		document.removeEventListener(upEvent, handleUp)

		if (isRange.value && props.rangeValue) {
			emit('change', [...props.rangeValue] as [number, number])
		} else {
			emit('change', props.modelValue)
		}
	}

	document.addEventListener(moveEvent, handleMove)
	document.addEventListener(upEvent, handleUp)
}
</script>
