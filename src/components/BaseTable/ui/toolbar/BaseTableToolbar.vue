<template>
	<div
		v-if="showToolbar"
		ref="toolbarRef"
		:class="[ui('toolbar'), toolbarClass]"
		role="toolbar"
		aria-orientation="horizontal"
		:aria-label="TABLE_TEXT.TOOLBAR"
		@keydown="handleKeydown"
		@focusin="handleFocusin">
		<slot name="toolbar-prepend"></slot>

		<div v-if="hasSearch" :class="[ui('search'), searchClass]">
			<BaseInput
				:model-value="searchQuery"
				:label="TABLE_TEXT.SEARCH_LABEL"
				:placeholder="UI_TEXT.SEARCH_PLACEHOLDER"
				:custom-class="hiddenLabel"
				:size-scale="sizeScale"
				@update:model-value="emit('search-input', $event)">
				<template #prefix>
					<span class="base-table__search-icon" aria-hidden="true">
						<BaseIcon name="search" :size-scale="calcIconScale('sm', sizeScale)" />
					</span>
				</template>
			</BaseInput>
		</div>

		<div v-if="hasFilters" role="group" :aria-label="TABLE_TEXT.FILTER_GROUP" :class="[ui('filters'), filtersClass]">
			<BaseSelect
				class="base-table__filter-field"
				:model-value="filterColumn"
				:options="filterColumnOptions"
				:placeholder="UI_FILTER.COLUMN"
				:aria-label="TABLE_TEXT.FILTER_COLUMN_LABEL"
				:size-scale="sizeScale"
				@update:model-value="emit('update:filter-column', $event)" />
			<BaseSelect
				class="base-table__filter-field base-table__filter-field--operator"
				:model-value="filterOperator"
				:options="filterOperatorOptions"
				:placeholder="UI_FILTER.CONDITION"
				:aria-label="TABLE_TEXT.FILTER_OPERATOR_LABEL"
				:size-scale="sizeScale"
				@update:model-value="emit('update:filter-operator', $event)" />
			<BaseSelect
				v-if="filterKind === 'select'"
				class="base-table__filter-field base-table__filter-field--value"
				:model-value="filterValue"
				:options="filterSelectOptions"
				:placeholder="filterPlaceholder ?? UI_FILTER.CHOOSE"
				:aria-label="TABLE_TEXT.FILTER_VALUE_LABEL"
				:size-scale="sizeScale"
				@update:model-value="setSingleValue" />
			<BaseSelect
				v-else-if="filterKind === 'multi-select'"
				class="base-table__filter-field base-table__filter-field--value"
				is-multiple
				:model-value="filterValues"
				:options="filterSelectOptions"
				:placeholder="filterPlaceholder ?? UI_FILTER.CHOOSE"
				:aria-label="TABLE_TEXT.FILTER_VALUE_LABEL"
				:size-scale="sizeScale"
				@update:model-value="setValues" />
			<template v-else-if="filterKind === 'date'">
				<BaseDatePicker
					class="base-table__filter-field base-table__filter-field--value"
					:model-value="toDate(filterValue)"
					:label="isRangeOperator ? TABLE_TEXT.FILTER_VALUE_FROM_LABEL : TABLE_TEXT.FILTER_VALUE_LABEL"
					:placeholder="filterPlaceholder ?? UI_FILTER.VALUE_PLACEHOLDER"
					is-clearable
					:ui="hiddenLabel"
					:size-scale="sizeScale"
					@update:model-value="setDateValue" />
				<BaseDatePicker
					v-if="isRangeOperator"
					class="base-table__filter-field base-table__filter-field--value"
					:model-value="toDate(filterValueTo)"
					:label="TABLE_TEXT.FILTER_VALUE_TO_LABEL"
					:placeholder="filterPlaceholder ?? UI_FILTER.VALUE_PLACEHOLDER"
					is-clearable
					:ui="hiddenLabel"
					:size-scale="sizeScale"
					@update:model-value="setDateValueTo" />
			</template>
			<template v-else>
				<BaseInput
					class="base-table__filter-field base-table__filter-field--value"
					:type="filterKind === 'number' ? 'number' : 'text'"
					:model-value="filterValue"
					:label="isRangeOperator ? TABLE_TEXT.FILTER_VALUE_FROM_LABEL : TABLE_TEXT.FILTER_VALUE_LABEL"
					:placeholder="filterPlaceholder ?? UI_FILTER.VALUE_PLACEHOLDER"
					:custom-class="hiddenLabel"
					:size-scale="sizeScale"
					@update:model-value="emit('update:filter-value', $event)"
					@keydown="handleFilterEnter" />
				<BaseInput
					v-if="isRangeOperator"
					class="base-table__filter-field base-table__filter-field--value"
					:type="filterKind === 'number' ? 'number' : 'text'"
					:model-value="filterValueTo"
					:label="TABLE_TEXT.FILTER_VALUE_TO_LABEL"
					:placeholder="filterPlaceholder ?? UI_FILTER.VALUE_PLACEHOLDER"
					:custom-class="hiddenLabel"
					:size-scale="sizeScale"
					@update:model-value="emit('update:filter-value-to', $event)"
					@keydown="handleFilterEnter" />
			</template>
			<BaseButton
				variant="outline"
				class="base-table__filter-add-btn"
				is-focusable-when-disabled
				:is-disabled="!canAddFilter"
				:size-scale="sizeScale"
				@click="emit('add-filter')">
				<template #left><BaseIcon name="plus" :size-scale="calcIconScale('sm', sizeScale)" /></template>
				{{ TABLE_TEXT.ADD_FILTER }}
			</BaseButton>
		</div>

		<div v-if="hasColumnSettings" :class="[ui('settings'), settingsClass]">
			<BaseDropdownMenu
				:is-open="isSettingsOpen"
				:items="columnItems"
				:aria-label="TABLE_TEXT.COLUMNS_MENU"
				position="bottom-end"
				:size-scale="sizeScale"
				:custom-class="{ panel: 'base-table__settings-panel' }"
				@update:is-open="emit('update:is-settings-open', $event)">
				<BaseButton variant="outline" class="base-table__settings-btn" :size-scale="sizeScale">
					{{ TABLE_TEXT.COLUMNS }}
					<template #right>
						<BaseIcon name="chevron-down" :size-scale="calcIconScale('sm', sizeScale)" :rotate="isSettingsOpen ? 180 : 0" />
					</template>
				</BaseButton>
			</BaseDropdownMenu>
		</div>

		<div v-if="exportItems.length" :class="[ui('export'), exportClass]">
			<BaseDropdownMenu
				:is-open="isExportOpen"
				:items="exportItems"
				position="bottom-end"
				:size-scale="sizeScale"
				@update:is-open="emit('update:is-export-open', $event)">
				<BaseButton variant="outline" class="base-table__export-btn" :size-scale="sizeScale">
					<template #left><BaseIcon name="download" :size-scale="calcIconScale('sm', sizeScale)" /></template>
					{{ TABLE_EXPORT_TEXT.BUTTON }}
					<template #right>
						<BaseIcon name="chevron-down" :size-scale="calcIconScale('sm', sizeScale)" :rotate="isExportOpen ? 180 : 0" />
					</template>
				</BaseButton>
			</BaseDropdownMenu>
		</div>

		<div
			v-if="activeFilters.length"
			role="group"
			:aria-label="TABLE_TEXT.ACTIVE_FILTERS"
			:class="[ui('active-filters'), activeFiltersClass]">
			<BaseBadge
				v-for="(filter, index) in activeFilters"
				:key="index"
				variant="outline"
				class="base-table__filter-tag"
				:label="getFilterLabel(filter)"
				:ui="{ remove: 'base-table__filter-remove' }"
				is-removable
				:remove-label="`${TABLE_TEXT.REMOVE_FILTER}: ${getFilterLabel(filter)}`"
				:size-scale="sizeScale"
				@keydown.delete.prevent="removeFilter(index)"
				@remove="removeFilter(index)" />
		</div>

		<slot name="toolbar-append"></slot>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseBadge } from '@components/BaseBadge'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { BaseSelect } from '@components/BaseSelect'
import { calcIconScale } from '@utils/media/iconUtils'
import { BaseDatePicker } from '@components/BaseDatePicker'
import { BaseDropdownMenu } from '@components/BaseDropdownMenu'
import { useBaseTableToolbar } from '../../model/useBaseTableToolbar'
import { TABLE_EXPORT_TEXT, TABLE_TEXT, UI_FILTER, UI_TEXT } from '@/locales/messages'
import type { BaseTableToolbarEmits, BaseTableToolbarProps, BaseTableToolbarSlots } from '../../types/toolbar/BaseTableToolbar.types'

const props = defineProps<BaseTableToolbarProps>()

const emit = defineEmits<BaseTableToolbarEmits>()

defineSlots<BaseTableToolbarSlots>()

const {
	ui,
	hiddenLabel,
	columnItems,
	toolbarRef,
	handleKeydown,
	handleFocusin,
	handleFilterEnter,
	removeFilter,
	toDate,
	setDateValue,
	setDateValueTo,
	setValues,
	setSingleValue,
} = useBaseTableToolbar(props, emit)
</script>
