<template>
	<tbody class="base-table__tbody" :class="tbodyClass">
		<template v-if="isLoading && !rows.length">
			<tr v-for="skeletonRow in skeletonRows" :key="skeletonRow" class="base-table__tr--skeleton" :class="trClass">
				<td v-if="isSelectable" class="base-table__td base-table__td--check" :class="tdClass">
					<span class="base-table__skeleton">
						<BaseSkeleton shape="rect" class="base-table__skeleton-box" />
					</span>
				</td>
				<td v-if="hasRowNumber" class="base-table__td base-table__td--number" :class="tdClass">
					<span class="base-table__skeleton">
						<BaseSkeleton shape="text" width="60%" />
					</span>
				</td>
				<td v-if="hasExpandableRows" class="base-table__td base-table__td--expand" :class="tdClass"></td>
				<td
					v-for="(column, columnIndex) in columns"
					:key="column.key"
					class="base-table__td"
					:class="[`base-table__td--${column.align || 'left'}`, tdClass]">
					<span class="base-table__skeleton">
						<BaseSkeleton shape="text" :width="getSkeletonWidth(skeletonRow, columnIndex)" />
					</span>
				</td>
			</tr>
		</template>

		<tr v-else-if="!isLoading && rows.length === 0" :class="trClass">
			<td :colspan="totalColumns" class="base-table__td base-table__td--empty" :class="tdClass">
				<slot name="empty" :is-filtered="isFiltered">
					<BaseEmpty variant="ghost" :title="emptyText" :custom-class="emptyClasses" :size-scale="sizeScale" />
				</slot>
			</td>
		</tr>

		<template v-else>
			<tr v-if="isVirtual" class="base-table__spacer" aria-hidden="true">
				<td :colspan="totalColumns" class="base-table__spacer-cell" :style="{ height: `${paddingStart}px` }"></td>
			</tr>
			<template v-for="(row, index) in rows" :key="row.id">
				<BaseTableRow
					:row="row"
					:columns="columns"
					:row-index="indexOffset + index"
					:row-number="getRowNumber(indexOffset + index)"
					:data-virtual-index="isVirtual ? indexOffset + index : undefined"
					:aria-rowindex="isVirtual ? indexOffset + index + 2 : undefined"
					:is-selectable="isSelectable"
					:has-row-number="hasRowNumber"
					:has-expandable-rows="hasExpandableRows"
					:is-selected="isSelected(row)"
					:is-expanded="isExpanded(row)"
					:size-scale="sizeScale"
					:tr-class="trClass"
					:td-class="tdClass"
					:get-column-style="getColumnStyle"
					:format-cell-value="formatCellValue"
					:is-interactive="isRowInteractive"
					:tab-index="getRowTabIndex(row)"
					@row-click="emit('row-click', $event)"
					@row-focus="setActiveRow"
					@toggle-row="emit('toggle-row', $event)"
					@toggle-expand="emit('toggle-expand', $event)">
					<template v-for="column in columns" #[`cell-${column.key}`]="slotProps" :key="column.key">
						<slot v-if="$slots[`cell-${column.key}`]" :name="`cell-${column.key}`" v-bind="slotProps"></slot>
					</template>
				</BaseTableRow>

				<BaseTableNestedRow
					:row="row"
					:columns="columns"
					:nested-config="nestedConfig"
					:total-columns="totalColumns"
					:size-scale="sizeScale"
					:is-selectable="isSelectable"
					:has-row-number="hasRowNumber"
					:tr-class="trClass"
					:td-class="tdClass"
					:is-expanded="isExpanded"
					:get-column-style="getColumnStyle"
					:format-cell-value="formatCellValue">
					<template v-for="column in columns" #[`cell-${column.key}`]="slotProps" :key="column.key">
						<slot v-if="$slots[`cell-${column.key}`]" :name="`cell-${column.key}`" v-bind="slotProps"></slot>
					</template>
				</BaseTableNestedRow>

				<BaseTableExpandedRow
					v-if="!row.children?.length"
					:row="row"
					:total-columns="totalColumns"
					:tr-class="trClass"
					:td-class="tdClass"
					:is-expanded="isExpanded">
					<template #expanded-content="slotProps">
						<slot name="expanded-content" v-bind="slotProps"></slot>
					</template>
				</BaseTableExpandedRow>
			</template>
			<tr v-if="isVirtual" class="base-table__spacer base-table__spacer--end" aria-hidden="true">
				<td :colspan="totalColumns" class="base-table__spacer-cell" :style="{ height: `${paddingEnd}px` }"></td>
			</tr>
		</template>

		<tr v-if="isLoading && rows.length && loadMode === 'infinite'" :class="trClass">
			<td :colspan="totalColumns" class="base-table__td base-table__td--loading-more" :class="tdClass">
				<BaseLoader has-label :custom-class="loadingMoreClasses" :size-scale="sizeScale" />
			</td>
		</tr>
	</tbody>
</template>

<script setup lang="ts">
import BaseTableRow from './BaseTableRow.vue'
import { BaseEmpty } from '@components/BaseEmpty'
import { BaseLoader } from '@components/BaseLoader'
import { BaseSkeleton } from '@components/BaseSkeleton'
import BaseTableNestedRow from './BaseTableNestedRow.vue'
import BaseTableExpandedRow from './BaseTableExpandedRow.vue'
import { useBaseTableBody } from '../../model/useBaseTableBody'
import type { BaseTableBodyEmits, BaseTableBodyProps, BaseTableBodySlots } from '../../types/body/BaseTableBody.types'

const props = withDefaults(defineProps<BaseTableBodyProps>(), {
	isVirtual: false,
	indexOffset: 0,
	paddingStart: 0,
	paddingEnd: 0,
	isFiltered: false,
	isRowInteractive: false,
})

const emit = defineEmits<BaseTableBodyEmits>()

defineSlots<BaseTableBodySlots>()

const { emptyClasses, loadingMoreClasses, getSkeletonWidth, getRowTabIndex, setActiveRow } = useBaseTableBody(props)
</script>
