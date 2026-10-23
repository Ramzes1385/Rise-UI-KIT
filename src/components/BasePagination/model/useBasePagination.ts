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

function usePagesIndicator(getCurrent: () => number, getPages: () => (number | '...')[]) {
	const pagesRef = shallowRef<HTMLElement | null>(null)
	const indicator = useSlidingIndicator(pagesRef, () =>
		getPages()
			.filter(page => page !== '...')
			.indexOf(getCurrent()),
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
	const currentPage = computed(() => {
		const page = Number.isNaN(props.modelValue) ? 1 : props.modelValue
		return Math.min(Math.max(Math.trunc(page), 1), Math.max(totalPages.value, 1))
	})
	const pages = computed(() =>
		calcVisiblePages({
			current: currentPage.value,
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
		...usePagesIndicator(
			() => currentPage.value,
			() => pages.value,
		),
		ui: useUi(props, 'base-pagination'),
		pages,
		currentPage,
		inactivePageVariant: computed(() => (props.variant === DEFAULT_VARIANT ? 'ghost' : props.variant)),
		isPrevDisabled: computed(() => currentPage.value <= 1 || totalPages.value < 1),
		isNextDisabled: computed(() => currentPage.value >= totalPages.value),
		navLabel: computed(() => props.ariaLabel ?? UI_ARIA.PAGINATION),
		pageLabel: (page: number): string => formatMessage(UI_ARIA.PAGINATION_PAGE, { page }),
		changePage,
		goToPrevPage: () => changePage(currentPage.value - 1),
		goToNextPage: () => changePage(currentPage.value + 1),
	}
}
