<template>
	<div
		ref="rootRef"
		class="base-range"
		:class="[
			variantClass,
			{
				'base-range--disabled': isControlDisabled,
				'base-range--vertical': isVertical,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div v-if="hasLabel" class="base-range__label" :class="classes.label">
			<BaseText tag="span" class="base-range__label-min" :custom-class="classes.labelMin">{{ min }}</BaseText>
			<BaseText tag="span" class="base-range__label-value" :weight="TEXT_WEIGHT.MEDIUM" :custom-class="classes.labelValue">{{
				labelText
			}}</BaseText>
			<BaseText tag="span" class="base-range__label-max" :custom-class="classes.labelMax">{{ max }}</BaseText>
		</div>

		<div class="base-range__body" :class="classes.body">
			<div class="base-range__track-wrapper" :class="classes.trackWrapper" ref="trackRef" @mousedown.prevent="handleTrackDown">
				<div class="base-range__track" :class="classes.track">
					<div
						v-for="(segment, index) in fillSegments"
						:key="index"
						class="base-range__fill"
						:class="classes.fill"
						:style="segment"></div>
				</div>

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
							:label="thumbLabel(index)"
							:is-disabled="isControlDisabled"
							:is-vertical="isVertical"
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
						:label="thumbLabel(index)"
						:is-disabled="isControlDisabled"
						:is-vertical="isVertical"
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
import { BaseTooltip } from '@components/BaseTooltip'
import { kitDefaults } from '@composables/useDefaults'
import { BaseText, TEXT_WEIGHT } from '@components/BaseText'
import { DEFAULT_VARIANT } from '@composables/useBaseComponent'
import BaseRangeMarks from './BaseRangeMarks.vue'
import { BaseRangeThumb } from './BaseRangeThumb'
import { useBaseRange } from '../model/useBaseRange'
import '../styles/BaseRange.style.scss'
import type { BaseRangeEmits, BaseRangeProps, BaseRangeSlots } from '../types/BaseRange.types'

const props = withDefaults(
	defineProps<BaseRangeProps>(),
	kitDefaults('BaseRange', {
		variant: DEFAULT_VARIANT,
		modelValue: 0,
		min: 0,
		max: 100,
		step: 1,
		isDisabled: false,
		hasTooltip: false,
		marks: () => [],
		isVertical: false,
		hasLabel: false,
	}),
)
const emit = defineEmits<BaseRangeEmits>()
defineSlots<BaseRangeSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	isControlDisabled,
	rootRef,
	trackRef,
	hasThumbSlot,
	pointValues,
	labelText,
	tooltipPosition,
	fillSegments,
	thumbStyle,
	markStyle,
	thumbMin,
	thumbMax,
	thumbLabel,
	handleThumbDown,
	handleTrackDown,
	handleThumbKeydown,
	exposed,
} = useBaseRange(props, emit)

defineExpose(exposed)
</script>
