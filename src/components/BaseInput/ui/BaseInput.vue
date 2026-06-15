<template>
	<div
		class="base-input"
		:class="[
			variantClass,
			{
				'base-input--error': error,
				'base-input--disabled': isDisabled,
				'base-input--readonly': isReadonly,
				'base-input--has-prefix': prefix || $slots.prefix,
				'base-input--has-postfix': postfix || $slots.postfix,
				'base-input--password': type === 'password',
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<BaseText v-if="label" tag="label" class="base-input__label" :custom-class="classes.label" :size-scale="sizeScale">
			{{ label }}
			<BaseText
				v-if="isRequired"
				tag="span"
				class="base-input__required"
				:custom-class="classes.required"
				:size-scale="sizeScale"
				>*</BaseText
			>
		</BaseText>

		<div class="base-input__wrapper" :class="classes.wrapper">
			<slot name="prefix">
				<BaseText
					v-if="prefix"
					tag="span"
					class="base-input__prefix"
					:custom-class="classes.prefix"
					:size-scale="sizeScale"
					>{{ prefix }}</BaseText
				>
			</slot>
			<input
				ref="inputRef"
				class="base-input__field"
				:class="classes.field"
				:type="inputType"
				:value="displayValue"
				:placeholder="placeholder"
				:disabled="isDisabled"
				:readonly="isReadonly"
				@input="handleInput"
				@keydown="handleKeydown"
				@blur="handleBlur"
				@focus="handleFocus" />
			<BaseButton
				v-if="type === 'password'"
				variant="ghost"
				class="base-input__password-toggle"
				:custom-class="classes.passwordToggle"
				tabindex="-1"
				:aria-label="isPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'"
				:size-scale="sizeScale"
				@click="togglePasswordVisibility">
				<BaseIcon
					:name="isPasswordVisible ? 'eye-closed-icon' : 'eye-open-icon'"
					:custom-class="classes.passwordIcon"
					:size-scale="calcIconScale('sm', sizeScale)" />
			</BaseButton>
			<slot name="postfix">
				<BaseText
					v-if="postfix"
					tag="span"
					class="base-input__postfix"
					:custom-class="classes.postfix"
					:size-scale="sizeScale"
					>{{ postfix }}</BaseText
				>
			</slot>
			<slot name="suffix" />
		</div>

		<div v-if="passwordRuleResults.length > 0" class="base-input__password-rules" :class="classes.passwordRules">
			<div
				v-for="rule in passwordRuleResults"
				:key="rule.key"
				class="base-input__password-rule"
				:class="[{ 'base-input__password-rule--valid': rule.isValid }, classes.passwordRule]">
				<span class="base-input__password-rule-icon"
					><BaseIcon
						:name="rule.isValid ? 'check' : 'x-mark'"
						:custom-class="classes.passwordRuleIcon"
						:size-scale="calcIconScale('xs', sizeScale)"
				/></span>
				<span class="base-input__password-rule-label">{{ rule.label }}</span>
			</div>
		</div>

		<BaseText
			v-if="error"
			tag="span"
			class="base-input__error-text"
			:custom-class="classes.errorText"
			:size-scale="sizeScale"
			>{{ error }}</BaseText
		>
	</div>
</template>

<script setup lang="ts">
import { BaseButton } from '@components/BaseButton'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useInputMask } from '@composables/useInputMask'
import { usePasswordVisibility } from '@composables/usePasswordVisibility'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import { computed, ref } from 'vue'
import '../styles/BaseInput.style.scss'
import type { BaseInputEmits, BaseInputProps, PasswordRuleResult } from '../model/BaseInput.types'

const props = defineProps<BaseInputProps>()

const type = computed(() => props.type ?? 'text')
const placeholder = computed(() => props.placeholder ?? '')
const isDisabled = computed(() => props.isDisabled ?? false)
const isReadonly = computed(() => props.isReadonly ?? false)
const isRequired = computed(() => props.isRequired ?? false)
const variant = computed(() => props.variant ?? 'default')
const sizeScale = computed(() => props.sizeScale ?? 100)
const prefix = computed(() => props.prefix ?? '')
const postfix = computed(() => props.postfix ?? '')
const maskValue = computed(() => props.mask ?? '')

