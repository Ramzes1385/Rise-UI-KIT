import { onScopeDispose } from 'vue'
import { createEditOverlay } from './editOverlay'
import type { FlowMap3DEditOverlay, FlowMap3DEditStage } from '../../../types/internal/flowMap3dEdit.types'

export function useEditOverlay(stage: FlowMap3DEditStage): () => FlowMap3DEditOverlay | null {
	let overlay: FlowMap3DEditOverlay | null = null
	onScopeDispose(() => overlay?.dispose())
	return () => {
		const content = stage.scene.content.value
		if (!content) return null
		overlay ??= createEditOverlay(stage.viewport.scene, stage.viewport.invalidate)
		const { resolve } = content.getPalette()
		overlay.setColors({
			valid: resolve('var(--rise-primary)'),
			invalid: resolve('var(--rise-error)'),
			link: resolve('var(--rise-chart-2)'),
		})
		return overlay
	}
}
