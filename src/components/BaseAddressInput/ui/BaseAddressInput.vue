<template>
	<BaseAutocomplete
		class="base-address-input"
		:class="classes.root"
		:model-value="value || null"
		:options="options"
		:variant="variant"
		:label="label"
		:placeholder="placeholder"
		:error="error"
		:is-disabled="isDisabled"
		:is-required="isRequired"
		:is-loading="isLoading"
		:input-attrs="{ autocomplete: 'off' }"
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
import { useBaseAddressInput } from '../model/useBaseAddressInput'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseAddressInputEmits, BaseAddressInputProps } from '../types/BaseAddressInput.types'

const props = withDefaults(
	defineProps<BaseAddressInputProps>(),
	kitDefaults('BaseAddressInput', {
		variant: DEFAULT_VARIANT,
		modelValue: '',
		minChars: 3,
		debounce: 300,
		isRequired: false,
		isDisabled: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseAddressInputEmits>()

const { classes, value, isLoading, options, search, handleChange } = useBaseAddressInput(props, emit)
</script>
