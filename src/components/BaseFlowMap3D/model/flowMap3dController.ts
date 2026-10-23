import type { FlowMap3DController } from '../types/BaseFlowMap3D.types'
import type { FlowMap3DControllerParts } from '../types/internal/flowMap3dInternal.types'

export function createFlowMap3DController(parts: FlowMap3DControllerParts): FlowMap3DController {
	const registry = () => parts.getContent()?.nodes.registry
	return {
		...parts.base,
		setCamera: preset => parts.camera.setPreset(preset),
		rotate: step => parts.camera.rotate(step),
		flyTo: id => parts.flyTo(id),
		setView: parts.setView,
		setLayered: parts.setLayered,
		getModel: id => registry()?.getHandle(id) ?? null,
		getModels: () => registry()?.getHandles() ?? [],
		getSceneContext: parts.getContext,
	}
}
