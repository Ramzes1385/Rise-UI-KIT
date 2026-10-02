import { computed, ref, watch } from 'vue'
import { findEnabled, searchCascader } from './levels/cascaderTree'
import type { CascaderLevels, CascaderProps } from '../types/BaseCascader.types'

export function useCascaderSearch(props: CascaderProps, levels: CascaderLevels) {
	const searchQuery = ref('')
	const activeResult = ref(-1)
	const isSearching = computed(() => Boolean(props.isSearchable) && searchQuery.value.trim() !== '')
	const results = computed(() =>
		isSearching.value
			? searchCascader(levels.index.value, searchQuery.value, node => Boolean(props.isAnyLevel) || !levels.hasChildren(node))
			: [],
	)

	watch(results, () => {
		activeResult.value = findEnabled(results.value, 0, 1)
	})

	return {
		searchQuery,
		activeResult,
		isSearching,
		results,
		moveResult(step: 1 | -1): void {
			const position = findEnabled(results.value, activeResult.value + step, step)
			if (position !== -1) activeResult.value = position
		},
	}
}
