import { formatMessage } from '@/locales/state'
import { UI_ROADMAP_3D } from '@/locales/messages'
import type { RoadmapStage } from '@components/BaseRoadmap/types/roadmapData.types'
import type { Roadmap3DEditOptions } from '../../types/internal/roadmap3dCompose.types'

export function useRoadmap3DEdit(options: Roadmap3DEditOptions) {
	const { model, snapshot } = options
	const methods = () => model.editor.methods
	const stageOf = (id: string): RoadmapStage | undefined => model.index.value.stages.get(id)

	function uniqueId(): string {
		const taken = new Set([...model.index.value.stages.keys(), ...model.index.value.topics.keys()])
		let number = snapshot.value.stages.length + 1
		while (taken.has(`stage-${number}`)) number += 1
		return `stage-${number}`
	}

	async function shift(id: string, delta: -1 | 1): Promise<boolean> {
		const index = snapshot.value.stages.findIndex(stage => stage.id === id)
		const target = index + delta
		if (index < 0 || target < 0 || target >= snapshot.value.stages.length) return false
		const isMoved = await methods().move(id, { index: target })
		if (isMoved)
			options.announce(
				formatMessage(UI_ROADMAP_3D.LIVE_MOVED, {
					title: stageOf(id)?.title ?? '',
					n: target + 1,
					of: snapshot.value.stages.length,
				}),
			)
		return isMoved
	}

	async function add(): Promise<boolean> {
		const id = uniqueId()
		const isAdded = await methods().addStage({ id, title: UI_ROADMAP_3D.NEW_STAGE, topics: [] })
		if (isAdded) options.focusStage(id)
		return isAdded
	}

	async function setModel(id: string, patch: { model?: string; url?: string }): Promise<boolean> {
		const stage = stageOf(id)
		if (!stage) return false
		const { tint, scale } = stage.model3d ?? {}
		const next = { ...(tint ? { tint } : {}), ...(scale ? { scale } : {}), ...patch }
		return methods().update(id, { model3d: Object.keys(next).length ? next : undefined })
	}

	async function remove(id: string): Promise<boolean> {
		const isRemoved = await methods().remove([id])
		if (isRemoved) options.focusStage(null)
		return isRemoved
	}

	return { shift, add, setModel, remove, rename: (id: string, title: string) => methods().update(id, { title }) }
}
