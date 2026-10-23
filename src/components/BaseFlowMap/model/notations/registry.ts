import { warn } from '@/locales/warn'
import { UI_FLOW_MAP } from '@/locales/messages'
import type { FlowNotation } from '../../types/api/flowNotation.types'
import type { FlowMapPlugin } from '../../types/api/flowController.types'

export function defineFlowNotation<T extends FlowNotation>(notation: T): T {
	return notation
}

export function defineFlowPlugin(plugin: FlowMapPlugin): FlowMapPlugin {
	return plugin
}

export function createRegistry<T extends { id: string }>(items: readonly T[], entry: () => string): Map<string, T> {
	const registry = new Map<string, T>()
	for (const item of items) {
		if (registry.has(item.id)) warn(UI_FLOW_MAP.WARN_DUPLICATE_ENTRY, { entry: entry(), id: item.id })
		registry.set(item.id, item)
	}
	return registry
}

export function createNotationRegistry(defaults: FlowNotation, extra: readonly FlowNotation[]): Map<string, FlowNotation> {
	const registry = new Map<string, FlowNotation>([[defaults.id, defaults]])
	for (const notation of extra) {
		if (registry.has(notation.id) && registry.get(notation.id) !== notation)
			warn(UI_FLOW_MAP.WARN_DUPLICATE_NOTATION, { id: notation.id })
		registry.set(notation.id, notation)
	}
	return registry
}
