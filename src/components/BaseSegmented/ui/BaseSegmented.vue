<template>
	<div
		class="base-segmented"
		:class="[
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
			class-name="base-segmented__label"
			:custom-class="classes.label"
			:size-scale="sizeScale" />
		<div class="base-segmented__track" :class="classes.track">
			<label
				v-for="option in options"
				:key="option.value"
				class="base-segmented__segment"
				:class="[
					{
						'base-segmented__segment--checked': option.value === modelValue,
						'base-segmented__segment--disabled': isControlDisabled || option.isDisabled,
					},
					classes.segment,
				]">
				<input
					type="radio"
					class="base-segmented__input"
					:name="radioName"
					:value="option.value"
					:checked="option.value === modelValue"
					:disabled="isControlDisabled || option.isDisabled"
					@change="select(option.value)" />
				<BaseIcon
					v-if="option.icon"
					:name="option.icon"
					class="base-segmented__icon"
					:size-scale="calcIconScale('sm', sizeScale)" />
				<span class="base-segmented__text">{{ option.label }}</span>
			</label>
		</div>
		<FormFieldError
			:id="errorId"
			:error="error ?? ''"
			class-name="base-segmented__error"
			:custom-class="classes.error"
			:size-scale="sizeScale" />
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseSegmented.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/iconUtils'
import { kitDefaults } from '@composables/useDefaults'
import { useBaseSegmented } from '../model/useBaseSegmented'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
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
	select,
} = useBaseSegmented(props, emit)
</script>
