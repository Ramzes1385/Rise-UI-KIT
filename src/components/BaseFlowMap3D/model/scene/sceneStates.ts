import type { Model3DState } from '@/scene3d/types/model3d.types'
import type { FlowMap3DContent, FlowMap3DSceneStates } from '../../types/internal/flowMap3dInternal.types'

function stateOf(id: string, states: FlowMap3DSceneStates): Model3DState {
	return {
		isHovered: states.hover === id,
		isSelected: states.selection.has(id),
		isActive: states.isPlaying && states.active.has(id),
		isDimmed: states.highlight !== null && !states.highlight.has(id),
		isFocused: states.focus === id,
		tone: states.tones.get(id) ?? 'none',
		isDragging: false,
		isInvalid: false,
	}
}

export function applyStates(content: FlowMap3DContent, states: FlowMap3DSceneStates): void {
	const { registry, entries } = content.nodes
	entries.forEach((_entry, id) => registry.setState(id, stateOf(id, states)))
	content.setHighlight(states.highlight)
	content.particles.setTones(states.tones)
}
