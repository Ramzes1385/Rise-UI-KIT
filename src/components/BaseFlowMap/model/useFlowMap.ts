import type { Ref } from 'vue'
import { computed, shallowRef, watch } from 'vue'
import type { FlowMapController } from '../types/api/flowController.types'
import type { FlowMapHandle, FlowQueuedCall } from '../types/internal/core/flowCore.types'

function subscribe(controller: FlowMapController, args: unknown[]): () => void {
	return (controller.on as (...values: unknown[]) => () => void)(...args)
}

export function useFlowMap(mapRef: Ref<FlowMapController | null> = shallowRef<FlowMapController | null>(null)): FlowMapHandle {
	const queue: FlowQueuedCall[] = []
	const isReady = computed(() => mapRef.value !== null)

	watch(
		mapRef,
		controller => {
			if (!controller) return
			for (const call of queue.splice(0)) call(controller)
		},
		{ flush: 'sync', immediate: true },
	)

	function invoke(name: string, args: unknown[]): unknown {
		const controller = mapRef.value
		if (controller) return (controller[name as keyof FlowMapController] as (...values: unknown[]) => unknown)(...args)
		queue.push(ready => (ready[name as keyof FlowMapController] as (...values: unknown[]) => unknown)(...args))
		return undefined
	}

	function on(...args: unknown[]): () => void {
		const controller = mapRef.value
		if (controller) return subscribe(controller, args)
		let dispose: (() => void) | null = null
		let isCancelled = false
		queue.push(ready => {
			if (!isCancelled) dispose = subscribe(ready, args)
		})
		return () => {
			isCancelled = true
			dispose?.()
		}
	}

	return new Proxy({} as FlowMapHandle, {
		get(_target, key) {
			if (key === 'mapRef') return mapRef
			if (key === 'isReady') return isReady
			if (key === 'on') return on
			return typeof key === 'string' ? (...args: unknown[]) => invoke(key, args) : undefined
		},
	})
}
