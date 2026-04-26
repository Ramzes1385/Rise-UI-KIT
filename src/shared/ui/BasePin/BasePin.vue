<template>
	<div
		class="base-pin"
		:class="[
			{
				'base-pin--disabled': isDisabled,
				'base-pin--error': hasError,
			},
			variantClass,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<input
			v-for="i in length"
			:key="i"
			ref="inputRefs"
			type="text"
			maxlength="1"
			class="base-pin__input"
			:value="modelValue[i - 1] || ''"
			:disabled="isDisabled"
			@input="handleInput($event, i - 1)"
			@keydown="handleKeyDown($event, i - 1)"
			@paste="handlePaste" />
	</div>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { ref } from 'vue'
import './BasePin.style.scss'
import type { BasePinEmits, BasePinProps } from './BasePin.types'

const props = withDefaults(defineProps<BasePinProps>(), {
	length: 4,
	type: 'text',
	variant: 'default',
	isDisabled: false,
	hasError: false,
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-pin', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const emit = defineEmits<BasePinEmits>()

const inputRefs = ref<HTMLInputElement[]>([])

function handleInput(e: Event, index: number): void {
	const target = e.target as HTMLInputElement
	const val = target.value.slice(-1)

	const newValue = props.modelValue.padEnd(props.length, ' ').split('')
	newValue[index] = val
	const result = newValue.join('').trimEnd()
	emit('update:modelValue', result)

	if (val && index < props.length - 1) {
		inputRefs.value[index + 1]?.focus()
	}

	if (result.length === props.length && !result.includes(' ')) {
		emit('complete', result)
	}
}

function handleKeyDown(e: KeyboardEvent, index: number): void {
	if (e.key === 'Backspace') {
		e.preventDefault()
		const current = props.modelValue[index]

		if (current) {
			// В текущей ячейке есть символ — стираем его
			const newValue = props.modelValue.split('')
			newValue[index] = ''
			emit('update:modelValue', newValue.join(''))
			// Фокус остаётся на текущей ячейке
		} else if (index > 0) {
			// Текущая ячейка пуста — стираем предыдущую и переходим
			const newValue = props.modelValue.split('')
			newValue[index - 1] = ''
			emit('update:modelValue', newValue.join(''))
			inputRefs.value[index - 1]?.focus()
		}
	}
}

function handlePaste(e: ClipboardEvent): void {
	const data = e.clipboardData?.getData('text') || ''
	const val = data.slice(0, props.length)
	emit('update:modelValue', val)
	if (val.length === props.length) {
		emit('complete', val)
	}
}
</script>
