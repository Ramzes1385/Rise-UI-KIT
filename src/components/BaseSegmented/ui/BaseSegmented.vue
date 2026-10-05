<template>
	<div
		:class="[
			ui('root'),
			variantClass,
			{
				'base-segmented--block': isBlock,
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
			<label
				v-for="option in options"
				:key="option.value"
				data-indicator-item
				:class="[
					ui('segment'),
					{
						'base-segmented__segment--checked': option.value === modelValue,
						'base-segmented__segment--disabled': isControlDisabled || option.isDisabled,
					},
					classes.segment,
				]">
				<input
					type="radio"
					:class="ui('input')"
					:name="radioName"
					:value="option.value"
					:checked="option.value === modelValue"
					:disabled="isControlDisabled || option.isDisabled"
					@change="select(option.value)" />
				<BaseIcon v-if="option.icon" :name="option.icon" :class="ui('icon')" :size-scale="calcIconScale('sm', sizeScale)" />
				<span :class="ui('text')">{{ option.label }}</span>
			</label>
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
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/media/iconUtils'
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
