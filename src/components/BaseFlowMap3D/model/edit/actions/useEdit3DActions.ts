import { withModel3d } from './model3dPatch'
import { formatMessage } from '@/locales/state'
import { targetShifted } from '../drag/gridSnap'
import { quarterOf } from '../../data/snapshotNodes'
import { modelTitle } from '@/scene3d/models/modelTitles'
import { UI_FLOW_MAP, UI_FLOW_MAP_3D } from '@/locales/messages'
import type { FlowNode, FlowPoint } from '@components/BaseFlowMap/types/data/flowData.types'
import type {
	FlowMap3DActionParts,
	FlowMap3DEditActions,
	FlowMap3DEditResult,
	FlowMap3DPatcher,
} from '../../../types/internal/flowMap3dEdit.types'

const QUARTER = 90

function usePatcher(parts: FlowMap3DActionParts): FlowMap3DPatcher {
	const { model, controller, notify } = parts
	const nodesOf = (ids: readonly string[]): FlowNode[] => ids.flatMap(id => model.graph.value.nodes.get(id) ?? [])

	function report(result: FlowMap3DEditResult, ok: string, fail: string = UI_FLOW_MAP_3D.EDIT_FAILED): boolean {
		const reason = result.reject?.message ?? UI_FLOW_MAP_3D.EDIT_NOT_APPLIED
		notify(result.isApplied ? { text: ok, kind: 'ok' } : { text: formatMessage(fail, { reason }), kind: 'warning' })
		return result.isApplied
	}

	async function patchNodes(ids: readonly string[], build: (node: FlowNode) => Partial<FlowNode>, ok: string): Promise<boolean> {
		const nodes = nodesOf(ids)
		if (nodes.length === 0) return false
		if (nodes.length === 1) return report(await controller.updateNode(nodes[0].id, build(nodes[0])), ok)
		const label = formatMessage(UI_FLOW_MAP_3D.CMD_EDIT_NODES, { count: nodes.length })
		const result = await controller.transact(label, async () => {
			for (const node of nodes) await controller.updateNode(node.id, build(node))
		})
		return report(result, ok)
	}

	return { report, patchNodes, nodesOf }
}

function useNodeActions(patcher: FlowMap3DPatcher): Omit<FlowMap3DEditActions, 'nudge' | 'connect' | 'undo' | 'redo' | 'remove'> {
	const { patchNodes, nodesOf } = patcher
	const quarter = (node: FlowNode): number => (quarterOf(node.model3d?.rotation) + QUARTER) % 360
	return {
		async rotate(ids) {
			const [first] = nodesOf(ids)
			const text = formatMessage(UI_FLOW_MAP_3D.EDIT_ROTATED, { angle: first ? quarter(first) : 0 })
			await patchNodes(ids, node => ({ model3d: withModel3d(node, { rotation: quarter(node) }) }), text)
		},
		replaceModel(ids, choice) {
			const title = 'model' in choice ? modelTitle(choice.model) : choice.url
			const patch = 'model' in choice ? { model: choice.model, url: undefined } : { url: choice.url, model: undefined }
			const text = formatMessage(UI_FLOW_MAP_3D.EDIT_MODEL_REPLACED, { title })
			return patchNodes(ids, node => ({ model3d: withModel3d(node, patch) }), text)
		},
		async setTint(ids, tint) {
			await patchNodes(ids, node => ({ model3d: withModel3d(node, { tint: tint ?? undefined }) }), UI_FLOW_MAP_3D.EDIT_TINT_SET)
		},
		async setStatus(ids, status) {
			await patchNodes(ids, () => ({ status: status as FlowNode['status'] }), UI_FLOW_MAP_3D.EDIT_STATUS_SET)
		},
		async rename(id, label) {
			const value = label.trim()
			const [node] = nodesOf([id])
			if (value && value !== node?.label) await patchNodes([id], () => ({ label: value }), UI_FLOW_MAP_3D.EDIT_RENAMED)
		},
		async setPose(ids, patch) {
			await patchNodes(ids, node => ({ model3d: withModel3d(node, patch) }), UI_FLOW_MAP_3D.EDIT_POSE_SET)
		},
	}
}

function useMapActions(parts: FlowMap3DActionParts, patcher: FlowMap3DPatcher): Pick<FlowMap3DEditActions, 'nudge' | 'connect' | 'remove'> {
	const { controller, notify } = parts
	return {
		async remove(ids) {
			const result = await controller.remove([...ids])
			patcher.report(result, formatMessage(UI_FLOW_MAP_3D.EDIT_REMOVED, { count: ids.length }))
		},
		async nudge(ids: readonly string[], delta: FlowPoint) {
			const snapshot = parts.getSnapshot()
			const items = snapshot.nodes.filter(item => ids.includes(item.id))
			if (items.length === 0) return
			if (items.some(item => !targetShifted(item, delta, snapshot).isFree))
				return notify({ text: UI_FLOW_MAP_3D.EDIT_BLOCKED, kind: 'warning' })
			patcher.report(
				await controller.move(
					items.map(item => item.id),
					delta,
				),
				UI_FLOW_MAP_3D.EDIT_MOVED,
			)
		},
		async connect(source, target) {
			const result = await controller.connect(source, target)
			const name = (id: string): string => patcher.nodesOf([id])[0]?.label ?? id
			const text = formatMessage(UI_FLOW_MAP_3D.EDIT_LINKED, { from: name(source), to: name(target) })
			return patcher.report(result, text, UI_FLOW_MAP_3D.EDIT_LINK_FAILED)
		},
	}
}

function useHistoryActions(parts: FlowMap3DActionParts): Pick<FlowMap3DEditActions, 'undo' | 'redo'> {
	const { model, controller } = parts
	return {
		undo() {
			const { canUndo, undoLabel } = model.history.state.value
			if (!canUndo) return
			controller.undo()
			parts.announce(formatMessage(UI_FLOW_MAP.ANNOUNCE_UNDO, { label: undoLabel ?? '' }))
		},
		redo() {
			const { canRedo, redoLabel } = model.history.state.value
			if (!canRedo) return
			controller.redo()
			parts.announce(formatMessage(UI_FLOW_MAP.ANNOUNCE_REDO, { label: redoLabel ?? '' }))
		},
	}
}

export function useEdit3DActions(parts: FlowMap3DActionParts): FlowMap3DEditActions {
	const patcher = usePatcher(parts)
	return { ...useNodeActions(patcher), ...useMapActions(parts, patcher), ...useHistoryActions(parts) }
}
