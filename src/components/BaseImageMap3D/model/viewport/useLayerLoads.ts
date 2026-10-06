import { computed, ref } from 'vue'
import type { LayerLoads } from '../../types/internal/imageMap3dInternal.types'

export function useLayerLoads(): LayerLoads {
	const pending = ref(0)
	const failed = ref<string[]>([])

	return {
		isLoading: computed(() => pending.value > 0),
		failedLayerIds: computed(() => failed.value),
		reset(): void {
			pending.value = 0
			failed.value = []
		},
		track(signal: AbortSignal, task: Promise<void>): void {
			pending.value += 1
			void task.finally(() => {
				if (!signal.aborted) pending.value -= 1
			})
		},
		fail(layerId: string, signal: AbortSignal): void {
			if (!signal.aborted && !failed.value.includes(layerId)) failed.value = [...failed.value, layerId]
		},
	}
}
