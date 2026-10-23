import { onBeforeUnmount, watch } from 'vue'
import { SCENE_3D_CAMERA_PRESETS } from '@/scene3d/types/scene3d.types'
import type { Scene3DCameraPreset } from '@/scene3d/types/scene3d.types'
import type { BaseRoadmap3DExpose } from '../../types/BaseRoadmap3D.types'
import { buildRoadmapExpose } from '@components/BaseRoadmap/model/roadmapExpose'
import type { BaseRoadmapExpose } from '@components/BaseRoadmap/types/BaseRoadmap.types'
import type { Roadmap3DShellParts, Roadmap3DStageApi } from '../../types/internal/roadmap3dCompose.types'

const TWO_D_ONLY = ['expandStage', 'expandAll', 'collapseAll'] as const

export function presetOf(value: string | undefined): Scene3DCameraPreset {
	return (SCENE_3D_CAMERA_PRESETS as readonly string[]).includes(value ?? '') ? (value as Scene3DCameraPreset) : 'iso'
}

export function useRoadmap3DShell(parts: Roadmap3DShellParts, stage: Roadmap3DStageApi): BaseRoadmap3DExpose {
	const { props, model, focus, tour, view, snapshot } = parts
	watch(
		() => props.camera,
		value => value && value !== parts.preset.value && stage.camera.setPreset(value),
	)
	watch(
		() => model.selectedId.value,
		id => {
			const owner = id === null ? undefined : snapshot.value.stages.find(item => item.topics.some(topic => topic.id === id))
			if (owner && owner.id !== focus.focused.value && view.shownView.value === '3d') focus.focusStage(owner.id)
		},
	)
	watch(view.shownView, value => value === '2d' && tour.stop(true))
	watch(stage.viewport.fitted, () => focus.reapply(), { once: true })
	onBeforeUnmount(() => tour.stop(true))
	const base = Object.fromEntries(
		Object.entries(buildRoadmapExpose(model)).filter(([key]) => !(TWO_D_ONLY as readonly string[]).includes(key)),
	) as Omit<BaseRoadmapExpose, (typeof TWO_D_ONLY)[number]>
	return {
		...base,
		setCamera: preset => {
			stage.camera.setPreset(preset)
			parts.emit('update:camera', preset)
		},
		rotate: stage.camera.rotate,
		setView: view.setView,
		focusStage: id => focus.focusStage(id),
		setTour: isPlaying => (isPlaying ? tour.start() : tour.stop()),
		getModel: id => stage.content.value?.registry.getHandle(id) ?? null,
		getModels: () => stage.content.value?.registry.getHandles() ?? [],
		getSceneContext: stage.scene.getContext,
		getStage: id => model.index.value.stages.get(id) ?? null,
	}
}
