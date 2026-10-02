<template>
	<div v-if="showToolbar" class="base-table__toolbar" :class="toolbarClass">
		<slot name="toolbar-prepend"></slot>

		<div v-if="hasSearch" class="base-table__search" :class="searchClass">
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

		<div v-if="hasFilters" class="base-table__filters" :class="filtersClass">
			<BaseSelect
				class="base-table__filter-field"
				:model-value="filterColumn"
				:options="filterColumnOptions"
				:placeholder="UI_FILTER.COLUMN"
				:size-scale="sizeScale"
				@update:model-value="emit('update:filter-column', $event)" />
			<BaseSelect
				class="base-table__filter-field base-table__filter-field--operator"
				:model-value="filterOperator"
				:options="filterOperatorOptions"
				:placeholder="UI_FILTER.CONDITION"
				:size-scale="sizeScale"
				@update:model-value="emit('update:filter-operator', $event)" />
			<BaseInput
				class="base-table__filter-field base-table__filter-field--value"
				:model-value="filterValue"
				:label="TABLE_TEXT.FILTER_VALUE_LABEL"
				:placeholder="UI_FILTER.VALUE_PLACEHOLDER"
				:custom-class="hiddenLabel"
				:size-scale="sizeScale"
				@update:model-value="emit('update:filter-value', $event)"
				@keydown.enter="emit('add-filter')" />
			<BaseButton variant="outline" class="base-table__filter-add-btn" :size-scale="sizeScale" @click="emit('add-filter')">
				<template #left><BaseIcon name="plus" :size-scale="calcIconScale('sm', sizeScale)" /></template>
				{{ TABLE_TEXT.ADD_FILTER }}
			</BaseButton>
		</div>

		<div v-if="hasColumnSettings" class="base-table__settings" :class="settingsClass">
			<BaseDropdownMenu
				:is-open="isSettingsOpen"
				:items="columnItems"
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

		<div v-if="activeFilters.length" class="base-table__active-filters" :class="activeFiltersClass">
			<BaseBadge
				v-for="(filter, index) in activeFilters"
				:key="index"
				variant="outline"
				class="base-table__filter-tag"
				:size-scale="sizeScale">
				<span class="base-table__filter-tag-text">{{ getFilterLabel(filter) }}</span>
				<button
					type="button"
					class="base-table__filter-remove"
					:aria-label="`${TABLE_TEXT.REMOVE_FILTER}: ${getFilterLabel(filter)}`"
					@click="emit('remove-filter', index)">
					<BaseIcon name="x-mark" :size-scale="calcIconScale('xs', sizeScale)" />
				</button>
			</BaseBadge>
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
import { BaseDropdownMenu } from '@components/BaseDropdownMenu'
import { TABLE_TEXT, UI_FILTER, UI_TEXT } from '@/locales/messages'
import { useBaseTableToolbar } from '../../model/useBaseTableToolbar'
import type { BaseTableToolbarEmits, BaseTableToolbarProps, BaseTableToolbarSlots } from '../../types/toolbar/BaseTableToolbar.types'

const props = defineProps<BaseTableToolbarProps>()

const emit = defineEmits<BaseTableToolbarEmits>()

defineSlots<BaseTableToolbarSlots>()

const { hiddenLabel, columnItems } = useBaseTableToolbar(props, emit)
</script>
