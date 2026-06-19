<template>
	<div v-if="showToolbar" class="base-table__toolbar" :class="toolbarClass">
		<slot name="toolbar-prepend"></slot>

		<div v-if="hasSearch" class="base-table__search" :class="searchClass">
			<BaseInput
				:model-value="searchQuery"
				:placeholder="UI_TEXT.SEARCH_PLACEHOLDER"
				:size-scale="sizeScale - 20"
				@update:model-value="emit('search-input', $event)" />
		</div>

		<div v-if="hasFilters" class="base-table__filters" :class="filtersClass">
			<BaseSelect
				:model-value="filterColumn"
				:options="filterColumnOptions"
				:placeholder="UI_FILTER.COLUMN"
				:size-scale="sizeScale - 20"
				@update:model-value="emit('update:filter-column', $event)" />
			<span class="base-table__filter-sep"></span>
			<BaseSelect
				:model-value="filterOperator"
				:options="filterOperatorOptions"
				:placeholder="UI_FILTER.CONDITION"
				:size-scale="sizeScale - 20"
				@update:model-value="emit('update:filter-operator', $event)" />
			<span class="base-table__filter-sep"></span>
			<BaseInput
				:model-value="filterValue"
				:placeholder="UI_FILTER.VALUE_PLACEHOLDER"
				:size-scale="sizeScale - 20"
				@update:model-value="emit('update:filter-value', $event)"
				@keydown.enter="emit('add-filter')" />
			<BaseButton variant="ghost" :size-scale="sizeScale - 10" class="base-table__filter-add-btn" @click="emit('add-filter')">
				<BaseIcon name="plus" :size-scale="sizeScale - 20" />
			</BaseButton>
		</div>

		<div v-if="hasColumnSettings" class="base-table__settings" :class="settingsClass">
			<BaseDropdown
				:is-open="isSettingsOpen"
				position="bottom-end"
				panel-class="base-table__settings-panel"
				:max-height="settingsMaxHeight"
				:size-scale="sizeScale"
				@update:is-open="emit('update:is-settings-open', $event)">
				<BaseButton
					variant="ghost"
					class="base-table__settings-btn"
					:size-scale="sizeScale - 10"
					@click="emit('toggle-settings')">
					<BaseIcon name="menu" :size-scale="calcIconScale('xs', sizeScale)" />
				</BaseButton>
				<template #dropdown>
					<div v-for="column in columns" :key="column.key" class="base-table__settings-item">
						<BaseCheckbox
							:model-value="!column.isHidden"
							:label="column.label"
							:size-scale="sizeScale - 20"
							@update:model-value="emit('toggle-column-visibility', column)" />
					</div>
				</template>
			</BaseDropdown>
		</div>

		<div v-if="activeFilters.length" class="base-table__active-filters" :class="activeFiltersClass">
			<BaseBadge
				v-for="(filter, index) in activeFilters"
				:key="index"
				variant="soft"
				:size-scale="sizeScale - 10"
				class="base-table__filter-tag"
				@click="emit('remove-filter', index)">
				{{ getFilterLabel(filter) }} ×
			</BaseBadge>
		</div>

		<slot name="toolbar-append"></slot>
	</div>
</template>

<script setup lang="ts">
import { BaseBadge } from '@components/BaseBadge'
import { BaseButton } from '@components/BaseButton'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { BaseDropdown } from '@components/BaseDropdown'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { BaseSelect } from '@components/BaseSelect'
import {
	UI_FILTER,
	UI_TEXT,
} from '@constants'
import type { BaseTableToolbarEmits, BaseTableToolbarProps } from '../model/BaseTableToolbar.types'

defineProps<BaseTableToolbarProps>()

const emit = defineEmits<BaseTableToolbarEmits>()
</script>
