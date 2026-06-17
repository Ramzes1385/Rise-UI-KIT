<template>
	<BaseInput
		ref="inputRef"
		:model-value="modelValue"
		:placeholder="placeholder"
		:variant="variant"
		:size-scale="sizeScale"
		:is-disabled="isDisabled"
		:error="error"
		:custom-class="inputClass ?? classes.input"
		type="text"
		@update:model-value="handleInput"
		@keydown="handleKeydown"
		@focus="handleFocus"
		@blur="handleBlur">
		<template #prefix>
			<BaseIcon
				v-if="hasIcon"
				name="search"
				class="base-search__icon"
				:custom-class="classes.icon"
				:size-scale="calcIconScale('sm', sizeScale)" />
		</template>
		<template #suffix>
			<BaseButton
				v-if="hasClear && modelValue"
				variant="ghost"
				class="base-search__clear"
				:custom-class="classes.clear"
				:size-scale="sizeScale"
				@click="handleClear">
				<BaseIcon
					name="x-mark"
					:custom-class="classes.clearIcon"
					:size-scale="calcIconScale('xs', sizeScale)" />
			</BaseButton>
			<BaseLoader
				v-if="isLoading"
				class="base-search__loading"
				:custom-class="classes.loading"
				variant="spinner"
				:size-scale="calcIconScale('xs', sizeScale)" />
		</template>
	</BaseInput>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { BaseLoader } from '@components/BaseLoader'
import type { SearchVariant } from '../model/BaseSearch.types'

interface BaseSearchInputProps {
	modelValue: string
	placeholder: string
	variant: SearchVariant
	sizeScale: number
	isDisabled: boolean
	error: string
	hasIcon: boolean
	hasClear: boolean
	isLoading: boolean
	inputClass?: string | Record<string, string | undefined>
	classes: Record<string, string | undefined>
}

defineProps<BaseSearchInputProps>()

const emit = defineEmits<{
	(event: 'update:modelValue', value: string): void
	(event: 'keydown', e: KeyboardEvent): void
	(event: 'focus'): void
	(event: 'blur'): void
	(event: 'clear'): void
}>()

const inputRef = ref<InstanceType<typeof BaseInput> | null>(null)

function handleInput(value: string): void {
	emit('update:modelValue', value)
}

function handleKeydown(e: KeyboardEvent): void {
	emit('keydown', e)
}

function handleFocus(): void {
	emit('focus')
}

function handleBlur(): void {
	emit('blur')
}

function handleClear(): void {
	emit('clear')
}

function focus(): void {
	inputRef.value?.focus()
}

defineExpose({
	focus,
})
</script>
