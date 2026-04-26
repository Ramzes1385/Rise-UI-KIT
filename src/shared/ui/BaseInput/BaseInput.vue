<template>
	<div
		class="base-input"
		:class="[
			variantClass,
			{
				'base-input--error': error,
				'base-input--disabled': isDisabled,
				'base-input--has-prefix': prefix || $slots.prefix,
				'base-input--has-postfix': postfix || $slots.postfix,
				'base-input--password': type === 'password',
			},
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<BaseText v-if="label" tag="label" class="base-input__label" :size-scale="sizeScale">
			{{ label }}
			<BaseText v-if="isRequired" tag="span" class="base-input__required" :size-scale="sizeScale">*</BaseText>
		</BaseText>

		<div class="base-input__wrapper">
			<slot name="prefix">
				<BaseText v-if="prefix" tag="span" class="base-input__prefix" :size-scale="sizeScale">{{ prefix }}</BaseText>
			</slot>
			<input
				ref="inputRef"
				class="base-input__field"
				:type="inputType"
				:value="displayValue"
				:placeholder="placeholder"
				:disabled="isDisabled"
				@input="handleInput"
				@keydown="handleKeydown"
				@blur="handleBlur"
				@focus="handleFocus" />
			<BaseButton
				v-if="type === 'password'"
				variant="ghost"
				class="base-input__password-toggle"
				tabindex="-1"
				:aria-label="isPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'"
				:size-scale="sizeScale"
				@click="togglePasswordVisibility">
				<BaseIcon :name="isPasswordVisible ? 'eye-closed-icon' : 'eye-open-icon'" size="sm" :size-scale="sizeScale" />
			</BaseButton>
			<slot name="postfix">
				<BaseText v-if="postfix" tag="span" class="base-input__postfix" :size-scale="sizeScale">{{ postfix }}</BaseText>
			</slot>
			<slot name="suffix" />
		</div>

		<div v-if="passwordRuleResults.length > 0" class="base-input__password-rules">
			<div
				v-for="rule in passwordRuleResults"
				:key="rule.key"
				class="base-input__password-rule"
				:class="{ 'base-input__password-rule--valid': rule.isValid }">
				<span class="base-input__password-rule-icon"
					><BaseIcon :name="rule.isValid ? 'check' : 'x-mark'" size="xs" :size-scale="sizeScale"
				/></span>
				<span class="base-input__password-rule-label">{{ rule.label }}</span>
			</div>
		</div>

		<BaseText v-if="error" tag="span" class="base-input__error-text" :size-scale="sizeScale">{{ error }}</BaseText>
	</div>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useInputMask } from '@/shared/composables/useInputMask'
import { usePasswordVisibility } from '@/shared/composables/usePasswordVisibility'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { BaseButton } from '@/shared/ui/BaseButton'
import BaseIcon from '@/shared/ui/BaseIcon/BaseIcon.vue'
import { BaseText } from '@/shared/ui/BaseText'
import { computed, ref, toRef } from 'vue'
import './BaseInput.style.scss'
import type { BaseInputEmits, BaseInputProps, PasswordRuleResult } from './BaseInput.types'

const props = withDefaults(defineProps<BaseInputProps>(), {
	type: 'text',
	placeholder: '',
	isDisabled: false,
	isRequired: false,
	variant: 'default',
	sizeScale: 100,
	prefix: '',
	postfix: '',
	mask: '',
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-input', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const emit = defineEmits<BaseInputEmits>()
const inputRef = ref<HTMLInputElement | null>(null)

/** Composable для масок ввода */
const mask = useInputMask({ getMask: () => props.mask })

/** Composable для видимости пароля */
const { isPasswordVisible, inputType, togglePasswordVisibility } = usePasswordVisibility({
	type: toRef(props, 'type'),
})

/** Результаты валидации правил пароля */
const passwordRuleResults = computed<PasswordRuleResult[]>(() => {
	if (!props.passwordRules) return []
	const val = props.modelValue == null ? '' : String(props.modelValue)
	return props.passwordRules.map(rule => ({
		key: rule.key,
		label: rule.label,
		isValid: rule.validate(val),
	}))
})

/** Отображаемое значение (с применённой маской) */
const displayValue = computed(() => {
	const val = props.modelValue == null ? '' : String(props.modelValue)
	if (props.type === 'password') return val
	if (!props.mask) return val
	return mask.applyMask(val, props.mask)
})

/** Обработка ввода */
function handleInput(e: Event): void {
	const target = e.target as HTMLInputElement
	const rawValue = target.value

	if (props.mask && props.type !== 'password') {
		const cleanValue = mask.stripMask(rawValue, props.mask)
		const limitedValue = mask.limitValue(cleanValue)

		emit('update:modelValue', limitedValue)

		const expectedDisplayValue = mask.applyMask(limitedValue, props.mask)
		if (target.value !== expectedDisplayValue) {
			target.value = expectedDisplayValue
		}

		requestAnimationFrame(() => {
			if (inputRef.value) {
				const newPos = mask.cursorAfterInput(limitedValue.length)
				inputRef.value.setSelectionRange(newPos, newPos)
			}
		})
	} else {
		emit('update:modelValue', rawValue)
	}
}

/** Обработка клавиш (Backspace/Delete через маску) */
function handleKeydown(e: KeyboardEvent): void {
	emit('keydown', e)
	if (!props.mask || props.type === 'password') return

	const target = e.target as HTMLInputElement
	const cursorPos = target.selectionStart ?? 0
	const current = props.modelValue == null ? '' : String(props.modelValue)

	if (e.key === 'Backspace') {
		e.preventDefault()

		if (cursorPos > 0) {
			const { maskPos, valueIndex } = mask.cursorAfterBackspace(cursorPos)

			if (valueIndex >= 0 && valueIndex < current.length) {
				const newValue = current.slice(0, valueIndex) + current.slice(valueIndex + 1)
				emit('update:modelValue', newValue)

				requestAnimationFrame(() => {
					if (inputRef.value) {
						inputRef.value.setSelectionRange(maskPos, maskPos)
					}
				})
			}
		}
	}

	if (e.key === 'Delete') {
		e.preventDefault()

		if (cursorPos < current.length) {
			const { valueIndex } = mask.cursorAfterDelete(cursorPos)

			if (valueIndex >= 0 && valueIndex < current.length) {
				const newValue = current.slice(0, valueIndex) + current.slice(valueIndex + 1)
				emit('update:modelValue', newValue)

				requestAnimationFrame(() => {
					if (inputRef.value) {
						inputRef.value.setSelectionRange(cursorPos, cursorPos)
					}
				})
			}
		}
	}
}

/** Обработка потери фокуса */
function handleBlur(e: FocusEvent): void {
	emit('blur', e)
}

/** Обработка фокуса */
function handleFocus(e: FocusEvent): void {
	emit('focus', e)
}

/** Публичный API */
defineExpose({
	inputRef,
	focus: () => inputRef.value?.focus(),
	blur: () => inputRef.value?.blur(),
})
</script>
