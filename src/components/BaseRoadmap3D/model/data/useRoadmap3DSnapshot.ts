import { computed } from 'vue'
import type { Ref } from 'vue'
import { buildIsland } from '../island/islandDecor'
import { resolveSeed } from '../island/islandField'
import { perRowOf, buildRoadmap3DSnapshot } from './roadmap3dSnapshot'
import type { RoadmapData } from '@components/BaseRoadmap/types/roadmapData.types'
import type { RoadmapStageView } from '@components/BaseRoadmap/types/internal/roadmapInternal.types'

export function useRoadmap3DSnapshot(source: { data: Readonly<Ref<RoadmapData>>; stageViews: Readonly<Ref<RoadmapStageView[]>> }) {
	const { data } = source
	const count = computed(() => data.value.stages.length)
	const perRow = computed(() => perRowOf(data.value))
	const seed = computed(() => resolveSeed(data.value.view3d?.seed, data.value.id ?? data.value.title))
	const island = computed(() => buildIsland(count.value, perRow.value, seed.value))
	return computed(() => buildRoadmap3DSnapshot({ views: source.stageViews.value, island: island.value, data: data.value }))
}
