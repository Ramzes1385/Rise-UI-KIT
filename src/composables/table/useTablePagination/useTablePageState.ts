/** Composable: текущая страница таблицы — внутренняя или управляемая снаружи через `page` */
import { computed, ref } from 'vue'
import type { WritableComputedRef } from 'vue'

function useTablePageState(page?: () => number | undefined, onPageChange?: (page: number) => void): WritableComputedRef<number> {
	const internalPage = ref(1)
	const currentPage = computed({
		get: (): number => Math.max(1, page?.() ?? internalPage.value),
		set: (value: number): void => {
			if (value === currentPage.value) return
			if (page?.() === undefined) internalPage.value = value
			onPageChange?.(value)
		},
	})
	return currentPage
}

export { useTablePageState }
