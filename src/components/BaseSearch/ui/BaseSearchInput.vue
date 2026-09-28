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
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/iconUtils'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { BaseLoader } from '@components/BaseLoader'
import { useBaseSearchInput } from '../model/useBaseSearchInput'
import type { BaseSearchInputEmits, BaseSearchInputExpose, BaseSearchInputProps } from '../types/BaseSearchInput.types'

const props = defineProps<BaseSearchInputProps>()

const emit = defineEmits<BaseSearchInputEmits>()

const { inputRef, handleInput, handleKeydown, handleFocus, handleBlur, handleClear, exposed } = useBaseSearchInput(props, emit)

defineExpose<BaseSearchInputExpose>(exposed)
</script>
