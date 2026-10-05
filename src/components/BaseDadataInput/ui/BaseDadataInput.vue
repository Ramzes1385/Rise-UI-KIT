<template>
	<BaseAutocomplete
		class="base-dadata-input"
		:class="classes.root"
		:model-value="fieldValue"
		:options="options"
		:variant="variant"
		:label="label"
		:aria-label="label ? undefined : kindLabel"
		:placeholder="placeholder"
		:error="shownError"
		:is-disabled="isDisabled"
		:is-required="isRequired"
		:is-loading="isLoading"
		:input-attrs="inputAttrs"
		:size-scale="sizeScale"
		:color="color"
		:custom-class="{ field: classes.field, panel: classes.panel, option: classes.option }"
		is-remote
		is-custom-allowed
		@update:model-value="handleChange"
		@search="handleSearch"
		@blur="handleBlur">
		<template #empty>{{ emptyText }}</template>
	</BaseAutocomplete>
</template>

<script setup lang="ts">
import { kitDefaults } from '@composables/base/useDefaults'
import { BaseAutocomplete } from '@components/BaseAutocomplete'
import { useBaseDadataInput } from '../model/useBaseDadataInput'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseDadataInputEmits, BaseDadataInputProps } from '../types/BaseDadataInput.types'

const props = withDefaults(
	defineProps<BaseDadataInputProps>(),
	kitDefaults('BaseDadataInput', {
		variant: DEFAULT_VARIANT,
		modelValue: '',
		suggestion: null,
		kind: 'address',
		isStrict: false,
		precision: 'any',
		token: undefined,
		baseUrl: undefined,
		count: 7,
		minChars: 3,
		debounce: 300,
		isRequired: false,
		isDisabled: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseDadataInputEmits>()

const { classes, fieldValue, isLoading, shownError, emptyText, options, kindLabel, inputAttrs, handleSearch, handleChange, handleBlur } =
	useBaseDadataInput(props, emit)
</script>
