import type { FlowBinding } from '../../types/api/flowController.types'
import type { FlowBindingParts } from '../../types/internal/core/flowModelCore.types'

export function listBindings({ hooks, events }: FlowBindingParts): FlowBinding[] {
	const fromHooks = hooks.list().map(item => ({
		id: item.id,
		name: item.name,
		isCancellable: true,
		handler: item.handler,
		isEnabled: item.isEnabled,
		calls: item.calls,
		lastResult: events.resultOf(item.name),
	}))
	return [...fromHooks, ...events.list()]
}

export function toggleBinding({ hooks, events }: FlowBindingParts, id: string, isEnabled: boolean): void {
	if (hooks.list().some(item => item.id === id)) hooks.setEnabled(id, isEnabled)
	else events.setEnabled(id, isEnabled)
}
