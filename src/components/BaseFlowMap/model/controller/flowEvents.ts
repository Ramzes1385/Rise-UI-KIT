import { warn } from '@/locales/warn'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP } from '@/locales/messages'
import type { FlowBinding } from '../../types/api/flowController.types'
import type {
	FlowBindingMeta,
	FlowEventBus,
	FlowEventState,
	FlowEventSub,
	FlowModelOptions,
} from '../../types/internal/core/flowModelCore.types'

function callSafely(name: string, handler: (value: never) => void, value: unknown): void {
	try {
		handler(value as never)
	} catch (error) {
		warn(UI_FLOW_MAP.WARN_HOOK_FAILED, { hook: name, message: error instanceof Error ? error.message : String(error) })
	}
}

function handlerName(listener: { name: string }): string {
	return listener.name
}

function subMeta(sub: FlowEventSub, results: ReadonlyMap<string, string>): FlowBindingMeta {
	return { id: sub.id, name: sub.name, handler: handlerName(sub.handler), lastResult: results.get(sub.name) }
}

function ownMeta(name: string, listener: { name: string }, results: ReadonlyMap<string, string>): FlowBindingMeta {
	return { id: `event:${name}`, name, handler: handlerName(listener), lastResult: results.get(name) }
}

export function createFlowEvents(options: FlowModelOptions): FlowEventBus {
	const subs: FlowEventSub[] = []
	const own = new Map<string, FlowEventState>()
	const results = new Map<string, string>()
	let counter = 0

	const ownOf = (name: string): FlowEventState => {
		const found = own.get(name) ?? { isEnabled: true, calls: 0 }
		own.set(name, found)
		return found
	}

	const emit: FlowEventBus['emit'] = (name, value) => {
		for (const sub of subs.filter(item => item.name === name && item.isEnabled)) {
			sub.calls += 1
			callSafely(name, sub.handler, value)
		}
		const state = ownOf(name)
		if (!state.isEnabled) return
		if (options.listeners?.()[name]) state.calls += 1
		options.emit?.(name, value)
	}

	const list = (): FlowBinding[] => {
		const fromSubs = subs.map(sub => toBinding(subMeta(sub, results), sub))
		const listeners = Object.entries(options.listeners?.() ?? {}).filter(([, listener]) => typeof listener === 'function')
		const fromOwn = listeners.map(([name, listener]) => toBinding(ownMeta(name, listener as { name: string }, results), ownOf(name)))
		return [...fromOwn, ...fromSubs]
	}

	return {
		emit,
		subscribe(name, handler) {
			counter += 1
			const sub: FlowEventSub = { id: `event-sub-${counter}`, name, handler, isEnabled: true, calls: 0 }
			subs.push(sub)
			return () => {
				const index = subs.indexOf(sub)
				if (index >= 0) subs.splice(index, 1)
			}
		},
		list,
		setEnabled(id, isEnabled) {
			const sub = subs.find(item => item.id === id)
			if (sub) sub.isEnabled = isEnabled
			if (!sub && id.startsWith('event:')) ownOf(id.slice('event:'.length)).isEnabled = isEnabled
			return Boolean(sub) || id.startsWith('event:')
		},
		note: (name, text) => void results.set(name, text),
		resultOf: name => results.get(name),
	}
}

function toBinding(meta: FlowBindingMeta, state: FlowEventState): FlowBinding {
	return { ...meta, isCancellable: false, isEnabled: state.isEnabled, calls: state.calls }
}

export function hookFailedMessage(hook: string): string {
	return formatMessage(UI_FLOW_MAP.ERROR_HOOK_FAILED, { hook })
}
