import type { Ref } from 'vue'
import { isRtl } from '@utils/dom/directionUtils'
import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useRoadmapDirection(root: Ref<HTMLElement | null>): Ref<boolean> {
	const isRtlDirection = ref(false)
	let observer: MutationObserver | null = null

	function sync(): void {
		isRtlDirection.value = isRtl(root.value)
	}

	onMounted(() => {
		sync()
		observer = new MutationObserver(sync)
		const scope = root.value?.closest('[dir]')
		for (const target of new Set([document.documentElement, scope])) {
			if (target) observer.observe(target, { attributes: true, attributeFilter: ['dir'] })
		}
	})

	onBeforeUnmount(() => {
		observer?.disconnect()
		observer = null
	})

	return isRtlDirection
}
