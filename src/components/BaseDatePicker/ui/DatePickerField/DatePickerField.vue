<template>
	<div class="date-picker-field" :class="classes.root">
		<BaseInput
			:model-value="displayValue"
			:placeholder="placeholder"
			:label="resolvedProps.label"
			:error="resolvedProps.error"
			:is-disabled="resolvedProps.isDisabled"
			:is-readonly="resolvedProps.isReadonly"
			:is-required="resolvedProps.isRequired"
			:variant="inputVariant"
			:color="color"
			:size-scale="resolvedProps.sizeScale"
			:custom-class="classes.input"
			@click="handleFieldClick">
			<template #suffix>
				<div class="date-picker-field__suffix">
					<BaseButton
						v-if="resolvedProps.isClearable && resolvedProps.hasValue"
						variant="ghost"
						class="date-picker-field__clear-btn"
						:class="classes.clearBtn"
						:size-scale="calcIconScale('xs', resolvedProps.sizeScale)"
						:is-disabled="resolvedProps.isDisabled"
						tabindex="-1"
						:padding="0"
						@click.stop="handleClearClick">
						<BaseIcon
							name="close"
							:size-scale="calcIconScale('xs', resolvedProps.sizeScale)"
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
							:size-scale="resolvedProps.sizeScale"
							:is-disabled="resolvedProps.isDisabled"
							tabindex="-1"
							@click.stop="handleIconClick">
							<BaseIcon
								name="calendar"
								:size-scale="calcIconScale('sm', resolvedProps.sizeScale)"
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
import { computed, getCurrentInstance } from 'vue'
import { resolveBooleanPropDefault } from '../../model/BaseDatePickerCalendar.types'

const props = defineProps<DatePickerFieldProps>()
const rawProps = getCurrentInstance()?.vnode.props

const resolvedProps = computed(() => ({
	label: props.label ?? '',
	error: props.error ?? '',
	isDisabled: props.isDisabled ?? false,
	isReadonly: resolveBooleanPropDefault(rawProps, 'isReadonly', props.isReadonly, true),
	isRequired: props.isRequired ?? false,
	isClearable: props.isClearable ?? false,
	isOpen: props.isOpen ?? false,
	hasValue: props.hasValue ?? false,
	sizeScale: props.sizeScale ?? 100,
}))

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
