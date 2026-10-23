<template>
	<thead :class="[ui('thead'), theadClass]">
		<tr :class="trClass" :aria-rowindex="isVirtual ? 1 : undefined">
			<th v-if="isSelectable" :class="[ui('th'), 'base-table__th--check', thClass]">
				<BaseCheckbox
					:model-value="isAllSelected"
					:is-indeterminate="isSomeSelected"
					:is-disabled="isSelectAllDisabled"
					:aria-label="TABLE_TEXT.SELECT_ALL"
					:size-scale="sizeScale"
					@update:model-value="emit('toggle-all')" />
			</th>
			<th v-if="hasRowNumber" :class="[ui('th'), 'base-table__th--number', thClass]">#</th>
			<th v-if="hasExpandableRows" :class="[ui('th'), 'base-table__th--expand', thClass]">
				<span class="base-table__visually-hidden">{{ UI_TEXT.EXPAND }}</span>
			</th>
			<th
				v-for="column in columns"
				:key="column.key"
				:class="[
					ui('th'),
					`base-table__th--${column.align || 'left'}`,
					{
						'base-table__th--sortable': column.isSortable,
						'base-table__th--sorted': getSortDirection(column.key),
						'base-table__th--resizable': isColumnResizable(column),
					},
					column.isSticky ? `base-table__th--sticky-${column.isSticky}` : '',
					thClass,
				]"
				:style="getColumnStyle(column)"
				:aria-sort="getAriaSort(column)"
				:aria-label="isColumnResizable(column) ? column.label : undefined"
				@click="emit('sort', column)">
				<template v-if="column.isSortable">
					<button
						type="button"
						:class="ui('sort-btn')"
						:aria-describedby="getSortPriority(column) ? `${idPrefix}-${column.key}-priority` : undefined">
						<TableSlot
							:render="getSlot(`header-${column.key}`)"
							:args="{ column, sortDirection: getSortDirection(column.key) }">
							<span class="base-table__th-label">{{ column.label }}</span>
						</TableSlot>
						<span class="base-table__sort-icon" aria-hidden="true">
							<BaseIcon :name="getSortIcon(column)" :size-scale="calcIconScale('sm', sizeScale)" />
							<span v-if="getSortPriority(column)" class="base-table__sort-index">{{ getSortPriority(column) }}</span>
						</span>
					</button>
					<span v-if="getSortPriority(column)" :id="`${idPrefix}-${column.key}-priority`" hidden>
						{{ TABLE_TEXT.SORT_PRIORITY }}: {{ getSortPriority(column) }}
					</span>
				</template>
				<TableSlot v-else :render="getSlot(`header-${column.key}`)" :args="{ column, sortDirection: null }">
					<span class="base-table__th-label">{{ column.label }}</span>
				</TableSlot>
				<BaseTableResizeHandle
					v-if="isColumnResizable(column)"
					:column="column"
					@resize-start="event => emit('resize-start', event, column)"
					@resize-by="(handle, delta) => emit('resize-by', handle, column, delta)" />
			</th>
		</tr>
	</thead>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { TableSlot } from '../../model/TableSlot'
import { calcIconScale } from '@utils/media/iconUtils'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { TABLE_TEXT, UI_TEXT } from '@/locales/messages'
import BaseTableResizeHandle from './BaseTableResizeHandle.vue'
import { useBaseTableHeader } from '../../model/header/useBaseTableHeader'
import type { BaseTableHeaderEmits, BaseTableHeaderProps } from '../../types/header/BaseTableHeader.types'

const props = defineProps<BaseTableHeaderProps>()

const emit = defineEmits<BaseTableHeaderEmits>()

const { ui, idPrefix, getSlot, getAriaSort, getSortIcon, getSortPriority } = useBaseTableHeader(props)
</script>
