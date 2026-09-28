<template>
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
import { kitDefaults } from '@composables/useDefaults'
import { BaseDropdown } from '@components/BaseDropdown'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import BaseSearchInput from './BaseSearchInput.vue'
import '../styles/BaseSearch.style.scss'
import { useBaseSearch } from '../model/useBaseSearch'
import BaseSearchOverlay from './BaseSearchOverlay.vue'
import BaseSearchResults from './BaseSearchResults.vue'
import type { BaseSearchEmits, BaseSearchProps, BaseSearchSlots } from '../types/BaseSearch.types'

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

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	rootRef,
	baseInputRef,
	overlayRef,
	resolvedPlaceholder,
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
	listboxId,
	comboboxAttributes,
	resultsStatus,
	exposed,
} = useBaseSearch(props, emit)

defineExpose(exposed)
</script>
