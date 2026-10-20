import type { ComputedRef } from 'vue'
import type { FlowModeLoader } from '../../types/internal/core/flowModes.types'
import { computed, getCurrentInstance, getCurrentScope, onMounted, shallowRef, watch } from 'vue'

export function createModeLoader<Module, State>(options: {
	isRequested: ComputedRef<boolean>
	module: () => Promise<Module>
	create: (loaded: Module) => State
	preload?: () => Promise<unknown>
}): FlowModeLoader<State> {
	const part = shallowRef<State | null>(null)
	const scope = getCurrentScope()
	let pending: Promise<State | null> | null = null

	function load(): Promise<State | null> {
		pending ??= Promise.all([options.module(), options.preload?.()])
			.then(([loaded]) => {
				if (scope && !scope.active) return null
				const create = (): State => options.create(loaded)
				part.value = scope ? (scope.run(create) ?? null) : create()
				return part.value
			})
			.catch(error => {
				pending = null
				throw error
			})
		return pending
	}

	function request(): void {
		if (options.isRequested.value) load().catch(() => undefined)
	}

	const start = () => watch(options.isRequested, request, { immediate: true })
	if (getCurrentInstance()) onMounted(start)
	else start()

	function prefetch(): void {
		Promise.all([options.module(), options.preload?.()]).catch(() => undefined)
	}

	return { part, isLoaded: computed(() => part.value !== null), load, prefetch }
}
