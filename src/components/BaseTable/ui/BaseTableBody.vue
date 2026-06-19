<template>
	<tbody :class="tbodyClass">
		<template v-if="isLoading && !rows.length">
			<tr v-for="skeletonRow in skeletonRows" :key="skeletonRow" :class="trClass">
				<td v-if="isSelectable" class="base-table__td base-table__td--check" :class="tdClass">
					<BaseSkeleton shape="circle" width="16px" height="16px" :size-scale="sizeScale" />
				</td>
				<td v-if="hasRowNumber" class="base-table__td base-table__td--number" :class="tdClass">
					<BaseSkeleton shape="text" width="20px" :size-scale="sizeScale" />
				</td>
				<td v-for="column in columns" :key="column.key" class="base-table__td" :class="tdClass">
					<BaseSkeleton shape="text" :width="column.width || '80%'" :size-scale="sizeScale" />
				</td>
			</tr>
		</template>

		<tr v-else-if="!isLoading && rows.length === 0" :class="trClass">
			<td :colspan="totalColumns" class="base-table__td base-table__td--empty" :class="tdClass">
				<slot name="empty">
					<BaseText tag="span" class="base-table__empty-text">{{ emptyText }}</BaseText>
				</slot>
			</td>
		</tr>

		<template v-else>
			<template v-for="(row, index) in rows" :key="row.id">
				<BaseTableRow
					:row="row"
					:columns="columns"
					:row-index="index"
					:row-number="getRowNumber(index)"
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
					@row-click="emit('row-click', $event)"
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
		</template>

		<tr v-if="isLoading && rows.length && loadMode === 'infinite'" :class="trClass">
			<td :colspan="totalColumns" class="base-table__td base-table__td--loading-more" :class="tdClass">
				<BaseLoader variant="spinner" :size-scale="calcIconScale('xs', sizeScale)" has-label />
			</td>
		</tr>
	</tbody>
</template>

<script setup lang="ts">
import { BaseLoader } from '@components/BaseLoader'
import { BaseSkeleton } from '@components/BaseSkeleton'
import { BaseText } from '@components/BaseText'
import { calcIconScale } from '@utils/iconUtils'
import BaseTableExpandedRow from './BaseTableExpandedRow.vue'
import BaseTableNestedRow from './BaseTableNestedRow.vue'
import BaseTableRow from './BaseTableRow.vue'
import type { BaseTableBodyEmits, BaseTableBodyProps } from '../model/BaseTableBody.types'

defineProps<BaseTableBodyProps>()

const emit = defineEmits<BaseTableBodyEmits>()
</script>
