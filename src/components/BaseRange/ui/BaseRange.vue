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
			<BaseText tag="span" class="base-range__label-value" :weight="UI_FONT_WEIGHT_BOLD" :custom-class="classes.labelValue">{{
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

			<BaseRangeMarks :marks="marks" :mark-style="markStyle" :classes="classes" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseText } from '@components/BaseText'
import { BaseTooltip } from '@components/BaseTooltip'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { UI_FONT_WEIGHT_BOLD } from '@constants'
import { snapToStep, toPercent } from '@utils/rangeUtils'
import { computed, ref, useSlots } from 'vue'
import { useRangeDrag } from '../model/useRangeDrag'
import BaseRangeMarks from './BaseRangeMarks.vue'
import { BaseRangeThumb } from './BaseRangeThumb'
import '../styles/BaseRange.style.scss'
import type { BaseRangeEmits, BaseRangeProps } from '../model/BaseRange.types'

const props = withDefaults(defineProps<BaseRangeProps>(), {
	modelValue: 0,
	min: 0,
	max: 100,
	step: 1,
	isDisabled: false,
	hasTooltip: false,
	marks: () => [],
	isVertical: false,
	hasLabel: false,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-range', props, [
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
	])

const emit = defineEmits<BaseRangeEmits>()
const slots = useSlots()

const trackRef = ref<HTMLElement | null>(null)

type RangeMode = 'single' | 'range' | 'points'

const mode = computed((): RangeMode => {
	if (props.points) return 'points'
	if (props.rangeValue) return 'range'
	return 'single'
})

const pointValues = computed((): number[] => {
	if (props.points) return props.points
	if (props.rangeValue) return [props.rangeValue[0], props.rangeValue[1]]
	return [props.modelValue]
})

const hasThumbSlot = computed((): boolean => Boolean(slots.thumb))

const labelText = computed((): string => {
	if (mode.value === 'single') return String(props.modelValue)
	return pointValues.value.join(' — ')
})

const tooltipPosition = computed((): 'top' | 'right' => {
	return props.isVertical ? 'right' : 'top'
})

function percent(value: number): number {
	return toPercent({ value, min: props.min, max: props.max })
}

function fillSegmentStyle(fromPercent: number, toPercentValue: number): Record<string, string> {
	const start = Math.min(fromPercent, toPercentValue)
	const size = Math.abs(toPercentValue - fromPercent)
	if (props.isVertical) {
		return { bottom: `${start}%`, height: `${size}%` }
	}
	return { left: `${start}%`, width: `${size}%` }
}

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

function thumbStyle(value: number): Record<string, string> {
	const percentValue = percent(value)
	if (props.isVertical) {
		return { bottom: `${percentValue}%` }
	}
	return { left: `${percentValue}%` }
}

function markStyle(value: number): Record<string, string> {
	const percentValue = percent(value)
	if (props.isVertical) {
		return { bottom: `${percentValue}%` }
	}
	return { left: `${percentValue}%` }
}

function thumbMin(index: number): number {
	return index > 0 ? pointValues.value[index - 1] : props.min
}

function thumbMax(index: number): number {
	const next = pointValues.value[index + 1]
	return next === undefined ? props.max : next
}

function snapToStepValue(value: number): number {
	const snapped = snapToStep({ value, min: props.min, max: props.max, step: props.step })
	return Math.max(props.min, Math.min(props.max, snapped))
}

function clampToNeighbors(index: number, value: number): number {
	const lower = thumbMin(index)
	const upper = thumbMax(index)
	return Math.max(lower, Math.min(upper, value))
}

function withUpdatedPoint(index: number, value: number): number[] {
	const next = pointValues.value.slice()
	next[index] = value
	return next
}

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

function setPointValue(index: number, rawValue: number): void {
	const clamped = clampToNeighbors(index, Math.max(props.min, Math.min(props.max, rawValue)))
	emitUpdate(index, clamped)
}

function emitChange(): void {
	if (mode.value === 'single') {
		emit('change', props.modelValue)
		return
	}
	if (mode.value === 'range') {
		emit('change', [pointValues.value[0], pointValues.value[1]])
		return
	}
	emit('change', pointValues.value.slice())
}

const { handleThumbDown, handleTrackDown, handleThumbKeydown } = useRangeDrag({
	trackRef,
	pointValues,
	isDisabled: () => props.isDisabled,
	min: () => props.min,
	max: () => props.max,
	step: () => props.step,
	isVertical: () => props.isVertical,
	thumbMin,
	thumbMax,
	snapToStepValue,
	setPointValue,
	emitChange,
})
</script>
