<template>
	<div
		class="base-range"
		:class="[
			variantClass,
			{
				'base-range--disabled': isDisabled,
				'base-range--vertical': isVertical,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<!-- Метка значения -->
		<div v-if="hasLabel" class="base-range__label" :class="classes.label">
			<BaseText tag="span" class="base-range__label-min" :custom-class="classes.labelMin">{{ min }}</BaseText>
			<BaseText tag="span" class="base-range__label-value" :weight="700" :custom-class="classes.labelValue">{{
				labelText
			}}</BaseText>
			<BaseText tag="span" class="base-range__label-max" :custom-class="classes.labelMax">{{ max }}</BaseText>
		</div>

		<div class="base-range__body" :class="classes.body">
			<div
				class="base-range__track-wrapper"
				:class="classes.trackWrapper"
				ref="trackRef"
				@mousedown.prevent="handleTrackDown">
				<!-- Трек -->
				<div class="base-range__track" :class="classes.track">
					<div
						v-for="(segment, index) in fillSegments"
						:key="index"
						class="base-range__fill"
						:class="classes.fill"
						:style="segment"></div>
				</div>

				<!-- Ползунки -->
				<div
					v-for="(value, index) in pointValues"
					:key="index"
					class="base-range__thumb-container"
					:class="classes.thumbContainer"
					:style="thumbStyle(value)">
					<BaseTooltip v-if="hasTooltip" :text="String(value)" :position="tooltipPosition">
						<BaseRangeThumb
							:value="value"
							:index="index"
							:bound-min="thumbMin(index)"
							:bound-max="thumbMax(index)"
							:has-custom="hasThumbSlot"
							:thumb-class="classes.thumb"
							:dot-class="classes.thumbDot"
							@down="handleThumbDown"
							@keydown="handleThumbKeydown">
							<template #default="{ value: thumbValue, index: thumbIndex }">
								<slot name="thumb" :value="thumbValue" :index="thumbIndex" />
							</template>
						</BaseRangeThumb>
					</BaseTooltip>
					<BaseRangeThumb
						v-else
						:value="value"
						:index="index"
						:bound-min="thumbMin(index)"
						:bound-max="thumbMax(index)"
						:has-custom="hasThumbSlot"
						:thumb-class="classes.thumb"
						:dot-class="classes.thumbDot"
						@down="handleThumbDown"
						@keydown="handleThumbKeydown">
						<template #default="{ value: thumbValue, index: thumbIndex }">
							<slot name="thumb" :value="thumbValue" :index="thumbIndex" />
						</template>
					</BaseRangeThumb>
				</div>
			</div>

			<!-- Деления шкалы -->
			<div v-if="marks.length" class="base-range__marks" :class="classes.marks">
				<span
					v-for="mark in marks"
					:key="mark.value"
					class="base-range__mark"
					:class="[`base-range__mark--${mark.tickSize ?? 'major'}`, classes.mark]"
					:style="markStyle(mark.value)">
					<span class="base-range__mark-tick" :class="classes.markTick"></span>
					<BaseText v-if="mark.label" tag="span" class="base-range__mark-text" :custom-class="classes.markText">{{
						mark.label
					}}</BaseText>
				</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseText } from '@components/BaseText'
import { BaseTooltip } from '@components/BaseTooltip'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import { snapToStep, toPercent } from '@utils/rangeUtils'
import { computed, onBeforeUnmount, ref, useSlots } from 'vue'
import { BaseRangeThumb } from './BaseRangeThumb'
import '../styles/BaseRange.style.scss'
import type { BaseRangeEmits, BaseRangeProps } from '../model/BaseRange.types'

const props = defineProps<BaseRangeProps>()

const modelValue = computed(() => props.modelValue ?? 0)
const min = computed(() => props.min ?? 0)
const max = computed(() => props.max ?? 100)
const step = computed(() => props.step ?? 1)
const variant = computed(() => props.variant ?? 'default')
const isDisabled = computed(() => props.isDisabled ?? false)
const hasTooltip = computed(() => props.hasTooltip ?? false)
const marks = computed(() => props.marks ?? [])
const isVertical = computed(() => props.isVertical ?? false)
const hasLabel = computed(() => props.hasLabel ?? false)
const sizeScale = computed(() => props.sizeScale ?? 100)

