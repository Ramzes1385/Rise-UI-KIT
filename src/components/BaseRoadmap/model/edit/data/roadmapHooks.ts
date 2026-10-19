import { onScopeDispose, watch } from 'vue'
import type { BaseRoadmapProps, RoadmapHooks } from '../../../types/BaseRoadmap.types'
import { createHookRunner } from '@composables/editor/useCommandHistory/helpers/hookRunner'
import type { HookRunner } from '@composables/editor/useCommandHistory/types/useCommandHistory.types'
import type { RoadmapHookName, RoadmapPropSubscription } from '../../../types/internal/roadmapEdit.internal.types'

const ROADMAP_HOOK_NAMES = ['beforeStatusChange', 'beforeChange', 'beforeDelete'] as const

function subscribe(props: BaseRoadmapProps, hooks: HookRunner<RoadmapHooks>, name: RoadmapHookName): RoadmapPropSubscription {
	const fn = props[name]
	const call = (context: never): unknown => (props[name] as ((value: never) => unknown) | undefined)?.(context)
	Object.defineProperty(call, 'name', { value: (fn as { name: string }).name })
	return { fn, off: (hooks.on as (name: string, handler: unknown) => () => void)(name, call) }
}

export function createRoadmapHooks(props: BaseRoadmapProps): HookRunner<RoadmapHooks> {
	const hooks = createHookRunner<RoadmapHooks>()
	const subs = new Map<RoadmapHookName, RoadmapPropSubscription>()
	const sync = (): void => {
		for (const name of ROADMAP_HOOK_NAMES) {
			const current = subs.get(name)
			if (current && current.fn === props[name]) continue
			current?.off()
			subs.delete(name)
			if (typeof props[name] === 'function') subs.set(name, subscribe(props, hooks, name))
		}
	}
	watch(() => ROADMAP_HOOK_NAMES.map(name => props[name]), sync, { immediate: true, flush: 'sync' })
	onScopeDispose(() => subs.forEach(item => item.off()))
	return hooks
}
