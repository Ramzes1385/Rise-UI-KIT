<template>
	<div
		ref="rootRef"
		:class="[
			ui('root'),
			{
				'base-pin--disabled': isDisabled,
				'base-pin--error': hasError,
			},
			variantClass,
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="group">
		<div :class="[ui('cells'), classes.cells]">
			<input
				v-for="i in length"
				:key="i"
				ref="inputRefs"
				:type="type"
				maxlength="1"
				:class="[ui('input'), { 'base-pin__input--filled': cells[i - 1], 'base-pin__input--pop': isPopped(i - 1) }, classes.input]"
				:value="cells[i - 1]"
				:disabled="isDisabled"
				:aria-label="cellLabel(i)"
				:aria-invalid="hasError ? 'true' : undefined"
				:aria-describedby="hasError ? errorId : undefined"
				@input="handleInput($event, i - 1)"
				@keydown="handleKeyDown($event, i - 1)"
				@paste="handlePaste"
				@animationend="settlePop(i - 1)" />
		</div>

		<FormFieldError
			:id="errorId"
			:error="formField.error"
			:class-name="ui('error-text')"
			:custom-class="classes.errorText"
			:size-scale="sizeScale" />
	</div>
</template>

<script setup lang="ts">
import '../styles/BasePin.style.scss'
import { useBasePin } from '../model/useBasePin'
import { FormFieldError } from '@components/BaseFormField'
import { kitDefaults } from '@composables/base/useDefaults'
import type { BasePinEmits, BasePinProps, BasePinSlots } from '../types/BasePin.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BasePinProps>(),
	kitDefaults('BasePin', {
		variant: DEFAULT_VARIANT,
		length: 4,
		type: 'text',
		isDisabled: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const emit = defineEmits<BasePinEmits>()
defineSlots<BasePinSlots>()

const {
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	formField,
	hasError,
	errorId,
	inputRefs,
	rootRef,
	cellLabel,
	cells,
	isPopped,
	settlePop,
	handleInput,
	handlePaste,
	handleKeyDown,
	exposed,
} = useBasePin(props, emit)

defineExpose(exposed)
</script>