const { sizeScaleStyle } = useSizeScale({ getScale: () => sizeScale.value })
const { variantClass, variantStyle } = useVariant({
	block: 'base-range',
	getVariant: () => variant.value,
})
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: [
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
	],
})

const emit = defineEmits<BaseRangeEmits>()
const slots = useSlots()

const trackRef = ref<HTMLElement | null>(null)
const activeIndex = ref<number | null>(null)

/** Режим управления: единичное значение, диапазон из двух или произвольный набор точек */
type RangeMode = 'single' | 'range' | 'points'

/** Активный режим работы компонента */
const mode = computed((): RangeMode => {
	if (props.points) return 'points'
	if (props.rangeValue) return 'range'
	return 'single'
})

/** Нормализованный массив значений всех ползунков */
const pointValues = computed((): number[] => {
	if (props.points) return props.points
	if (props.rangeValue) return [props.rangeValue[0], props.rangeValue[1]]
	return [modelValue.value]
})

/** Использован ли кастомный слот ползунка */
const hasThumbSlot = computed((): boolean => Boolean(slots.thumb))

/** Текст метки значения */
const labelText = computed((): string => {
	if (mode.value === 'single') return String(modelValue.value)
	return pointValues.value.join(' — ')
})

/** Позиция тултипа */
const tooltipPosition = computed((): 'top' | 'right' => {
	return isVertical.value ? 'right' : 'top'
})

/** Процент значения на шкале */
function percent(value: number): number {
	return toPercent({ value, min: min.value, max: max.value })
}

/** Стиль одного сегмента заливки между двумя процентами */
function fillSegmentStyle(fromPercent: number, toPercentValue: number): Record<string, string> {
	const start = Math.min(fromPercent, toPercentValue)
	const size = Math.abs(toPercentValue - fromPercent)
	if (isVertical.value) {
		return { bottom: `${start}%`, height: `${size}%` }
	}
	return { left: `${start}%`, width: `${size}%` }
}

/** Сегменты заливки трека */
const fillSegments = computed((): Record<string, string>[] => {
	if (mode.value === 'single') {
		return [fillSegmentStyle(0, percent(pointValues.value[0]))]
	}
	const segments: Record<string, string>[] = []
	for (let i = 0; i < pointValues.value.length - 1; i += 1) {
		segments.push(fillSegmentStyle(percent(pointValues.value[i]), percent(pointValues.value[i + 1])))
	}
	return segments
})

/** Стиль ползунка */
function thumbStyle(value: number): Record<string, string> {
	const p = percent(value)
	if (isVertical.value) {
		return { bottom: `${p}%` }
	}
	return { left: `${p}%` }
}

/** Стиль метки */
function markStyle(value: number): Record<string, string> {
	const p = percent(value)
	if (isVertical.value) {
		return { bottom: `${p}%` }
	}
	return { left: `${p}%` }
}

/** Нижняя граница ползунка (значение левого соседа или min) */
function thumbMin(index: number): number {
	return index > 0 ? pointValues.value[index - 1] : min.value
}

/** Верхняя граница ползунка (значение правого соседа или max) */
function thumbMax(index: number): number {
	const next = pointValues.value[index + 1]
	return next === undefined ? max.value : next
}

/** Привязка значения к шагу с ограничением границами */
function snapToStepValue(value: number): number {
	const snapped = snapToStep({ value, min: min.value, max: max.value, step: step.value })
	return Math.max(min.value, Math.min(max.value, snapped))
}

/** Получить значение из позиции события */
function getValueFromEvent(e: MouseEvent | TouchEvent): number {
	/* istanbul ignore next -- Событие приходит только с отрисованного трека. */
	if (!trackRef.value) return min.value
	const rect = trackRef.value.getBoundingClientRect()
	const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
	const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

	let ratio: number
	if (isVertical.value) {
		ratio = 1 - (clientY - rect.top) / rect.height
	} else {
		ratio = (clientX - rect.left) / rect.width
	}

	ratio = Math.max(0, Math.min(1, ratio))
	const raw = min.value + ratio * (max.value - min.value)
	return snapToStepValue(raw)
}

/** Ограничить значение соседями активного ползунка */
function clampToNeighbors(index: number, value: number): number {
	const lower = thumbMin(index)
	const upper = thumbMax(index)
	return Math.max(lower, Math.min(upper, value))
}

