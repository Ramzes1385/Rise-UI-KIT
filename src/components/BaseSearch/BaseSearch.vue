<template>
	<!-- Режим: модальное окно -->
	<template v-if="mode === 'modal'">
		<div
			class="base-search"
			:class="[variantClass, { 'base-search--disabled': isDisabled }, classes.root]"
			:style="[sizeScaleStyle, variantStyle, customColorStyle]">
			<BaseInput
				:model-value="query"
				:placeholder="placeholder"
				:variant="variant"
				:size-scale="sizeScale"
				:is-disabled="isDisabled"
				:error="error"
				class="base-search__trigger"
				:custom-class="classes.trigger"
				readonly
				type="text"
				@focus="openModal">
				<template #prefix>
					<BaseIcon
						v-if="hasIcon"
						name="search"
						class="base-search__icon"
						:custom-class="classes.icon"
						:size-scale="calcIconScale('sm', sizeScale)" />
				</template>
			</BaseInput>
		</div>
		<Teleport to="body">
			<Transition name="base-search-modal">
				<div
					v-if="isModalOpen"
					class="base-search__modal-overlay"
					:class="classes.modalOverlay"
					@click.self="closeModal">
					<div class="base-search__modal" :class="classes.modal" :style="sizeScaleStyle">
						<div class="base-search__modal-header" :class="classes.modalHeader">
						<BaseSearchInput
							ref="modalInputRef"
							:model-value="query"
							:placeholder="placeholder"
							:variant="variant"
							:size-scale="sizeScale"
							:is-disabled="isDisabled"
							:error="error"
							:has-icon="hasIcon"
							:has-clear="hasClear"
							:is-loading="isLoading"
							:input-class="classes.modalInput"
							:classes="classes"
								@update:model-value="handleInput"
								@keydown="handleKeydown"
								@clear="handleClear" />
							<BaseButton
								variant="ghost"
								class="base-search__modal-close"
								:custom-class="classes.modalClose"
								:size-scale="sizeScale"
								@click="closeModal">
								<BaseIcon
									name="close"
									:custom-class="classes.modalCloseIcon"
									:size-scale="calcIconScale('sm', sizeScale)" />
							</BaseButton>
						</div>
						<div v-if="shouldShowResults && query" class="base-search__modal-results" :class="classes.modalResults">
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
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>
	</template>

	<!-- Режим: боковая панель -->
	<template v-else-if="mode === 'sidebar'">
		<div
			class="base-search"
			:class="[variantClass, { 'base-search--disabled': isDisabled }, classes.root]"
			:style="[sizeScaleStyle, variantStyle, customColorStyle]">
			<BaseInput
				:model-value="query"
				:placeholder="placeholder"
				:variant="variant"
				:size-scale="sizeScale"
				:is-disabled="isDisabled"
				:error="error"
				class="base-search__trigger"
				:custom-class="classes.trigger"
				readonly
				type="text"
				@focus="openSidebar">
				<template #prefix>
					<BaseIcon
						v-if="hasIcon"
						name="search"
						class="base-search__icon"
						:custom-class="classes.icon"
						:size-scale="calcIconScale('sm', sizeScale)" />
				</template>
			</BaseInput>
		</div>
		<Teleport to="body">
			<Transition name="base-search-sidebar">
				<div
					v-if="isSidebarOpen"
					class="base-search__sidebar-overlay"
					:class="classes.sidebarOverlay"
					@click.self="closeSidebar">
					<div class="base-search__sidebar" :class="classes.sidebar" :style="sizeScaleStyle">
						<div class="base-search__sidebar-header" :class="classes.sidebarHeader">
						<BaseSearchInput
							ref="sidebarInputRef"
							:model-value="query"
							:placeholder="placeholder"
							:variant="variant"
							:size-scale="sizeScale"
							:is-disabled="isDisabled"
							:error="error"
							:has-icon="hasIcon"
							:has-clear="hasClear"
							:is-loading="isLoading"
							:input-class="classes.sidebarInput"
							:classes="classes"
								@update:model-value="handleInput"
								@keydown="handleKeydown"
								@clear="handleClear" />
							<BaseButton
								variant="ghost"
								class="base-search__sidebar-close"
								:custom-class="classes.sidebarClose"
								:size-scale="sizeScale"
								@click="closeSidebar">
								<BaseIcon
									name="close"
									:custom-class="classes.sidebarCloseIcon"
									:size-scale="calcIconScale('sm', sizeScale)" />
							</BaseButton>
						</div>
						<div v-if="shouldShowResults && query" class="base-search__sidebar-results" :class="classes.sidebarResults">
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
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>
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
				:placeholder="placeholder"
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
import { calcIconScale } from '@components/BaseIcon'
import type { BaseSearchEmits, BaseSearchProps, SearchResult } from './BaseSearch.types'