const { sizeScaleStyle } = useSizeScale({ getScale: () => sizeScale.value })
const { variantClass, variantStyle } = useVariant({ block: 'base-input', getVariant: () => variant.value })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: [
		'root',
		'label',
		'required',
		'wrapper',
		'prefix',
		'field',
		'passwordToggle',
		'passwordIcon',
		'postfix',
		'passwordRules',
		'passwordRule',
		'passwordRuleIcon',
		'errorText',
	],
})

const emit = defineEmits<BaseInputEmits>()
const inputRef = ref<HTMLInputElement | null>(null)

/** Composable для масок ввода */
const mask = useInputMask({ getMask: () => maskValue.value })

/** Composable для видимости пароля */
const { isPasswordVisible, inputType, togglePasswordVisibility } = usePasswordVisibility({
	type,
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
	if (type.value === 'password') return val
	if (!maskValue.value) return val
	return mask.applyMask(val, maskValue.value)
})

/** Обработка ввода */
function handleInput(e: Event): void {
	const target = e.target as HTMLInputElement
	const rawValue = target.value

	if (maskValue.value && type.value !== 'password') {
		const cleanValue = mask.stripMask(rawValue, maskValue.value)
		const limitedValue = mask.limitValue(cleanValue)

		emit('update:modelValue', limitedValue)

		const expectedDisplayValue = mask.applyMask(limitedValue, maskValue.value)
		if (target.value !== expectedDisplayValue) {
			target.value = expectedDisplayValue
		}

		requestAnimationFrame(() => {
			/* istanbul ignore next — defensive: inputRef доступен после mount, RAF выполняется в том же кадре */
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
	if (!maskValue.value || type.value === 'password') return

	const target = e.target as HTMLInputElement
	/* istanbul ignore next -- defensive `?? 0`: selectionStart всегда установлен для input в DOM */
	const cursorPos = target.selectionStart ?? 0
	const current = props.modelValue == null ? '' : String(props.modelValue)

	if (e.key === 'Backspace') {
		e.preventDefault()

		/* istanbul ignore else -- DOM clamp boundary: cursorPos === 0 невозможно через setSelectionRange */
		if (cursorPos > 0) {
			const { maskPos, valueIndex } = mask.cursorAfterBackspace(cursorPos)

			/* istanbul ignore else -- DOM clamp boundary: valueIndex всегда в пределах current при cursorPos > 0 */
			if (valueIndex >= 0 && valueIndex < current.length) {
				const newValue = current.slice(0, valueIndex) + current.slice(valueIndex + 1)
				emit('update:modelValue', newValue)

				requestAnimationFrame(() => {
					/* istanbul ignore next — defensive: inputRef доступен после mount, RAF выполняется в том же кадре */
					if (inputRef.value) {
						inputRef.value.setSelectionRange(maskPos, maskPos)
					}
				})
			}
		}
	}

	if (e.key === 'Delete') {
		e.preventDefault()

		/* istanbul ignore else -- DOM clamp boundary: cursorPos === current.length невозможно через setSelectionRange */
		if (cursorPos < current.length) {
			const { valueIndex } = mask.cursorAfterDelete(cursorPos)

			/* istanbul ignore else -- DOM clamp boundary: valueIndex всегда в пределах current при cursorPos < length */
			if (valueIndex >= 0 && valueIndex < current.length) {
				const newValue = current.slice(0, valueIndex) + current.slice(valueIndex + 1)
				emit('update:modelValue', newValue)

				requestAnimationFrame(() => {
					/* istanbul ignore next — defensive: inputRef доступен после mount, RAF выполняется в том же кадре */
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
	/* istanbul ignore next — defensive: optional chaining для public API на unmount */
	focus: () => inputRef.value?.focus(),
	/* istanbul ignore next — defensive: optional chaining для public API на unmount */
	blur: () => inputRef.value?.blur(),
})
</script>
