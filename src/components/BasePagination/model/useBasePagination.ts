import { computed } from 'vue'
import { useSizeScale } from '@composables/base/useSizeScale'
import { useCustomClass } from '@composables/base/useCustomClass'
import { useCustomColor } from '@composables/base/useCustomColor'
import { DEFAULT_VARIANT } from '@composables/base/useBaseComponent'
import { calcTotalPages, calcVisiblePages } from '@utils/navigation/paginationUtils'
import type { BasePaginationEmits, PaginationProps } from '../types/BasePagination.types'

export function useBasePagination(props: PaginationProps, emit: BasePaginationEmits) {
	const totalPages = computed(() => calcTotalPages(props.total, props.pageSize))
	const changePage = (page: number): void => {
		if (page < 1 || page > totalPages.value) return
		emit('update:modelValue', page)
		emit('change', page)
	}

	return {
		...useSizeScale({ getScale: () => props.sizeScale }),
		...useCustomColor({ getColor: () => props.color }),
		...useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'prev', 'next', 'pages', 'button', 'ellipsis'] }),
		pages: computed(() =>
			calcVisiblePages({
				current: props.modelValue,
				total: totalPages.value,
				maxVisible: props.maxVisible,
				showLastPage: props.showLastPage,
			}),
		),
		inactivePageVariant: computed(() => (props.variant === DEFAULT_VARIANT ? 'ghost' : props.variant)),
		isPrevDisabled: computed(() => props.modelValue <= 1 || totalPages.value < 1),
		isNextDisabled: computed(() => props.modelValue >= totalPages.value),
		changePage,
		goToPrevPage: () => changePage(Math.min(props.modelValue - 1, totalPages.value)),
	}
}