/** Сформировать новый массив точек с обновлённым значением по индексу */
function withUpdatedPoint(index: number, value: number): number[] {
	const next = pointValues.value.slice()
	next[index] = value
	return next
}

/** Отправить событие обновления значения для текущего режима */
function emitUpdate(index: number, value: number): void {
	if (mode.value === 'single') {
		emit('update:modelValue', value)
		return
	}
	const next = withUpdatedPoint(index, value)
	if (mode.value === 'range') {
		emit('update:rangeValue', [next[0], next[1]])
		return
	}
	emit('update:points', next)
}

/** Обновить значение активного ползунка по индексу */
function setPointValue(index: number, rawValue: number): void {
	const clamped = clampToNeighbors(index, Math.max(min.value, Math.min(max.value, rawValue)))
	emitUpdate(index, clamped)
}

/** Отправить событие change с текущим значением */
function emitChange(): void {
	if (mode.value === 'single') {
		emit('change', modelValue.value)
		return
	}
	if (mode.value === 'range') {
		emit('change', [pointValues.value[0], pointValues.value[1]])
		return
	}
	emit('change', pointValues.value.slice())
}

/** Обработчик перемещения мыши */
function handleMouseMove(ev: MouseEvent): void {
	/* istanbul ignore next -- Защитный выход без активного drag. */
	if (activeIndex.value === null) return
	setPointValue(activeIndex.value, getValueFromEvent(ev))
}

/** Обработчик перемещения тача */
function handleTouchMove(ev: TouchEvent): void {
	/* istanbul ignore next -- Защитный выход без активного touch drag. */
	if (activeIndex.value === null) return
	setPointValue(activeIndex.value, getValueFromEvent(ev))
}

/** Завершение перетаскивания мышью */
function handleMouseUp(): void {
	activeIndex.value = null
	document.removeEventListener('mousemove', handleMouseMove)
	document.removeEventListener('mouseup', handleMouseUp)
	emitChange()
}

/** Завершение перетаскивания тачем */
function handleTouchEnd(): void {
	activeIndex.value = null
	document.removeEventListener('touchmove', handleTouchMove)
	document.removeEventListener('touchend', handleTouchEnd)
	emitChange()
}

/** Начало перетаскивания ползунка */
function handleThumbDown(payload: { event: MouseEvent | TouchEvent; index: number }): void {
	if (isDisabled.value) return
	activeIndex.value = payload.index

	if (payload.event instanceof MouseEvent) {
		document.addEventListener('mousemove', handleMouseMove)
		document.addEventListener('mouseup', handleMouseUp)
	} else {
		document.addEventListener('touchmove', handleTouchMove)
		document.addEventListener('touchend', handleTouchEnd)
	}
}

/** Найти индекс ближайшего к значению ползунка */
function nearestIndex(value: number): number {
	let best = 0
	let bestDistance = Math.abs(value - pointValues.value[0])
	for (let i = 1; i < pointValues.value.length; i += 1) {
		const distance = Math.abs(value - pointValues.value[i])
		if (distance < bestDistance) {
			best = i
			bestDistance = distance
		}
	}
	return best
}

/** Клик по треку */
function handleTrackDown(e: MouseEvent): void {
	if (isDisabled.value) return
	const value = getValueFromEvent(e)
	const index = nearestIndex(value)
	activeIndex.value = index
	setPointValue(index, value)
	document.addEventListener('mousemove', handleMouseMove)
	document.addEventListener('mouseup', handleMouseUp)
}

/** Клавиатурное управление ползунком */
function handleThumbKeydown(payload: { event: KeyboardEvent; index: number }): void {
	if (isDisabled.value) return

	const { event, index } = payload
	const isIncrease = event.key === 'ArrowRight' || event.key === 'ArrowUp'
	const isDecrease = event.key === 'ArrowLeft' || event.key === 'ArrowDown'
	if (!isIncrease && !isDecrease) return
	event.preventDefault()

	const delta = isIncrease ? step.value : -step.value
	setPointValue(index, snapToStepValue(pointValues.value[index] + delta))
}

/** Снятие глобальных слушателей при размонтировании во время активного перетаскивания. */
onBeforeUnmount(() => {
	document.removeEventListener('mousemove', handleMouseMove)
	document.removeEventListener('mouseup', handleMouseUp)
	document.removeEventListener('touchmove', handleTouchMove)
	document.removeEventListener('touchend', handleTouchEnd)
})
</script>
