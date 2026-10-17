import { onScopeDispose, watch } from 'vue'
import type { FlowModelProps } from '../../types/internal/flowModel.types'
import type { FlowHookName, FlowHooks } from '../../types/api/flowController.types'
import type { HookRunner } from '@composables/editor/useCommandHistory/types/useCommandHistory.types'
import type { FlowHookSource, FlowPropSubscription } from '../../types/internal/core/flowModelCore.types'

export const FLOW_HOOK_NAMES: readonly FlowHookName[] = [
	'beforeChange',
	'beforeCreate',
	'beforeConnect',
	'beforeDelete',
	'beforeEditLabel',
	'beforeImport',
	'beforeAccept',
	'resolveChoice',
]

function subscribe({ props, hooks }: FlowHookSource, name: FlowHookName, fn: unknown): FlowPropSubscription {
	const call = (context: never): unknown => (props[name] as ((value: never) => unknown) | undefined)?.(context)
	Object.defineProperty(call, 'name', { value: (fn as { name: string }).name })
	return { fn, off: (hooks.on as (name: string, handler: unknown) => () => void)(name, call) }
}

export function syncPropHooks(props: FlowModelProps, hooks: HookRunner<FlowHooks>): void {
	const subs = new Map<FlowHookName, FlowPropSubscription>()
	const sync = (): void => {
		for (const name of FLOW_HOOK_NAMES) {
			const fn = props[name]
			const current = subs.get(name)
			if (current && current.fn === fn) continue
			current?.off()
			subs.delete(name)
			if (typeof fn === 'function') subs.set(name, subscribe({ props, hooks }, name, fn))
		}
	}
	watch(() => FLOW_HOOK_NAMES.map(name => props[name]), sync, { immediate: true, flush: 'sync' })
	onScopeDispose(() => subs.forEach(item => item.off()))
}
