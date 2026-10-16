import type { Ref } from 'vue'
import { nextTick, onMounted, watch } from 'vue'
import { useReducedMotion } from '@composables/app/useReducedMotion'

function revealTarget(list: HTMLElement, tab: HTMLElement): number | null {
	const start = tab.offsetLeft
	const end = start + tab.offsetWidth
	if (start >= list.scrollLeft && end <= list.scrollLeft + list.clientWidth) return null
	return start - (list.clientWidth - tab.offsetWidth) / 2
}

export function useTabsReveal(listRef: Ref<HTMLElement | null>, selectedIndex: Ref<number>): void {
	const isReducedMotion = useReducedMotion()

	function reveal(behavior: 'auto' | 'smooth'): void {
		const list = listRef.value
		const tab = list?.querySelectorAll<HTMLElement>('[role="tab"]')[selectedIndex.value]
		if (!list || !tab || list.scrollWidth <= list.clientWidth) return
		const left = revealTarget(list, tab)
		if (left !== null) list.scrollTo({ left: Math.max(left, 0), behavior })
	}

	onMounted(() => reveal('auto'))
	watch(selectedIndex, () => nextTick(() => reveal(isReducedMotion.value ? 'auto' : 'smooth')))
}
