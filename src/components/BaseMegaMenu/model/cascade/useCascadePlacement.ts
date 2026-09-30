import { resolvePlacement } from './cascadeItems'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { MegaMenuSubPlacement } from '../../types/BaseMegaMenu.types'

const MOBILE_SELECTOR = '.base-mega-menu--mobile'

function measure(subId: string): MegaMenuSubPlacement {
	const element = document.getElementById(subId)
	if (!element || element.closest(MOBILE_SELECTOR)) return 'side'
	return resolvePlacement(element.getBoundingClientRect(), window.innerWidth)
}

export function useCascadePlacement() {
	const placements = ref<MegaMenuSubPlacement[]>([])
	let subIds: string[] = []

	async function placeFrom(depth: number): Promise<void> {
		for (let index = depth; index < subIds.length; index += 1) {
			const subId = subIds[index]
			placements.value[index] = 'side'
			await nextTick()
			if (subIds[index] !== subId) return
			placements.value[index] = measure(subId)
		}
	}

	const handleResize = (): void => void placeFrom(0)
	onMounted(() => window.addEventListener('resize', handleResize, { passive: true }))
	onBeforeUnmount(() => window.removeEventListener('resize', handleResize))

	return {
		isBelow: (depth: number): boolean => placements.value[depth] === 'below',
		place(depth: number, subId: string): void {
			subIds = [...subIds.slice(0, depth), subId]
			placements.value = placements.value.slice(0, depth)
			void placeFrom(depth)
		},
		cut(depth: number): void {
			subIds = subIds.slice(0, depth)
			placements.value = placements.value.slice(0, depth)
		},
	}
}
