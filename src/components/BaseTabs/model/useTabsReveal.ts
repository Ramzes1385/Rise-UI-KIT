import type { Ref } from 'vue'
import { nextTick, onMounted, watch } from 'vue'
import { isRtl } from '@utils/dom/directionUtils'
import { useReducedMotion } from '@composables/app/useReducedMotion'

function revealTarget(list: HTMLElement, tab: HTMLElement): number | null {
	const start = tab.offsetLeft
	const end = start + tab.offsetWidth
	if (start >= list.scrollLeft && end <= list.scrollLeft + list.clientWidth) return null
	return start - (list.clientWidth - tab.offsetWidth) / 2
}

function clampScroll(list: HTMLElement, left: number): number {
	if (!isRtl(list)) return Math.max(left, 0)
	return Math.min(Math.max(left, list.clientWidth - list.scrollWidth), 0)
}

export function useTabsReveal(listRef: Ref<HTMLElement | null>, selectedIndex: Ref<number>): void {
	const isReducedMotion = useReducedMotion()

	function reveal(behavior: 'auto' | 'smooth'): void {
		const list = listRef.value
		const tab = list?.querySelectorAll<HTMLElement>('[role="tab"]')[selectedIndex.value]
		if (!list || !tab || list.scrollWidth <= list.clientWidth) return
		const left = revealTarget(list, tab)
		if (left !== null) list.scrollTo({ left: clampScroll(list, left), behavior })
	}

	onMounted(() => reveal('auto'))
	watch(selectedIndex, () => nextTick(() => reveal(isReducedMotion.value ? 'auto' : 'smooth')))
}
