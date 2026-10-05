<template>
	<BaseInput
		:class="[ui('root'), classes.root]"
		:model-value="display"
		:variant="variant"
		:label="label"
		:placeholder="placeholder"
		:error="error"
		:is-disabled="isControlDisabled"
		:is-required="isRequired"
		:prefix="isSymbolFirst ? symbol : undefined"
		:postfix="isSymbolFirst ? undefined : symbol"
		:input-attrs="{ inputmode: 'decimal', autocomplete: 'off' }"
		:size-scale="sizeScale"
		:color="color"
		:custom-class="{ field: classes.field }"
		:ui="inputUi"
		@input="handleInput"
		@focus="handleFocus"
		@blur="handleBlur" />
</template>

<script setup lang="ts">
import '../styles/BaseMoneyInput.style.scss'
import { BaseInput } from '@components/BaseInput'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseMoneyInput } from '../model/useBaseMoneyInput'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseMoneyInputEmits, BaseMoneyInputProps } from '../types/BaseMoneyInput.types'

const props = withDefaults(
	defineProps<BaseMoneyInputProps>(),
	kitDefaults('BaseMoneyInput', {
		variant: DEFAULT_VARIANT,
		modelValue: null,
		currency: 'RUB',
		min: 0,
		max: undefined,
		isRequired: false,
		isDisabled: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseMoneyInputEmits>()

const { ui, inputUi, classes, isControlDisabled, symbol, isSymbolFirst, display, handleFocus, handleInput, handleBlur } = useBaseMoneyInput(
	props,
	emit,
)
</script>
