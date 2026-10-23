import type { ComputedRef } from 'vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { FlowMap3DView } from '../../../types/BaseFlowMap3D.types'
import type { FlowMap3DViewDeferrer } from '../../../types/internal/flowMap3dView.types'

export function useViewDefer(options: { targetView: ComputedRef<FlowMap3DView>; hasFallback: () => boolean }) {
	const shown = ref<FlowMap3DView>(options.targetView.value)
	const isFading = ref(false)
	let deferrer: FlowMap3DViewDeferrer | null = null
	let timers: Array<ReturnType<typeof setTimeout>> = []

	function clearTimers(): void {
		timers.forEach(clearTimeout)
		timers = []
	}

	function commit(next: FlowMap3DView): void {
		const fade = options.hasFallback() ? 0 : (deferrer?.fade() ?? 0)
		shown.value = next
		isFading.value = fade > 0
		if (fade > 0) timers.push(setTimeout(() => (isFading.value = false), fade))
	}

	watch(
		options.targetView,
		next => {
			clearTimers()
			isFading.value = false
			const wait = deferrer?.wait(next, shown.value) ?? 0
			if (wait > 0) timers.push(setTimeout(() => commit(next), wait))
			else if (next !== shown.value) commit(next)
		},
		{ flush: 'sync' },
	)
	onBeforeUnmount(clearTimers)

	return {
		shownView: computed(() => shown.value),
		isFading,
		setDeferrer: (next: FlowMap3DViewDeferrer | null): void => void (deferrer = next),
	}
}