import { BaseButton } from '@components/BaseButton'
import { BaseDropdown } from '@components/BaseDropdown'
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useEscapeKey } from '@composables/useEscapeKey'
import { useListNavigation } from '@composables/useListNavigation'
import { useScrollLock } from '@composables/useScrollLock'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { PropType } from 'vue'
import './BaseSearch.style.scss'
import BaseSearchInput from './ui/BaseSearchInput.vue'
import BaseSearchResults from './ui/BaseSearchResults.vue'

const props = defineProps({
	modelValue: { type: String, default: '' },
	placeholder: { type: String, default: 'Поиск...' },
	sizeScale: { type: Number, default: 100 },
	variant: { type: String as PropType<BaseSearchProps['variant']>, default: 'default' },
	color: Object as PropType<BaseSearchProps['color']>,
	mode: { type: String as PropType<BaseSearchProps['mode']>, default: 'default' },
	results: { type: Array as PropType<BaseSearchProps['results']>, default: () => [] },
	isInstant: { type: Boolean, default: true },
	debounceMs: { type: Number, default: 300 },
	isLoading: { type: Boolean, default: false },
	hasClear: { type: Boolean, default: true },
	hasIcon: { type: Boolean, default: true },
	maxResults: { type: Number, default: 10 },
	isAutofocus: { type: Boolean, default: false },
	isDisabled: { type: Boolean, default: false },
	error: { type: String, default: '' },
	customClass: [String, Object] as PropType<BaseSearchProps['customClass']>,
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
const modalInputRef = ref<InstanceType<typeof BaseSearchInput> | null>(null)
const sidebarInputRef = ref<InstanceType<typeof BaseSearchInput> | null>(null)
const query = ref(props.modelValue)
const isFocused = ref(false)
const isSearchTriggered = ref(false)
const isModalOpen = ref(false)
const isSidebarOpen = ref(false)

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
		if (props.mode === 'modal') closeModal()
		else if (props.mode === 'sidebar') closeSidebar()
	},
})

/** Блокировка скролла для modal/sidebar */
const { lock: lockScroll, unlock: unlockScroll } = useScrollLock()

/** Закрытие по Escape для modal/sidebar */
useEscapeKey({
	isActive: () => isModalOpen.value || isSidebarOpen.value,
	callback: () => {
		if (isModalOpen.value) closeModal()
		if (isSidebarOpen.value) closeSidebar()
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
	if (props.mode === 'modal') closeModal()
	else if (props.mode === 'sidebar') closeSidebar()
}

/** Открыть модальное окно */
function openModal(): void {
	if (props.isDisabled) return
	isModalOpen.value = true
	lockScroll()
	nextTick(() => {
		modalInputRef.value?.focus()
	})
}

/** Закрыть модальное окно */
function closeModal(): void {
	isModalOpen.value = false
	unlockScroll()
	resetHighlight()
}

/** Открыть боковую панель */
function openSidebar(): void {
	if (props.isDisabled) return
	isSidebarOpen.value = true
	lockScroll()
	nextTick(() => {
		sidebarInputRef.value?.focus()
	})
}

/** Закрыть боковую панель */
function closeSidebar(): void {
	isSidebarOpen.value = false
	unlockScroll()
	resetHighlight()
}

/** Фокус на активный инпут */
function focusActiveInput(): void {
	if (props.mode === 'modal') modalInputRef.value?.focus()
	else if (props.mode === 'sidebar') sidebarInputRef.value?.focus()
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
	val => {
		if (val !== query.value) query.value = val
	},
)
</script>
