import { nextTick, onMounted, ref, watch } from 'vue'
import type { BaseSelectDropdownProps } from '../types/BaseSelectDropdown.types'

export function useBaseSelectDropdown(props: BaseSelectDropdownProps) {
	const listRef = ref<HTMLElement | null>(null)
	const searchRef = ref<{ inputRef: HTMLInputElement | null } | null>(null)

	onMounted(() => {
		searchRef.value?.inputRef?.focus({ preventScroll: true })
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
