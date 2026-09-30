<template>
	<BaseInput
		class="base-requisite-input"
		:class="classes.root"
		:model-value="value"
		:mask="mask"
		:variant="variant"
		:label="fieldLabel"
		:placeholder="placeholder"
		:error="shownError"
		:is-disabled="isControlDisabled"
		:is-required="isRequired"
		:input-attrs="{ inputmode: kind === 'kpp' ? 'text' : 'numeric', autocomplete: 'off', spellcheck: 'false' }"
		:size-scale="sizeScale"
		:color="color"
		:custom-class="{ field: classes.field }"
		@update:model-value="handleInput"
		@focus="handleFocus"
		@blur="handleBlur" />
</template>

<script setup lang="ts">
import '../styles/BaseRequisiteInput.style.scss'
import { BaseInput } from '@components/BaseInput'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseRequisiteInput } from '../model/useBaseRequisiteInput'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseRequisiteInputEmits, BaseRequisiteInputProps } from '../types/BaseRequisiteInput.types'

const props = withDefaults(
	defineProps<BaseRequisiteInputProps>(),
	kitDefaults('BaseRequisiteInput', {
		variant: DEFAULT_VARIANT,
		modelValue: '',
		bik: '',
		isRequired: false,
		isDisabled: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseRequisiteInputEmits>()

const { classes, isControlDisabled, value, mask, fieldLabel, shownError, handleInput, handleFocus, handleBlur } = useBaseRequisiteInput(
	props,
	emit,
)
</script>
