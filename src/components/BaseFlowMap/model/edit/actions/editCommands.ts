import { formatMessage } from '@/locales/state'
import { UI_FLOW_EDITOR } from '@/locales/messages'
import { checkConnection } from '../../commands/flowRules'
import { layoutCommand } from '../../commands/flowLayoutCommands'
import type { FlowRootChange } from '../../../types/data/flowReview.types'
import type { FlowCommand } from '../../../types/internal/flowModel.types'
import type { FlowEditEnd } from '../../../types/internal/edit/flowEdit.types'
import { addEdgeCommand, connectEdgeOf } from '../../commands/flowEdgeCommands'
import type { FlowCommandEnv } from '../../../types/internal/core/flowModelCore.types'
import type { FlowEditCommands } from '../../../types/internal/edit/flowEditApi.types'
import type { FlowModelInternal } from '../../../types/internal/core/flowRenderInternal.types'
import { addGroupCommand, addNodeCommand, moveCommand, removeCommand, updateCommand } from '../../commands/flowCommands'

export function createEditEnv(model: FlowModelInternal): FlowCommandEnv {
	const registry = () => new Map([[model.notation.value.id, model.notation.value]])
	return {
		notation: () => model.notation.value,
		registry,
		positionOf: id => {
			const rect = model.layout.value.nodes[id]
			return rect ? { x: rect.x, y: rect.y } : undefined
		},
		scope: () => ({
			data: model.data.value,
			notation: model.notation.value,
			registry: registry(),
			layouts: new Map(),
			routers: new Map(),
		}),
		source: 'user',
	}
}

export function useEditCommands(model: FlowModelInternal): FlowEditCommands {
	const env = createEditEnv(model)
	const run = model.execute
	const data = () => model.data.value
	return {
		addNode: node => run(addNodeCommand(node, env)),
		addGroup: group => run(addGroupCommand(group, env)),
		addEdge: edge => run(addEdgeCommand(edge, env, data())),
		connect: ([from, to], edge) => run(addEdgeCommand(connectEdgeOf({ data: data(), env }, [from, to], edge), env, data())),
		update: (target, patch) => run(updateCommand(target, patch, env)),
		remove: ids => run(removeCommand(ids, env)),
		move: (ids, by) => run(moveCommand(ids, by, env)),
		layout: options => run(layoutCommand(options ?? {}, env)),
		updateMap: patch => run(updateMapCommand(patch, env.source)),
		verify: (ends, kind) => verifyEnds(model, env, { ends, kind }),
	}
}

function updateMapCommand(patch: Record<string, unknown>, source: FlowCommand['source']): FlowCommand {
	return {
		name: 'update-map',
		label: formatMessage(UI_FLOW_EDITOR.CMD_UPDATE_MAP, { fields: Object.keys(patch).join(', ') }),
		source,
		mergeKey: `map:${Object.keys(patch).join(',')}`,
		build: data => [
			{
				type: 'root',
				patch: patch as FlowRootChange['patch'],
				previous: Object.fromEntries(
					Object.keys(patch).map(key => [key, (data as unknown as Record<string, unknown>)[key]]),
				) as FlowRootChange['previous'],
			},
		],
	}
}

function verifyEnds(model: FlowModelInternal, env: FlowCommandEnv, input: { ends: [FlowEditEnd, FlowEditEnd]; kind?: string }) {
	const [from, to] = input.ends
	const source = model.graph.value.nodes.get(from.node)
	const target = model.graph.value.nodes.get(to.node)
	if (!source || !target) return null
	return checkConnection({
		env,
		data: model.data.value,
		graph: model.graph.value,
		source,
		target,
		sourcePort: from.port,
		targetPort: to.port,
		kind: input.kind ?? env.notation().defaultEdgeKind,
		edgeId: '',
	})
}
