import type { FlowCommandParts, FlowEditApi } from '../../../types/internal/core/flowModelCore.types'

export function createLazyEditApi(parts: FlowCommandParts): FlowEditApi {
	let pending: Promise<FlowEditApi> | null = null
	const load = (): Promise<FlowEditApi> =>
		(pending ??= import('../../commands/useFlowCommands').then(({ createEditApi }) => createEditApi(parts)))
	return {
		addNode: node => load().then(api => api.addNode(node)),
		updateNode: (id, patch) => load().then(api => api.updateNode(id, patch)),
		addEdge: edge => load().then(api => api.addEdge(edge)),
		connect: (from, to, edge) => load().then(api => api.connect(from, to, edge)),
		updateEdge: (id, patch) => load().then(api => api.updateEdge(id, patch)),
		addGroup: group => load().then(api => api.addGroup(group)),
		updateGroup: (id, patch) => load().then(api => api.updateGroup(id, patch)),
		remove: ids => load().then(api => api.remove(ids)),
		move: (ids, by) => load().then(api => api.move(ids, by)),
		layout: options => load().then(api => api.layout(options)),
	}
}
