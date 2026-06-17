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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { BaseDropdown } from '@components/BaseDropdown'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useListNavigation } from '@composables/useListNavigation'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import { UI_TEXT, UI_TIMING, SIZE_SCALE_DEFAULT, DEFAULT_VARIANT} from '@constants'
import BaseSearchInput from './BaseSearchInput.vue'
import '../styles/BaseSearch.style.scss'
import BaseSearchOverlay from './BaseSearchOverlay.vue'
import BaseSearchResults from './BaseSearchResults.vue'
import type { BaseSearchEmits, BaseSearchProps, SearchResult } from '../model/BaseSearch.types'

const props = withDefaults(defineProps<BaseSearchProps>(), {
	modelValue: '',
	placeholder: UI_TEXT.SEARCH_PLACEHOLDER,
	sizeScale: SIZE_SCALE_DEFAULT,
	variant: DEFAULT_VARIANT,
	mode: 'default',
	results: () => [],
	isInstant: true,
	debounceMs: UI_TIMING.DEBOUNCE_DEFAULT,
	isLoading: false,
	hasClear: true,
	hasIcon: true,
	maxResults: 10,
	isAutofocus: false,
	isDisabled: false,
	error: '',
})

const emit = defineEmits<BaseSearchEmits>()

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-search', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: [
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
})

const baseInputRef = ref<InstanceType<typeof BaseSearchInput> | null>(null)
const overlayRef = ref<InstanceType<typeof BaseSearchOverlay> | null>(null)
const resolvedPlaceholder = computed<string>(() => props.placeholder ?? UI_TEXT.SEARCH_PLACEHOLDER)
const query = ref(props.modelValue)
const isFocused = ref(false)
const isSearchTriggered = ref(false)

/** Видимые результаты (фильтрация по запросу) */
const visibleResults = computed((): SearchResult[] => {
	if (!query.value) return []
	const lowerQuery = query.value.toLowerCase()
	return props.results
		.filter(item => {
			const matchTitle = item.title.toLowerCase().includes(lowerQuery)
			const matchDesc = item.description?.toLowerCase().includes(lowerQuery) ?? false
			return matchTitle || matchDesc
		})
		.slice(0, props.maxResults)
})

/** Показывать ли результаты (учитывает isInstant) */
const shouldShowResults = computed((): boolean => {
	if (props.isInstant) return true
	return isSearchTriggered.value
})

/** Открыт ли выпадающий список (default mode) */
const isOpen = computed({
	get: (): boolean => {
		if (!isFocused.value || query.value.length === 0) return false
		return shouldShowResults.value
	},
	set: () => {
		isFocused.value = false
		resetHighlight()
	},
})

/** Таймер дебаунса поиска */
let searchTimeout: ReturnType<typeof setTimeout> | null = null

/** Отменить отложенный поиск */
function cancelPendingSearch(): void {
	if (searchTimeout) {
		clearTimeout(searchTimeout)
		searchTimeout = null
	}
}

/** Дебаунс поиска (реактивный delay) */
function debouncedSearch(value: string): void {
	cancelPendingSearch()
	searchTimeout = setTimeout(() => {
		if (value) emit('search', value)
	}, props.debounceMs)
}

/** Навигация по результатам клавишами */
const {
	highlightedIndex,
	handleKeydown: handleListKeydown,
	reset: resetHighlight,
} = useListNavigation({
	itemCount: () => visibleResults.value.length,
	onSelect: index => handleSelect(visibleResults.value[index]),
	onEscape: () => {
		if (props.mode === 'modal' || props.mode === 'sidebar') overlayRef.value?.close()
	},
})

/** Обработка закрытия dropdown */
function handleClose(): void {
	isFocused.value = false
	resetHighlight()
}

/** Обработка ввода */
function handleInput(value: string): void {
	query.value = value
	emit('update:modelValue', value)
	isSearchTriggered.value = false
	if (props.isInstant) {
		debouncedSearch(value)
	}
}

/** Обработка фокуса */
function handleFocus(): void {
	isFocused.value = true
}

/** Обработка потери фокуса */
function handleBlur(): void {
	isFocused.value = false
	resetHighlight()
}

/** Обработка клавиш */
function handleKeydown(e: KeyboardEvent): void {
	if (e.key === 'Enter' && highlightedIndex.value < 0 && query.value) {
		e.preventDefault()
		cancelPendingSearch()
		isSearchTriggered.value = true
		emit('search', query.value)
		return
	}
	handleListKeydown(e)
}

/** Очистить поле */
function handleClear(): void {
	cancelPendingSearch()
	query.value = ''
	emit('update:modelValue', '')
	emit('clear')
	focusActiveInput()
}

/** Выбрать результат */
function handleSelect(item: SearchResult): void {
	cancelPendingSearch()
	query.value = item.title
	emit('select', item)
	emit('update:modelValue', item.title)
	isFocused.value = false
	if (props.mode === 'modal' || props.mode === 'sidebar') overlayRef.value?.close()
}

/** Обработка закрытия overlay (modal/sidebar) */
function handleOverlayClose(): void {
	resetHighlight()
}

/** Фокус на активный инпут */
function focusActiveInput(): void {
	if (props.mode === 'modal' || props.mode === 'sidebar') overlayRef.value?.focus()
	else baseInputRef.value?.focus()
}

/** Автофокус при монтировании (только default mode) */
onMounted(() => {
	if (props.isAutofocus && props.mode === 'default') {
		nextTick(() => {
			baseInputRef.value?.focus()
		})
	}
})

/** Очистка таймера при размонтировании */
onBeforeUnmount(() => {
	cancelPendingSearch()
})

watch(
	() => props.modelValue,
	newValue => {
		if (newValue !== query.value) query.value = newValue
	},
)
</script>
