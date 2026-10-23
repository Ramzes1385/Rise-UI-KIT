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
			:is-loading="isBusy"
			:empty-text="emptyText"
			:visible-results="visibleResults"
			:highlighted-index="highlightedIndex"
			:should-show-results="shouldShowResults"
			:classes="classes"
			:listbox-id="listboxId"
			:combobox-attributes="comboboxAttributes"
			:results-status="resultsStatus"
			:color="color"
			:custom-class="customClass"
			:ui="ui"
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
		:class="[ui('root'), variantClass, { 'base-search--disabled': isDisabled, 'base-search--loading': isBusy }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<BaseDropdown
			v-model:is-open="isOpen"
			position="bottom-start"
			:match-width="true"
			:prevent-mousedown="false"
			:size-scale="sizeScale"
			:custom-class="dropdownClass"
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
				:is-loading="isBusy"
				:classes="classes"
				:combobox-attributes="comboboxAttributes"
				:ui="ui"
				:class="ui('trigger')"
				@update:model-value="handleInput"
				@keydown="handleKeydown"
				@focus="handleFocus"
				@blur="handleBlur"
				@clear="handleClear" />

			<template #dropdown>
				<BaseSearchResults
					:visible-results="visibleResults"
					:query="query"
					:is-loading="isBusy"
					:empty-text="emptyText"
					:size-scale="sizeScale"
					:highlighted-index="highlightedIndex"
					:classes="classes"
					:listbox-id="listboxId"
					:listbox-label="resolvedPlaceholder"
					:ui="ui"
					:is-motion-reduced="isMotionReduced"
					:motion-attrs="motionAttrs"
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
		<span :class="ui('live')" role="status">{{ resultsStatus }}</span>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseSearch.style.scss'
import BaseSearchInput from './BaseSearchInput.vue'
import { useBaseSearch } from '../model/useBaseSearch'
import BaseSearchOverlay from './BaseSearchOverlay.vue'
import BaseSearchResults from './BaseSearchResults.vue'
import { BaseDropdown } from '@components/BaseDropdown'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
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
	ui,
	dropdownClass,
	isMotionReduced,
	motionAttrs,
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
	isBusy,
	emptyText,
	exposed,
} = useBaseSearch(props, emit)

defineExpose(exposed)
</script>
