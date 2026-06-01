<template>
	<div class="date-picker-field" :class="classes.root">
		<BaseInput
			:model-value="displayValue"
			:placeholder="placeholder"
			:label="label"
			:error="error"
			:is-disabled="isDisabled"
			:is-readonly="isReadonly"
			:is-required="isRequired"
			:variant="inputVariant"
			:color="color"
			:size-scale="sizeScale"
			:custom-class="classes.input"
			@click="handleFieldClick">
			<template #suffix>
				<div class="date-picker-field__suffix">
					<BaseButton
						v-if="isClearable && hasValue"
						variant="ghost"
						class="date-picker-field__clear-btn"
						:class="classes.clearBtn"
						:size-scale="calcIconScale('xs', sizeScale)"
						:is-disabled="isDisabled"
						tabindex="-1"
						:padding="0"
						@click.stop="handleClearClick">
						<BaseIcon
							name="close"
							:size-scale="calcIconScale('xs', sizeScale)"
							padding="0"
							:custom-class="classes.clearIcon" />
					</BaseButton>
					<slot name="icon">
						<BaseButton
							:padding="5"
							variant="ghost"
							:color="{ bg: { base: 'transparent' } }"
							class="date-picker-field__icon-btn"
							:class="classes.iconBtn"
							:size-scale="sizeScale"
							:is-disabled="isDisabled"
							tabindex="-1"
							@click.stop="handleIconClick">
							<BaseIcon
								name="calendar"
								:size-scale="calcIconScale('sm', sizeScale)"
								:custom-class="classes.calendarIcon" />
						</BaseButton>
					</slot>
				</div>
			</template>
		</BaseInput>
	</div>
</template>

<script setup lang="ts">
import './DatePickerField.style.scss'
import type { DatePickerFieldEmits, DatePickerFieldProps } from './DatePickerField.types'

import { BaseButton } from '@components/BaseButton'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { useCustomClass } from '@composables/useCustomClass'

const props = withDefaults(defineProps<DatePickerFieldProps>(), {
	isDisabled: false,
	isReadonly: true,
	isRequired: false,
	isClearable: false,
	isOpen: false,
	hasValue: false,
	sizeScale: 100,
	label: '',
	error: '',
})

const emit = defineEmits<DatePickerFieldEmits>()

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'input', 'clearBtn', 'clearIcon', 'iconBtn', 'calendarIcon'],
})

/** Клик по полю ввода */
function handleFieldClick(): void {
	emit('field-click')
}

/** Клик по кнопке очистки */
function handleClearClick(): void {
	emit('clear-click')
}

/** Клик по кнопке иконки */
function handleIconClick(): void {
	emit('icon-click')
}
</script>
