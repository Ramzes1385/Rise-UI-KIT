<template>
	<thead :class="theadClass">
		<tr :class="trClass">
			<th v-if="isSelectable" class="base-table__th base-table__th--check" :class="thClass">
				<BaseCheckbox :model-value="isAllSelected" :size-scale="sizeScale" @update:model-value="emit('toggle-all')" />
			</th>
			<th v-if="hasRowNumber" class="base-table__th base-table__th--number" :class="thClass">#</th>
			<th v-if="hasExpandableRows" class="base-table__th base-table__th--expand" :class="thClass"></th>
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
				@click="emit('sort', column)">
				<slot :name="`header-${column.key}`" :column="column">
					<div class="base-table__th-content">
						<BaseTooltip v-if="column.isSortable" :text="UI_SORT_ARIA" position="top" :size-scale="sizeScale">
							<BaseText tag="span" class="base-table__th-label">{{ column.label }}</BaseText>
						</BaseTooltip>
						<BaseText v-else tag="span" class="base-table__th-label">{{ column.label }}</BaseText>
						<span v-if="column.isSortable" class="base-table__sort-icon">
							<BaseIcon
								v-if="getSortDirection(column.key) === 'asc'"
								name="chevron-up"
								:size-scale="calcIconScale('xs', sizeScale)" />
							<BaseIcon
								v-else-if="getSortDirection(column.key) === 'desc'"
								name="chevron-down"
								:size-scale="calcIconScale('xs', sizeScale)" />
							<BaseIcon v-else name="sort" :size-scale="calcIconScale('xs', sizeScale)" />
							<span v-if="isMultiSort && getSortIndex(column.key) > 0" class="base-table__sort-index">
								{{ getSortIndex(column.key) }}
							</span>
						</span>
					</div>
				</slot>
				<BaseTableResizeHandle
					v-if="isColumnResizable(column)"
					@resize-start="event => emit('resize-start', event, column)" />
			</th>
		</tr>
	</thead>
</template>

<script setup lang="ts">
import { BaseCheckbox } from '@components/BaseCheckbox'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { BaseTooltip } from '@components/BaseTooltip'
import { UI_SORT_ARIA } from '@constants'
import BaseTableResizeHandle from './BaseTableResizeHandle.vue'
import type { BaseTableHeaderEmits, BaseTableHeaderProps } from '../model/BaseTableHeader.types'

defineProps<BaseTableHeaderProps>()

const emit = defineEmits<BaseTableHeaderEmits>()
</script>
