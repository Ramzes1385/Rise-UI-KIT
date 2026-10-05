import { UI_ARIA } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { useUi } from '@composables/base/useUi'
import { computed, shallowRef, watch } from 'vue'
import { useMotion } from '@composables/app/useMotion'
import { useSizeScale } from '@composables/base/useSizeScale'
import { useCustomClass } from '@composables/base/useCustomClass'
import { useCustomColor } from '@composables/base/useCustomColor'
import { DEFAULT_VARIANT } from '@composables/base/useBaseComponent'
import { useSlidingIndicator } from '@composables/interaction/useSlidingIndicator'
import { calcTotalPages, calcVisiblePages } from '@utils/navigation/paginationUtils'
import type { BasePaginationEmits, PaginationProps } from '../types/BasePagination.types'

function usePagesIndicator(props: PaginationProps, getPages: () => (number | '...')[]) {
	const pagesRef = shallowRef<HTMLElement | null>(null)
	const indicator = useSlidingIndicator(pagesRef, () =>
		getPages()
			.filter(page => page !== '...')
			.indexOf(props.modelValue),
	)
	const motion = useMotion(pagesRef)

	watch(getPages, () => indicator.update(), { flush: 'post' })

	return {
		pagesRef,
		indicatorStyle: indicator.style,
		isIndicatorVisible: indicator.isVisible,
		isIndicatorInstant: computed(() => indicator.isInstant.value || motion.isReduced.value),
	}
}

export function useBasePagination(props: PaginationProps, emit: BasePaginationEmits) {
	const totalPages = computed(() => calcTotalPages(props.total, props.pageSize))
	const pages = computed(() =>
		calcVisiblePages({
			current: props.modelValue,
			total: totalPages.value,
			maxVisible: props.maxVisible,
			showLastPage: props.showLastPage,
		}),
	)
	const changePage = (page: number): void => {
		if (page < 1 || page > totalPages.value || page === props.modelValue) return
		emit('update:modelValue', page)
		emit('change', page)
	}

	return {
		...useSizeScale({ getScale: () => props.sizeScale }),
		...useCustomColor({ getColor: () => props.color }),
		...useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'prev', 'next', 'pages', 'button', 'ellipsis'] }),
		...usePagesIndicator(props, () => pages.value),
		ui: useUi(props, 'base-pagination'),
		pages,
		inactivePageVariant: computed(() => (props.variant === DEFAULT_VARIANT ? 'ghost' : props.variant)),
		isPrevDisabled: computed(() => props.modelValue <= 1 || totalPages.value < 1),
		isNextDisabled: computed(() => props.modelValue >= totalPages.value),
		navLabel: computed(() => props.ariaLabel ?? UI_ARIA.PAGINATION),
		pageLabel: (page: number): string => formatMessage(UI_ARIA.PAGINATION_PAGE, { page }),
		changePage,
		goToPrevPage: () => changePage(Math.min(props.modelValue - 1, totalPages.value)),
	}
}
