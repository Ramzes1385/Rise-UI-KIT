import { computed } from 'vue'
import { useDetailLod } from './useDetailLod'
import { useScenarioToken } from './scenario/useScenarioToken'
import type { FlowMap3DStageMotionParts } from '../../types/internal/flowMap3dMotion.types'

export function useStageMotion(parts: FlowMap3DStageMotionParts) {
	const { options, viewport, built, size } = parts
	viewport.onFrame(
		useDetailLod({
			content: built,
			getCamera: () => viewport.camera.value,
			getSize: size,
			getCell: () => options.snapshot.value.cell.width,
			getQuality: options.getQuality,
			invalidate: viewport.invalidate,
		}),
	)
	useScenarioToken({ model: options.model, content: built, invalidate: viewport.invalidate, isReducedMotion: options.isReducedMotion })
	return computed(() => built.value?.layout.layers.flags ?? [])
}
