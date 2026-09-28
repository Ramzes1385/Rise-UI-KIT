<template>
	<BaseInput
		ref="inputRef"
		class="base-search__field"
		:model-value="modelValue"
		:label="placeholder"
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
		<template v-if="hasIcon" #prefix>
			<BaseIcon name="search" class="base-search__icon" :custom-class="classes.icon" :size-scale="calcIconScale('sm', sizeScale)" />
		</template>
		<template v-if="isLoading || (hasClear && modelValue)" #suffix>
			<span class="base-search__actions">
				<BaseLoader
					v-if="isLoading"
					class="base-search__loading"
					:custom-class="classes.loading"
					variant="spinner"
					:size-scale="sizeScale / 2" />
				<!-- Очистка не уводит фокус из поля (mousedown.prevent) и не встаёт в порядок Tab — как кнопка пароля BaseInput -->
				<BaseButton
					v-if="hasClear && modelValue"
					variant="ghost"
					class="base-search__clear"
					:custom-class="classes.clear"
					:size-scale="sizeScale"
					:aria-label="UI_ARIA.CLEAR_VALUE"
					tabindex="-1"
					@mousedown.prevent
					@click="handleClear">
					<BaseIcon name="x-mark" :custom-class="classes.clearIcon" :size-scale="calcIconScale('sm', sizeScale)" />
				</BaseButton>
			</span>
		</template>
	</BaseInput>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/iconUtils'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { BaseLoader } from '@components/BaseLoader'
import { useTriggerAttributes } from '@composables/useTriggerAttributes'
import type { BaseSearchInputEmits, BaseSearchInputProps } from '../model/BaseSearchInput.types'

/**
 * Поле поиска — BaseInput: иконка поиска слева, справа индикатор загрузки и ghost-кнопка очистки 24px.
 * Подпись поля — текст плейсхолдера, скрытый визуально: у поля есть доступное имя и после ввода текста.
 */
const props = defineProps<BaseSearchInputProps>()

const emit = defineEmits<BaseSearchInputEmits>()

const inputRef = ref<InstanceType<typeof BaseInput> | null>(null)

/** Поле — combobox (APG «combobox with listbox popup»): атрибуты ставятся на сам <input> внутри BaseInput */
useTriggerAttributes(
	() => inputRef.value?.$el as HTMLElement | undefined,
	() => props.comboboxAttributes ?? {},
)

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
