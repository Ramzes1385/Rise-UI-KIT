import { watch, type Ref } from 'vue'
import type { MapAdapter } from '../types/providers.types'

export function watchAdapter<T>(
	adapter: Ref<MapAdapter | null>,
	{ source, apply, isDeep }: { source: () => T; apply: (adapter: MapAdapter, value: T) => void; isDeep?: boolean },
): void {
	const run = (): void => {
		if (adapter.value) apply(adapter.value, source())
	}
	watch(adapter, run, { flush: 'sync' })
	watch(source, run, { deep: isDeep })
}
