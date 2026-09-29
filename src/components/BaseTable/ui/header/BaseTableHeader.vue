<template>
	<thead class="base-table__thead" :class="theadClass">
		<tr :class="trClass" :aria-rowindex="isVirtual ? 1 : undefined">
			<th v-if="isSelectable" class="base-table__th base-table__th--check" :class="thClass">
				<BaseCheckbox
					:model-value="isAllSelected"
					:label="TABLE_TEXT.SELECT_ALL"
					:custom-class="hiddenCheckboxLabel"
					:size-scale="sizeScale"
					@update:model-value="emit('toggle-all')" />
			</th>
			<th v-if="hasRowNumber" class="base-table__th base-table__th--number" :class="thClass">#</th>
			<th v-if="hasExpandableRows" class="base-table__th base-table__th--expand" :class="thClass">
				<span class="base-table__visually-hidden">{{ UI_TEXT.EXPAND }}</span>
			</th>
			<th
				v-for="column in columns"
				:key="column.key"
				class="base-table__th"
				:class="[
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
				@click="emit('sort', column)">
				<slot :name="`header-${column.key}`" :column="column">
					<template v-if="column.isSortable">
						<button
							type="button"
							class="base-table__sort-btn"
							:aria-describedby="getSortPriority(column) ? `${idPrefix}-${column.key}-priority` : undefined">
							<span class="base-table__th-label">{{ column.label }}</span>
							<span class="base-table__sort-icon" aria-hidden="true">
								<BaseIcon :name="getSortIcon(column)" :size-scale="calcIconScale('sm', sizeScale)" />
								<span v-if="getSortPriority(column)" class="base-table__sort-index">{{ getSortPriority(column) }}</span>
							</span>
						</button>
						<span v-if="getSortPriority(column)" :id="`${idPrefix}-${column.key}-priority`" hidden>
							{{ TABLE_TEXT.SORT_PRIORITY }}: {{ getSortPriority(column) }}
						</span>
					</template>
					<span v-else class="base-table__th-label">{{ column.label }}</span>
				</slot>
				<BaseTableResizeHandle v-if="isColumnResizable(column)" @resize-start="event => emit('resize-start', event, column)" />
			</th>
		</tr>
	</thead>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/media/iconUtils'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { TABLE_TEXT, UI_TEXT } from '@/locales/messages'
import BaseTableResizeHandle from './BaseTableResizeHandle.vue'
import { useBaseTableHeader } from '../../model/useBaseTableHeader'
import type { BaseTableHeaderEmits, BaseTableHeaderProps, BaseTableHeaderSlots } from '../../types/header/BaseTableHeader.types'

const props = defineProps<BaseTableHeaderProps>()

const emit = defineEmits<BaseTableHeaderEmits>()

defineSlots<BaseTableHeaderSlots>()

const { hiddenCheckboxLabel, idPrefix, getAriaSort, getSortIcon, getSortPriority } = useBaseTableHeader(props)
</script>
