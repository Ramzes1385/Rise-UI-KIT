<template>
	<div
		ref="rootRef"
		:class="[
			ui('root'),
			variantClass,
			{
				'base-range--disabled': isControlDisabled,
				'base-range--vertical': isVertical,
				'base-range--dragging': isDragging,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div v-if="hasLabel" :class="[ui('label'), classes.label]">
			<BaseText tag="span" :class="ui('label-min')" :custom-class="classes.labelMin">{{ bounds.min }}</BaseText>
			<BaseText tag="span" :class="ui('label-value')" :weight="TEXT_WEIGHT.MEDIUM" :custom-class="classes.labelValue">{{
				labelText
			}}</BaseText>
			<BaseText tag="span" :class="ui('label-max')" :custom-class="classes.labelMax">{{ bounds.max }}</BaseText>
		</div>

		<div :class="[ui('body'), classes.body]">
			<div :class="[ui('track-wrapper'), classes.trackWrapper]" ref="trackRef" @mousedown.prevent="handleTrackDown">
				<div :class="[ui('track'), classes.track]">
					<div v-for="(segment, index) in fillSegments" :key="index" :class="[ui('fill'), classes.fill]" :style="segment"></div>
				</div>

				<div
					v-for="(value, index) in pointValues"
					:key="index"
					:class="[ui('thumb-container'), classes.thumbContainer]"
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
							:thumb-class="[ui('thumb'), classes.thumb]"
							:dot-class="[ui('thumb-dot'), classes.thumbDot]"
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
						:thumb-class="[ui('thumb'), classes.thumb]"
						:dot-class="[ui('thumb-dot'), classes.thumbDot]"
						@down="handleThumbDown"
						@keydown="handleThumbKeydown">
						<template #default="{ value: thumbValue, index: thumbIndex }">
							<slot name="thumb" :value="thumbValue" :index="thumbIndex" />
						</template>
					</BaseRangeThumb>
				</div>
			</div>

			<BaseRangeMarks :marks="marks" :mark-style="markStyle" :classes="classes" :ui="ui" />
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseRange.style.scss'
import BaseRangeMarks from './BaseRangeMarks.vue'
import { BaseRangeThumb } from './BaseRangeThumb'
import { useBaseRange } from '../model/useBaseRange'
import { BaseTooltip } from '@components/BaseTooltip'
import { kitDefaults } from '@composables/base/useDefaults'
import { BaseText, TEXT_WEIGHT } from '@components/BaseText'
import { DEFAULT_VARIANT } from '@composables/base/useBaseComponent'
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
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	isControlDisabled,
	rootRef,
	trackRef,
	hasThumbSlot,
	bounds,
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
	isDragging,
	exposed,
} = useBaseRange(props, emit)

defineExpose(exposed)
</script>
