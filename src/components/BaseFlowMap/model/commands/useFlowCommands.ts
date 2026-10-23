import { layoutCommand } from './flowLayoutCommands'
import type { FlowChangeSource } from '../../types/data/flowReview.types'
import { addEdgeCommand, connectEdgeOf, updateEdgeRulesCommand } from './flowEdgeCommands'
import { addGroupCommand, addNodeCommand, moveCommand, removeCommand, updateCommand } from './flowCommands'
import type { FlowCommandEnv, FlowCommandParts, FlowEditApi } from '../../types/internal/core/flowModelCore.types'

export function createCommandEnv(parts: FlowCommandParts, source: FlowChangeSource): FlowCommandEnv {
	return {
		notation: () => parts.state.notation.value,
		registry: () => parts.state.registry.value,
		scope: () => parts.state.scope.value,
		positionOf: id => {
			const rect = parts.layout.value.nodes[id]
			return rect ? { x: rect.x, y: rect.y } : undefined
		},
		source,
	}
}

export function createEditApi(parts: FlowCommandParts, source: FlowChangeSource = 'api'): FlowEditApi {
	const env = createCommandEnv(parts, source)
	const data = () => parts.state.data.value
	const run = parts.execute
	return {
		addNode: node => run(addNodeCommand(node, env)),
		updateNode: (id, patch) => run(updateCommand({ entity: 'node', id }, patch, env)),
		addEdge: edge => run(addEdgeCommand(edge, env, data())),
		connect: (from, to, edge) => run(addEdgeCommand(connectEdgeOf({ data: data(), env }, [from, to], edge), env, data())),
		updateEdge: (id, patch) => {
			const isLabelOnly = Object.keys(patch).length === 1 && 'label' in patch
			return run(isLabelOnly ? updateCommand({ entity: 'edge', id }, patch, env) : updateEdgeRulesCommand(id, patch, env))
		},
		addGroup: group => run(addGroupCommand(group, env)),
		updateGroup: (id, patch) => run(updateCommand({ entity: 'group', id }, patch, env)),
		remove: ids => run(removeCommand(ids, env)),
		move: (ids, by) => run(moveCommand(ids, by, env)),
		layout: options => run(layoutCommand(options ?? {}, env)),
	}
}
