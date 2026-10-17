import type { FlowMapController, FlowMapPlugin } from '../../types/api/flowController.types'

export function setupFlowPlugins(controller: FlowMapController, plugins: readonly FlowMapPlugin[]): () => void {
	const disposers = plugins.map(plugin => plugin.setup?.(controller))
	return () => {
		for (const dispose of disposers) dispose?.()
	}
}
