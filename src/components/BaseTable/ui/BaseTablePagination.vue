<template>
	<div v-if="showFooterBar" class="base-table__footer-bar" :class="footerBarClass">
		<div v-if="showPageSizeSelector" class="base-table__page-size" :class="pageSizeClass">
			<BaseSelect
				:model-value="String(pageSize)"
				:options="pageSizeSelectOptions"
				:size-scale="sizeScale - 20"
				@update:model-value="handlePageSizeUpdate" />
		</div>

		<slot
			v-if="showPagination"
			name="pagination"
			:current-page="currentPage"
			:total-pages="totalPages"
			:visible-pages="visiblePages"
			:page-size="pageSize"
			:page-size-options="pageSizeOptions"
			:pagination-info="paginationInfo"
			:page-size-select-options="pageSizeSelectOptions"
			:handle-page-size-change="handlePageSizeChange">
			<BaseText tag="span" class="base-table__pagination-info" :custom-class="paginationInfoClass">
				{{ paginationInfo }}
			</BaseText>
			<BasePagination
				:model-value="currentPage"
				:total="totalItems"
				:page-size="pageSize"
				:max-visible="maxVisible"
				variant="ghost"
				:size-scale="sizeScale - 20"
				@update:model-value="emit('page-change', $event)" />
		</slot>
	</div>
</template>

<script setup lang="ts">
import { BasePagination } from '@components/BasePagination'
import { BaseSelect } from '@components/BaseSelect'
import { BaseText } from '@components/BaseText'

defineProps<{
	showFooterBar: boolean
	showPageSizeSelector: boolean
	showPagination: boolean
	pageSize: number
	pageSizeOptions: number[]
	pageSizeSelectOptions: Array<{ value: string; label: string }>
	currentPage: number
	totalPages: number
	visiblePages: number[]
	paginationInfo: string
	totalItems: number
	maxVisible: number
	sizeScale: number
	footerBarClass?: string
	pageSizeClass?: string
	paginationInfoClass?: string
	handlePageSizeChange: (value: string | number) => void
}>()

const emit = defineEmits<{
	(event: 'page-change', page: number): void
	(event: 'page-size-change', value: string | number): void
}>()

function handlePageSizeUpdate(value: string | number | Array<string | number>): void {
	if (Array.isArray(value)) return
	emit('page-size-change', value)
}
</script>
