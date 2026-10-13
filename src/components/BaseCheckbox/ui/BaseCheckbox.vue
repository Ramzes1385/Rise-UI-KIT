<template>
	<div
		ref="rootRef"
		:class="[
			ui('root'),
			variantClass,
			{
				'base-checkbox--disabled': isDisabled,
				'base-checkbox--readonly': isReadonly,
				'base-checkbox--error': control.hasError.value,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<label :class="[ui('label-wrapper'), classes.labelWrapper]">
			<span :class="[ui('wrapper'), classes.wrapper]">
				<input
					v-bind="nativeAttrs"
					type="checkbox"
					:class="[ui('input'), classes.input]"
					:checked="modelValue"
					:indeterminate="isIndeterminate"
					:disabled="isDisabled"
					@click="handleClick"
					@change="handleChange" />
				<span :class="[ui('box'), classes.box]" aria-hidden="true">
					<Transition name="base-checkbox-mark">
						<BaseIcon
							v-if="modelValue || isIndeterminate"
							:name="isIndeterminate ? 'minus' : 'check'"
							:size-scale="calcIconScale('sm', sizeScale)"
							:class="ui('icon')"
							:custom-class="classes.icon" />
					</Transition>
				</span>
			</span>
			<FormFieldLabel
				v-if="label"
				tag="span"
				:label="label"
				:class-name="ui('label')"
				:custom-class="classes.label"
				:size-scale="sizeScale" />
		</label>
		<div :id="errorId" :class="ui('error')">
			<slot name="error">
				<FormFieldError
					:error="formField.error"
					:class-name="ui('error-text')"
					:custom-class="classes.errorText"
					:size-scale="sizeScale" />
			</slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseCheckbox.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/media/iconUtils'
import { useBaseCheckbox } from '../model/useBaseCheckbox'
import { kitDefaults } from '@composables/base/useDefaults'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseCheckboxEmits, BaseCheckboxProps, BaseCheckboxSlots } from '../types/BaseCheckbox.types'

const props = withDefaults(
	defineProps<BaseCheckboxProps>(),
	kitDefaults('BaseCheckbox', {
		variant: DEFAULT_VARIANT,
		modelValue: false,
		isDisabled: false,
		isIndeterminate: false,
		isReadonly: false,
		error: '',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseCheckboxEmits>()
defineSlots<BaseCheckboxSlots>()

const {
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	errorId,
	formField,
	control,
	nativeAttrs,
	rootRef,
	handleClick,
	handleChange,
	exposed,
} = useBaseCheckbox(props, emit)

defineExpose(exposed)
</script>
