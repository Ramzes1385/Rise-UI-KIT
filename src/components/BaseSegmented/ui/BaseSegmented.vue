<template>
	<div
		:class="[
			ui('root'),
			variantClass,
			{
				'base-segmented--block': isBlock,
				'base-segmented--icon-only': isIconOnly,
				'base-segmented--disabled': isControlDisabled,
				'base-segmented--error': control.hasError.value,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="radiogroup"
		:aria-labelledby="labelledBy"
		:aria-label="labelledBy ? undefined : ariaLabel"
		:aria-describedby="control.aria.value['aria-describedby']">
		<FormFieldLabel
			v-if="label"
			:id="labelId"
			tag="span"
			:label="label"
			:class-name="ui('label')"
			:custom-class="classes.label"
			:size-scale="sizeScale" />
		<div ref="trackRef" :class="[ui('track'), classes.track]" :style="indicatorStyle">
			<span
				v-if="isIndicatorVisible"
				:class="[
					ui('indicator'),
					{
						'base-segmented__indicator--instant': isIndicatorInstant,
						'base-segmented__indicator--disabled': isIndicatorDisabled,
					},
				]"
				aria-hidden="true"></span>
			<template v-for="option in options" :key="option.value">
				<BaseTooltip v-if="isIconOnly && option.icon" is-wrapperless :text="option.label" :size-scale="sizeScale">
					<SegmentedItem
						:option="option"
						:is-checked="option.value === modelValue"
						:is-disabled="isControlDisabled || Boolean(option.isDisabled)"
						is-icon-only
						:name="radioName"
						:ui="ui"
						:custom-class="classes.segment"
						:size-scale="sizeScale"
						@select="select" />
				</BaseTooltip>
				<SegmentedItem
					v-else
					:option="option"
					:is-checked="option.value === modelValue"
					:is-disabled="isControlDisabled || Boolean(option.isDisabled)"
					:is-icon-only="false"
					:name="radioName"
					:ui="ui"
					:custom-class="classes.segment"
					:size-scale="sizeScale"
					@select="select" />
			</template>
		</div>
		<FormFieldError
			:id="errorId"
			:error="error ?? ''"
			:class-name="ui('error')"
			:custom-class="classes.error"
			:size-scale="sizeScale" />
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseSegmented.style.scss'
import SegmentedItem from './SegmentedItem.vue'
import { BaseTooltip } from '@components/BaseTooltip'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseSegmented } from '../model/useBaseSegmented'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseSegmentedEmits, BaseSegmentedProps } from '../types/BaseSegmented.types'

const props = withDefaults(
	defineProps<BaseSegmentedProps>(),
	kitDefaults('BaseSegmented', {
		variant: DEFAULT_VARIANT,
		modelValue: null,
		isDisabled: false,
		isBlock: false,
		isIconOnly: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseSegmentedEmits>()

const {
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	labelId,
	errorId,
	radioName,
	isControlDisabled,
	control,
	labelledBy,
	trackRef,
	indicatorStyle,
	isIndicatorVisible,
	isIndicatorInstant,
	isIndicatorDisabled,
	select,
} = useBaseSegmented(props, emit)
</script>
