/** Composable: логика BaseSelectDropdown — фокус в поле поиска при открытии и прокрутка к активной опции */
import { nextTick, onMounted, ref, watch } from 'vue'
import type { BaseSelectDropdownProps } from '../types/BaseSelectDropdown.types'

export function useBaseSelectDropdown(props: BaseSelectDropdownProps) {
	const listRef = ref<HTMLElement | null>(null)
	const searchRef = ref<HTMLInputElement | null>(null)

	// Панель с поиском открылась — фокус сразу в поле поиска: можно печатать запрос, стрелки и Enter управляют списком
	onMounted(() => {
		searchRef.value?.focus({ preventScroll: true })
	})

	// Активная опция, выбранная стрелками, прокручивается в видимую область списка
	watch(
		() => props.activeIndex,
		async index => {
			if (index < 0) return
			await nextTick()
			const option = listRef.value?.children.item(index)
			// scrollIntoView нет в jsdom — вызов необязательный
			option?.scrollIntoView?.({ block: 'nearest' })
		},
	)

	return { listRef, searchRef }
}
