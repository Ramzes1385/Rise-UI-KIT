<template>
	<div
		class="base-pin"
		:class="[
			{
				'base-pin--disabled': props.isDisabled,
				'base-pin--error': hasError,
			},
			variantClass,
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div class="base-pin__cells" :class="classes.cells">
			<input
				v-for="i in props.length"
				:key="i"
				ref="inputRefs"
				:type="props.type"
				maxlength="1"
				class="base-pin__input"
				:class="classes.input"
				:value="cells[i - 1]"
				:disabled="props.isDisabled"
				@input="handleInput($event, i - 1)"
				@keydown="handleKeyDown($event, i - 1)"
				@paste="handlePaste" />
		</div>

		<BaseText
			v-if="error"
			tag="span"
			class="base-pin__error-text"
			:size-scale="props.sizeScale"
			:custom-class="classes.errorText">
			{{ error }}
		</BaseText>
	</div>
</template>

<script setup lang="ts">
import { BaseText } from '@components/BaseText'
import { useBaseComponent } from '@composables/useBaseComponent'
import { computed, ref } from 'vue'
import '../styles/BasePin.style.scss'
import type { BasePinEmits, BasePinProps } from '../model/BasePin.types'

const props = withDefaults(defineProps<BasePinProps>(), {
	length: 4,
	type: 'text',
	isDisabled: false,
	sizeScale: 100,
})

const hasError = computed(() => Boolean(props.error))

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-pin',
	getVariant: () => props.variant,
	getSizeScale: () => props.sizeScale,
	getColor: () => props.color,
	getClass: () => props.customClass,
	elementKeys: ['root', 'cells', 'input', 'errorText'],
})

const emit = defineEmits<BasePinEmits>()

const inputRefs = ref<HTMLInputElement[]>([])

/** Ячейки для отображения: пустые строки вместо пробелов-заполнителей */
const cells = computed(() => {
	const result: string[] = []
	for (let i = 0; i < props.length; i++) {
		const char = props.modelValue[i]
		result.push(char && char !== ' ' ? char : '')
	}
	return result
})

/** Нормализует modelValue в массив фиксированной длины (пробел = пустая ячейка) */
function normalizeValue(val: string): string[] {
	const result: string[] = []
	for (let i = 0; i < props.length; i++) {
		result.push(val[i] || ' ')
	}
	return result
}

function handleInput(e: Event, index: number): void {
	const target = e.target as HTMLInputElement
	const val = target.value.slice(-1)
	const chars = normalizeValue(props.modelValue)
	chars[index] = val || ' '
	const result = chars.join('').trimEnd()
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
		const chars = normalizeValue(props.modelValue)

		if (chars[index] !== ' ') {
			chars[index] = ' '
			emit('update:modelValue', chars.join('').trimEnd())
		} else if (index > 0) {
			chars[index - 1] = ' '
			emit('update:modelValue', chars.join('').trimEnd())
			inputRefs.value[index - 1]?.focus()
		}
	}

	if (e.key === 'ArrowLeft' && index > 0) {
		e.preventDefault()
		inputRefs.value[index - 1]?.focus()
	}

	if (e.key === 'ArrowRight' && index < props.length - 1) {
		e.preventDefault()
		inputRefs.value[index + 1]?.focus()
	}
}

function handlePaste(e: ClipboardEvent): void {
	e.preventDefault()
	/* istanbul ignore next -- defensive `|| ''`: clipboardData всегда установлен в paste-событии, fallback недостижим */
	const data = e.clipboardData?.getData('text') || ''
	const val = data.replace(/\s/g, '').slice(0, props.length)
	emit('update:modelValue', val)
	if (val.length === props.length) {
		emit('complete', val)
	}
}
</script>
