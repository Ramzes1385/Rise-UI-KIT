<template>
	<div v-if="showToolbar" class="base-table__toolbar" :class="toolbarClass">
		<slot name="toolbar-prepend"></slot>

		<div v-if="hasSearch" class="base-table__search" :class="searchClass">
			<BaseInput
				:model-value="searchQuery"
				:label="TABLE_TEXT.SEARCH_LABEL"
				:placeholder="UI_TEXT.SEARCH_PLACEHOLDER"
				:custom-class="HIDDEN_LABEL"
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
				:custom-class="HIDDEN_LABEL"
				:size-scale="sizeScale"
				@update:model-value="emit('update:filter-value', $event)"
				@keydown.enter="emit('add-filter')" />
			<BaseButton variant="outline" class="base-table__filter-add-btn" :size-scale="sizeScale" @click="emit('add-filter')">
				<template #left><BaseIcon name="plus" :size-scale="calcIconScale('sm', sizeScale)" /></template>
				{{ TABLE_TEXT.ADD_FILTER }}
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
					variant="outline"
					class="base-table__settings-btn"
					:aria-expanded="isSettingsOpen ? 'true' : 'false'"
					:size-scale="sizeScale"
					@click="emit('toggle-settings')">
					{{ TABLE_TEXT.COLUMNS }}
					<template #right>
						<BaseIcon name="chevron-down" :size-scale="calcIconScale('sm', sizeScale)" :rotate="isSettingsOpen ? 180 : 0" />
					</template>
				</BaseButton>
				<template #dropdown>
					<div ref="settingsListRef" class="base-table__settings-list" role="group" :aria-label="TABLE_TEXT.COLUMNS">
						<div v-for="column in columns" :key="column.key" class="base-table__settings-item">
							<BaseCheckbox
								:model-value="!column.isHidden"
								:label="column.label"
								:custom-class="SETTINGS_OPTION"
								:size-scale="sizeScale"
								@update:model-value="emit('toggle-column-visibility', column)" />
						</div>
					</div>
				</template>
			</BaseDropdown>
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
import { nextTick, ref, watch } from 'vue'
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/iconUtils'
import { BaseBadge } from '@components/BaseBadge'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { BaseSelect } from '@components/BaseSelect'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { BaseDropdown } from '@components/BaseDropdown'
import { TABLE_TEXT, UI_FILTER, UI_TEXT } from '@/locales/messages'
import type { BaseTableToolbarEmits, BaseTableToolbarProps, BaseTableToolbarSlots } from '../types/BaseTableToolbar.types'

const props = defineProps<BaseTableToolbarProps>()

const emit = defineEmits<BaseTableToolbarEmits>()

defineSlots<BaseTableToolbarSlots>()

/** Подписи полей поиска и значения фильтра скрыты визуально: поле называет плейсхолдер, скринридер — подпись */
const HIDDEN_LABEL = { label: 'base-table__visually-hidden' }

/** Строка чекбокса в панели колонок — пункт меню на всю ширину панели: кликабельна вся строка */
const SETTINGS_OPTION = { labelWrapper: 'base-table__settings-option' }

const settingsListRef = ref<HTMLElement | null>(null)

/**
 * Панель колонок телепортирована в конец body и не попадает в порядок Tab после кнопки. Поэтому при открытии фокус
 * переходит на первый чекбокс панели; Escape закрывает панель, и BaseDropdown возвращает фокус на кнопку «Колонки».
 */
watch(
	() => props.isSettingsOpen,
	async isOpen => {
		if (!isOpen) return
		await nextTick()
		settingsListRef.value?.querySelector<HTMLInputElement>('input')?.focus()
	},
)
</script>
