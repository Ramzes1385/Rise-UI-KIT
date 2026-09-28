import { nextTick, onMounted, ref, watch } from 'vue'
import type { BaseSelectDropdownProps } from '../types/BaseSelectDropdown.types'

export function useBaseSelectDropdown(props: BaseSelectDropdownProps) {
	const listRef = ref<HTMLElement | null>(null)
	const searchRef = ref<HTMLInputElement | null>(null)

	onMounted(() => {
		searchRef.value?.focus({ preventScroll: true })
	})

	watch(
		() => props.activeIndex,
		async index => {
			if (index < 0) return
			await nextTick()
			const option = listRef.value?.children.item(index)
			option?.scrollIntoView?.({ block: 'nearest' })
		},
	)

	return { listRef, searchRef }
}
