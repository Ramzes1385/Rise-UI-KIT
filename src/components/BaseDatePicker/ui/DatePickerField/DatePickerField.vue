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
			@click="handleFieldClick"
			@keydown="handleFieldKeydown">
			<template #suffix>
				<div class="date-picker-field__suffix">
					<BaseButton
						v-if="resolvedProps.isClearable && resolvedProps.hasValue"
						variant="ghost"
						class="date-picker-field__clear-btn"
						:class="classes.clearBtn"
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
							:class="classes.iconBtn"
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
import './DatePickerField.style.scss'
import { computed, ref, watchPostEffect } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/iconUtils'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { useCustomClass } from '@composables/useCustomClass'
import { useExplicitPropDetection } from '@composables/useExplicitPropDetection'
import type { DatePickerFieldEmits, DatePickerFieldProps, DatePickerFieldSlots } from '../../types/DatePickerField.types'

const props = defineProps<DatePickerFieldProps>()
const { resolveBooleanPropDefault } = useExplicitPropDetection()

const resolvedProps = computed(() => ({
	label: props.label ?? '',
	error: props.error ?? '',
	isDisabled: props.isDisabled ?? false,
	isReadonly: resolveBooleanPropDefault('isReadonly', props.isReadonly, true),
	isRequired: props.isRequired ?? false,
	isClearable: props.isClearable ?? false,
	isOpen: props.isOpen ?? false,
	hasValue: props.hasValue ?? false,
	sizeScale: props.sizeScale ?? 100,
}))

const emit = defineEmits<DatePickerFieldEmits>()
defineSlots<DatePickerFieldSlots>()

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'input', 'clearBtn', 'clearIcon', 'iconBtn', 'calendarIcon'],
})

const inputRef = ref<InstanceType<typeof BaseInput> | null>(null)

/**
 * isReadonly (по умолчанию true) только запрещает ручной ввод: дату выбирают в панели. Поэтому поле получает нативный
 * readonly, но не оформление readonly-поля BaseInput (приглушённый фон) — оно выглядит как обычное поле своего варианта.
 */
watchPostEffect(() => {
	const input = inputRef.value?.inputRef
	if (input) input.readOnly = resolvedProps.value.isReadonly
})

function handleFieldClick(): void {
	emit('field-click')
}

function handleClearClick(): void {
	emit('clear-click')
}

function handleIconClick(): void {
	emit('icon-click')
}

/**
 * Открытие с клавиатуры (Enter / ↓ / Alt+↓, как в APG date picker): поле по умолчанию readonly,
 * а кнопка-иконка исключена из Tab-порядка — без этого выбрать дату без мыши было невозможно.
 */
function handleFieldKeydown(event: KeyboardEvent): void {
	if (resolvedProps.value.isDisabled) return
	if (event.key !== 'Enter' && event.key !== 'ArrowDown') return
	// Enter в поле внутри формы иначе отправил бы форму, ↓ — прокрутил бы страницу
	event.preventDefault()
	emit('keyboard-open')
}
</script>
