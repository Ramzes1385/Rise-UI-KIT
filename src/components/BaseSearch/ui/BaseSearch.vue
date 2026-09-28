<template>
	<!-- Режим: модальное окно / боковая панель -->
	<template v-if="mode === 'modal' || mode === 'sidebar'">
		<BaseSearchOverlay
			ref="overlayRef"
			:panel="mode"
			:model-value="query"
			:search-placeholder="resolvedPlaceholder"
			:trigger-placeholder="resolvedPlaceholder"
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
			:listbox-id="listboxId"
			:combobox-attributes="comboboxAttributes"
			:results-status="resultsStatus"
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
		ref="rootRef"
		class="base-search"
		:class="[variantClass, { 'base-search--disabled': isDisabled, 'base-search--loading': isLoading }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<BaseDropdown
			v-model:is-open="isOpen"
			position="bottom-start"
			:match-width="true"
			:prevent-mousedown="false"
			:size-scale="sizeScale"
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
				:combobox-attributes="comboboxAttributes"
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
					:listbox-id="listboxId"
					:listbox-label="resolvedPlaceholder"
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
		<!-- Статус для скринридера: число результатов или «Ничего не найдено» -->
		<span class="base-search__live" role="status">{{ resultsStatus }}</span>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import { getLocale, pluralize } from '@/locales/state'
import { kitDefaults } from '@composables/useDefaults'
import { BaseDropdown } from '@components/BaseDropdown'
import { useFormField } from '@composables/useFormField'
import { useSearchState } from '@composables/useSearchState'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import BaseSearchInput from './BaseSearchInput.vue'
import '../styles/BaseSearch.style.scss'
import BaseSearchOverlay from './BaseSearchOverlay.vue'
import BaseSearchResults from './BaseSearchResults.vue'
import { getSearchOptionId } from '../model/BaseSearch.types'
import type { BaseSearchEmits, BaseSearchProps, BaseSearchSlots } from '../model/BaseSearch.types'

const props = withDefaults(
	defineProps<BaseSearchProps>(),
	kitDefaults('BaseSearch', {
		modelValue: '',
		sizeScale: SIZE_SCALE_DEFAULT,
		variant: DEFAULT_VARIANT,
		mode: 'default',
		results: () => [],
		isRemote: false,
		isInstant: true,
		debounceMs: 300,
		isLoading: false,
		hasClear: true,
		hasIcon: true,
		maxResults: 10,
		isAutofocus: false,
		isDisabled: false,
		error: '',
	}),
)

const emit = defineEmits<BaseSearchEmits>()
defineSlots<BaseSearchSlots>()

const rootRef = ref<HTMLElement | null>(null)

const formField = useFormField({
	value: () => props.modelValue,
	error: () => props.error,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-search', props, [
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
])

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
	isRemote: () => props.isRemote,
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

const listboxId = `rise-search-${useId()}-listbox`

/** Список результатов на экране: в режиме по умолчанию — открытая панель, в окне и панели — блок результатов */
const hasListbox = computed((): boolean => {
	const isShown = props.mode === 'modal' || props.mode === 'sidebar' ? shouldShowResults.value && Boolean(query.value) : isOpen.value
	return isShown && visibleResults.value.length > 0
})

/** Поле — combobox по APG «combobox with listbox popup»: фокус в поле, подсвеченный результат — aria-activedescendant */
const comboboxAttributes = computed(() => ({
	role: 'combobox',
	'aria-autocomplete': 'list',
	'aria-expanded': hasListbox.value ? 'true' : 'false',
	'aria-controls': hasListbox.value ? listboxId : undefined,
	'aria-activedescendant':
		hasListbox.value && highlightedIndex.value >= 0 ? getSearchOptionId(listboxId, highlightedIndex.value) : undefined,
}))

/** Статус для скринридера: сколько найдено по запросу; пока идёт загрузка — пусто */
const resultsStatus = computed((): string => {
	if (!query.value || props.isLoading) return ''
	const count = visibleResults.value.length
	return count ? pluralize(getLocale().plural.SEARCH_RESULTS, count) : UI_TEXT.NO_RESULTS
})

defineExpose({
	rootRef,
	focus: focusActiveInput,
	blur: () => {
		if (props.mode === 'modal' || props.mode === 'sidebar') {
			if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur()
			}
		} else {
			rootRef.value?.querySelector<HTMLElement>('.base-input')?.blur()
		}
	},
	validate: formField.validate,
	reset: formField.reset,
})
</script>
