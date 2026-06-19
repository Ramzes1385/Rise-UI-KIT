<template>
	<div
		ref="rootRef"
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
			<BaseText tag="span" class="base-range__label-value" :weight="UI_FONT_WEIGHT.BOLD" :custom-class="classes.labelValue">{{
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
import { computed, ref, useSlots } from 'vue'
import { BaseText } from '@components/BaseText'
import { BaseTooltip } from '@components/BaseTooltip'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useFormField, type FormFieldExpose } from '@composables/useFormField'
import { useRangeDrag } from '@composables/useRangeDrag'
import { useRangeValues } from '@composables/useRangeValues'
import { UI_FONT_WEIGHT } from '@constants'
import BaseRangeMarks from './BaseRangeMarks.vue'
import { BaseRangeThumb } from './BaseRangeThumb'
import '../styles/BaseRange.style.scss'
import type { BaseRangeEmits, BaseRangeProps, BaseRangeSlots } from '../model/BaseRange.types'

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
defineSlots<BaseRangeSlots>()
const slots = useSlots()

const rootRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)
const hasThumbSlot = computed((): boolean => Boolean(slots.thumb))

const formField = useFormField({
	value: () => props.modelValue,
})

const {
	pointValues,
	labelText,
	tooltipPosition,
	fillSegments,
	thumbStyle,
	markStyle,
	thumbMin,
	thumbMax,
	snapToStepValue,
	setPointValue,
	emitChange,
} = useRangeValues({ props, emit })

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

defineExpose<FormFieldExpose>({
	rootRef,
	focus: () => rootRef.value?.querySelector<HTMLElement>('.base-range__thumb')?.focus(),
	blur: () => rootRef.value?.querySelector<HTMLElement>('.base-range__thumb')?.blur(),
	validate: formField.validate,
	reset: formField.reset,
})
</script>
