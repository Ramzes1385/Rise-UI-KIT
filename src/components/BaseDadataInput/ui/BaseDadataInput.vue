<template>
	<BaseAutocomplete
		class="base-dadata-input"
		:class="classes.root"
		:model-value="value || null"
		:options="options"
		:variant="variant"
		:label="label"
		:aria-label="label ? undefined : kindLabel"
		:placeholder="placeholder"
		:error="error"
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
		@search="search" />
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
		kind: 'address',
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

const { classes, value, isLoading, options, kindLabel, inputAttrs, search, handleChange } = useBaseDadataInput(props, emit)
</script>
