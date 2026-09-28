/** Composable: логика BasePagination — видимые страницы, границы и переход */
import { computed } from 'vue'
import { useSizeScale } from '@composables/useSizeScale'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { DEFAULT_VARIANT } from '@composables/useBaseComponent'
import { calcTotalPages, calcVisiblePages } from '@utils/paginationUtils'
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
		/**
		 * Вариант стрелок и неактивных страниц. Текущая страница всегда рисуется вариантом по умолчанию (заливка основным
		 * цветом), поэтому при variant='default' остальным нужен нейтральный ghost — иначе текущую страницу не отличить.
		 */
		inactivePageVariant: computed(() => (props.variant === DEFAULT_VARIANT ? 'ghost' : props.variant)),
		/**
		 * Границы сравниваются через <=/>=, а не ===: modelValue может оказаться вне диапазона (total уменьшился после
		 * фильтрации или ещё равен 0 до загрузки), и тогда кнопки не должны выглядеть активными.
		 */
		isPrevDisabled: computed(() => props.modelValue <= 1 || totalPages.value < 1),
		isNextDisabled: computed(() => props.modelValue >= totalPages.value),
		changePage,
		/** Со страницы за пределами диапазона «назад» ведёт на последнюю существующую, иначе changePage отбросил бы modelValue - 1 */
		goToPrevPage: () => changePage(Math.min(props.modelValue - 1, totalPages.value)),
	}
}
