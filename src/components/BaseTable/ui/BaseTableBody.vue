<template>
	<tbody class="base-table__tbody" :class="tbodyClass">
		<!-- Загрузка без данных: строки-скелетоны той же высоты, что и строки таблицы -->
		<template v-if="isLoading && !rows.length">
			<tr v-for="skeletonRow in skeletonRows" :key="skeletonRow" class="base-table__tr--skeleton" :class="trClass">
				<!-- Без sizeScale у скелетонов: ширины в процентах не масштабируются, высота берёт --size-scale таблицы -->
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
				<slot name="empty">
					<BaseEmpty variant="ghost" :title="emptyText" :custom-class="EMPTY_CLASSES" :size-scale="sizeScale" />
				</slot>
			</td>
		</tr>

		<template v-else>
			<!-- Виртуальная прокрутка: распорка высотой строк выше видимых -->
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
			<!-- Распорка ниже видимых строк: по её началу замеряется высота последней отрисованной строки -->
			<tr v-if="isVirtual" class="base-table__spacer base-table__spacer--end" aria-hidden="true">
				<td :colspan="totalColumns" class="base-table__spacer-cell" :style="{ height: `${paddingEnd}px` }"></td>
			</tr>
		</template>

		<tr v-if="isLoading && rows.length && loadMode === 'infinite'" :class="trClass">
			<td :colspan="totalColumns" class="base-table__td base-table__td--loading-more" :class="tdClass">
				<BaseLoader has-label :custom-class="LOADING_MORE_CLASSES" :size-scale="sizeScale" />
			</td>
		</tr>
	</tbody>
</template>

<script setup lang="ts">
import { BaseEmpty } from '@components/BaseEmpty'
import { BaseLoader } from '@components/BaseLoader'
import { BaseSkeleton } from '@components/BaseSkeleton'
import BaseTableRow from './BaseTableRow.vue'
import BaseTableNestedRow from './BaseTableNestedRow.vue'
import BaseTableExpandedRow from './BaseTableExpandedRow.vue'
import type { BaseTableBodyEmits, BaseTableBodyProps, BaseTableBodySlots } from '../model/BaseTableBody.types'

withDefaults(defineProps<BaseTableBodyProps>(), { isVirtual: false, indexOffset: 0, paddingStart: 0, paddingEnd: 0 })

const emit = defineEmits<BaseTableBodyEmits>()

defineSlots<BaseTableBodySlots>()

/** Класс заголовка пустого состояния сохраняет прежний селектор .base-table__empty-text для приложений и тестов */
const EMPTY_CLASSES = { root: 'base-table__empty', title: 'base-table__empty-text' }

/** Индикатор подгрузки в строку: спиннер 20px и подпись справа от него */
const LOADING_MORE_CLASSES = { root: 'base-table__loading-more', animation: 'base-table__loading-more-icon' }

/** Ширины скелетонов в ячейках: повторяющийся узор, чтобы строки-заглушки не выглядели одинаковыми */
const SKELETON_WIDTHS = ['72%', '48%', '60%', '84%', '40%']

function getSkeletonWidth(row: number, column: number): string {
	return SKELETON_WIDTHS[(row + column) % SKELETON_WIDTHS.length]
}
</script>
