<template>
	<!-- Режим: модальное окно / боковая панель -->
	<template v-if="mode === 'modal' || mode === 'sidebar'">
		<BaseSearchOverlay
			ref="overlayRef"
			:panel="mode"
			:model-value="query"
			:search-placeholder="resolvedPlaceholder"
			:trigger-placeholder="placeholder"
			:variant="variant"
			:size-scale="sizeScale"
			:is-disabled="isDisabled"
			:error="error"
			:has-icon="hasIcon"
			:has-clear="hasClear"
			:is-loading="isLoading"
			:visible-results="visibleResults"
			:highlighted-index="highlightedIndex"
			:should-show-results="shouldShowResults"
			:classes="classes"
			:color="color"
			:custom-class="customClass"
			@update:model-value="handleInput"
			@keydown="handleKeydown"
			@clear="handleClear"
			@select="handleSelect"
			@highlight="highlightedIndex = $event"
			@close="handleOverlayClose">
			<template #result="slotProps">
				<slot name="result" v-bind="slotProps" />
			</template>
			<template #results="slotProps">
				<slot name="results" v-bind="slotProps" />
			</template>
			<template #result-before="slotProps">
				<slot name="result-before" v-bind="slotProps" />
			</template>
			<template #result-after="slotProps">
				<slot name="result-after" v-bind="slotProps" />
			</template>
			<template #empty>
				<slot name="empty" />
			</template>
			<template #loading>
				<slot name="loading" />
			</template>
		</BaseSearchOverlay>
	</template>

	<!-- Режим: по умолчанию (inline dropdown) -->
	<div
		v-else
		class="base-search"
		:class="[variantClass, { 'base-search--disabled': isDisabled, 'base-search--loading': isLoading }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<BaseDropdown
			v-model:is-open="isOpen"
			position="bottom-start"
			:match-width="true"
			:prevent-mousedown="false"
			:size-scale="sizeScale"
			:padding="0"
			:custom-class="classes.dropdown"
			@close="handleClose">
			<BaseSearchInput
				ref="baseInputRef"
				:model-value="query"
				:placeholder="resolvedPlaceholder"
				:variant="variant"
				:size-scale="sizeScale"
				:is-disabled="isDisabled"
				:error="error"
				:has-icon="hasIcon"
				:has-clear="hasClear"
				:is-loading="isLoading"
				:classes="classes"
				class="base-search__trigger"
				@update:model-value="handleInput"
				@keydown="handleKeydown"
				@focus="handleFocus"
				@blur="handleBlur"
				@clear="handleClear" />

			<template #dropdown>
				<BaseSearchResults
					:visible-results="visibleResults"
					:query="query"
					:is-loading="isLoading"
					:size-scale="sizeScale"
					:highlighted-index="highlightedIndex"
					:classes="classes"
					@select="handleSelect"
					@highlight="highlightedIndex = $event">
					<template #result="slotProps">
						<slot name="result" v-bind="slotProps" />
					</template>
					<template #results="slotProps">
						<slot name="results" v-bind="slotProps" />
					</template>
					<template #result-before="slotProps">
						<slot name="result-before" v-bind="slotProps" />
					</template>
					<template #result-after="slotProps">
						<slot name="result-after" v-bind="slotProps" />
					</template>
					<template #empty>
						<slot name="empty" />
					</template>
					<template #loading>
						<slot name="loading" />
					</template>
				</BaseSearchResults>
			</template>
		</BaseDropdown>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseDropdown } from '@components/BaseDropdown'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useSearchState } from '@composables/useSearchState'
import { UI_TEXT, SIZE_SCALE_DEFAULT, DEFAULT_VARIANT} from '@constants'
import BaseSearchInput from './BaseSearchInput.vue'
import '../styles/BaseSearch.style.scss'
import BaseSearchOverlay from './BaseSearchOverlay.vue'
import BaseSearchResults from './BaseSearchResults.vue'
import type { BaseSearchEmits, BaseSearchProps, BaseSearchSlots } from '../model/BaseSearch.types'

const props = withDefaults(defineProps<BaseSearchProps>(), {
	modelValue: '',
	placeholder: UI_TEXT.SEARCH_PLACEHOLDER,
	sizeScale: SIZE_SCALE_DEFAULT,
	variant: DEFAULT_VARIANT,
	mode: 'default',
	results: () => [],
	isInstant: true,
	debounceMs: 300,
	isLoading: false,
	hasClear: true,
	hasIcon: true,
	maxResults: 10,
	isAutofocus: false,
	isDisabled: false,
	error: '',
})

const emit = defineEmits<BaseSearchEmits>()
defineSlots<BaseSearchSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent(
	'base-search',
	props,
	[
		'root',
		'trigger',
		'icon',
		'modalOverlay',
		'modal',
		'modalHeader',
		'modalInput',
		'clear',
		'clearIcon',
		'loading',
		'modalClose',
		'modalCloseIcon',
		'modalResults',
		'result',
		'resultImage',
		'resultIcon',
		'resultContent',
		'resultTitle',
		'resultDesc',
		'resultCategory',
		'empty',
		'emptyText',
		'sidebarOverlay',
		'sidebar',
		'sidebarHeader',
		'sidebarInput',
		'sidebarClose',
		'sidebarCloseIcon',
		'sidebarResults',
		'dropdown',
		'input',
	],
)

const baseInputRef = ref<InstanceType<typeof BaseSearchInput> | null>(null)
const overlayRef = ref<InstanceType<typeof BaseSearchOverlay> | null>(null)
const resolvedPlaceholder = computed<string>(() => props.placeholder ?? UI_TEXT.SEARCH_PLACEHOLDER)

function focusActiveInput(): void {
	if (props.mode === 'modal' || props.mode === 'sidebar') overlayRef.value?.focus()
	else baseInputRef.value?.focus()
}

function closeOverlay(): void {
	overlayRef.value?.close()
}

const {
	query,
	isOpen,
	visibleResults,
	shouldShowResults,
	highlightedIndex,
	handleInput,
	handleKeydown,
	handleClear,
	handleSelect,
	handleFocus,
	handleBlur,
	handleClose,
	handleOverlayClose,
} = useSearchState({
	modelValue: () => props.modelValue,
	mode: () => props.mode,
	results: () => props.results,
	isInstant: () => props.isInstant,
	debounceMs: () => props.debounceMs,
	maxResults: () => props.maxResults,
	isAutofocus: () => props.isAutofocus,
	emit: {
		search: value => emit('search', value),
		select: item => emit('select', item),
		updateModelValue: value => emit('update:modelValue', value),
		clear: () => emit('clear'),
	},
	focusActiveInput,
	closeOverlay,
})
</script>
