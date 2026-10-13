<template>
	<div class="date-picker-field" :class="[{ 'date-picker-field--disabled': resolvedProps.isDisabled }, classes.root]">
		<BaseInput
			ref="inputRef"
			:model-value="displayValue"
			:placeholder="placeholder"
			:label="resolvedProps.label"
			:error="resolvedProps.error"
			:is-disabled="resolvedProps.isDisabled"
			:is-required="resolvedProps.isRequired"
			:variant="inputVariant"
			:color="color"
			:size-scale="resolvedProps.sizeScale"
			:custom-class="classes.input"
			:ui="inputUi"
			@click="handleFieldClick"
			@blur="handleBlur"
			@keydown="handleFieldKeydown"
			@update:model-value="handleInput">
			<template #suffix>
				<div class="date-picker-field__suffix" :class="ui('suffix')">
					<BaseButton
						v-if="resolvedProps.isClearable && resolvedProps.hasValue"
						variant="ghost"
						class="date-picker-field__clear-btn"
						:class="[ui('clear-btn'), classes.clearBtn]"
						:aria-label="UI_ARIA.CLEAR_VALUE"
						:size-scale="resolvedProps.sizeScale"
						:is-disabled="resolvedProps.isDisabled"
						tabindex="-1"
						@click.stop="handleClearClick">
						<BaseIcon
							name="close"
							:size-scale="calcIconScale('sm', resolvedProps.sizeScale)"
							:custom-class="classes.clearIcon" />
					</BaseButton>
					<slot name="icon">
						<BaseButton
							variant="ghost"
							class="date-picker-field__icon-btn"
							:class="[ui('icon-btn'), classes.iconBtn]"
							:aria-label="UI_ARIA.OPEN_CALENDAR"
							aria-haspopup="dialog"
							:aria-expanded="resolvedProps.isOpen ? 'true' : 'false'"
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
import '../../styles/DatePickerField.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { calcIconScale } from '@utils/media/iconUtils'
import { useDatePickerField } from '../../model/useDatePickerField'
import type { DatePickerFieldEmits, DatePickerFieldProps, DatePickerFieldSlots } from '../../types/DatePickerField.types'

const props = defineProps<DatePickerFieldProps>()

const emit = defineEmits<DatePickerFieldEmits>()
defineSlots<DatePickerFieldSlots>()

const {
	ui,
	inputUi,
	resolvedProps,
	classes,
	inputRef,
	handleFieldClick,
	handleClearClick,
	handleIconClick,
	handleInput,
	handleBlur,
	handleFieldKeydown,
} = useDatePickerField(props, emit)
</script>
