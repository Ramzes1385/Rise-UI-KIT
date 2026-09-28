<template>
	<!-- Группа ячеек: имя группе даёт aria-label на компоненте или подпись обёртки BaseFormField -->
	<div
		ref="rootRef"
		class="base-pin"
		:class="[
			{
				'base-pin--disabled': isDisabled,
				'base-pin--error': hasError,
			},
			variantClass,
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="group">
		<div class="base-pin__cells" :class="classes.cells">
			<input
				v-for="i in length"
				:key="i"
				ref="inputRefs"
				:type="type"
				maxlength="1"
				class="base-pin__input"
				:class="classes.input"
				:value="cells[i - 1]"
				:disabled="isDisabled"
				:aria-label="cellLabel(i)"
				:aria-invalid="hasError ? 'true' : undefined"
				:aria-describedby="hasError ? errorId : undefined"
				@input="handleInput($event, i - 1)"
				@keydown="handleKeyDown($event, i - 1)"
				@paste="handlePaste" />
		</div>

		<FormFieldError
			:id="errorId"
			:error="formField.error"
			class-name="base-pin__error-text"
			:custom-class="classes.errorText"
			:size-scale="sizeScale" />
	</div>
</template>

<script setup lang="ts">
import { kitDefaults } from '@composables/useDefaults'
import { FormFieldError } from '@components/BaseFormField'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useBasePin } from '../model/useBasePin'
import '../styles/BasePin.style.scss'
import type { BasePinEmits, BasePinProps, BasePinSlots } from '../types/BasePin.types'

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
	handleInput,
	handlePaste,
	handleKeyDown,
	exposed,
} = useBasePin(props, emit)

defineExpose(exposed)
</script>
