import { clampPerRow } from '../island/roadPath'
import type { Model3DTone } from '@/scene3d/types/model3d.types'
import type { IslandModel } from '../../types/roadmap3dIsland.types'
import type { Model3DSelection } from '@/scene3d/types/internal/model3dInternal.types'
import { createRoadTable, roadProgress, stageRoadPositions } from '../island/roadMeasure'
import type { RoadmapStageView } from '@components/BaseRoadmap/types/internal/roadmapInternal.types'
import type { Roadmap3DSnapshot, Roadmap3DStageItem } from '../../types/internal/roadmap3dInternal.types'
import type { RoadmapData, RoadmapStage, RoadmapStageStatus } from '@components/BaseRoadmap/types/roadmapData.types'

const CHART_COUNT = 6
const SMALL_PATH = 6
const MEDIUM_PATH = 12

export function defaultPerRow(stageCount: number): number {
	if (stageCount <= SMALL_PATH) return 2
	return stageCount <= MEDIUM_PATH ? 3 : 4
}

export function perRowOf(data: RoadmapData): number {
	const requested = data.view3d?.perRow
	return clampPerRow(typeof requested === 'number' ? requested : defaultPerRow(data.stages.length))
}

export function stageTint(stage: RoadmapStage, index: number): string {
	return stage.model3d?.tint ?? `var(--rise-chart-${(index % CHART_COUNT) + 1})`
}

function toneOf(status: RoadmapStageStatus): Model3DTone {
	return status === 'locked' ? 'muted' : 'none'
}

function percentOf(view: RoadmapStageView): number {
	if (view.total > 0) return Math.round((view.done / view.total) * 100)
	return 0
}

function selectionOf(view: RoadmapStageView): Model3DSelection {
	const { stage } = view
	const tags = [...new Set(view.topics.flatMap(item => item.topic.tags ?? []))]
	const source = stage as unknown as Record<string, unknown>
	const own = stage.model3d
	const model3d = own && (own.url || own.model) ? { model: own.model, url: own.url } : undefined
	return { node: { id: stage.id, title: stage.title, tags, tone: toneOf(view.status), source }, model3d }
}

function stageItem(view: RoadmapStageView, island: IslandModel): Roadmap3DStageItem {
	const place = island.layout.stages[view.index]!
	return {
		id: view.stage.id,
		index: view.index,
		title: view.stage.title,
		status: view.status,
		percent: percentOf(view),
		done: view.done,
		total: view.total,
		hours: view.hours,
		tint: stageTint(view.stage, view.index),
		selection: selectionOf(view),
		position: { x: place.x, z: -place.z },
		topics: view.topics.map(item => ({
			id: item.topic.id,
			title: item.topic.title,
			status: item.state.status,
			isAlternative: item.isAlternative,
			isOptional: item.topic.kind === 'optional',
		})),
	}
}

function progressOf(views: readonly RoadmapStageView[], positions: number[], currentIndex: number): number {
	if (views.length === 0) return 0
	if (currentIndex < 0) return views.every(view => view.status === 'done') ? 1 : 0
	const current = views[currentIndex]
	return roadProgress(positions, currentIndex, current.done / current.total)
}

export function buildRoadmap3DSnapshot(input: {
	views: readonly RoadmapStageView[]
	island: IslandModel
	data: RoadmapData
}): Roadmap3DSnapshot {
	const { views, island, data } = input
	const table = createRoadTable(island.layout.road)
	const positions = stageRoadPositions(island.layout.road, island.layout.stages, table)
	const currentIndex = views.findIndex(view => view.status === 'current')
	return {
		stages: views.map(view => stageItem(view, island)),
		island,
		table,
		positions,
		progress: progressOf(views, positions, currentIndex),
		currentIndex,
		hasCar: data.view3d?.hasCar !== false && views.length > 0,
		goal: data.goal ?? null,
	}
}
