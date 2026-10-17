import type { Component } from 'vue'
import RoadmapList from './RoadmapList.vue'
import RoadmapPath from './RoadmapPath.vue'
import RoadmapSnake from './RoadmapSnake.vue'
import RoadmapHorizontal from './RoadmapHorizontal.vue'
import type { RoadmapLayout } from '../../types/BaseRoadmap.types'

export const ROADMAP_LAYOUT_COMPONENTS: Partial<Record<RoadmapLayout, Component>> = {
	list: RoadmapList,
	path: RoadmapPath,
	snake: RoadmapSnake,
	horizontal: RoadmapHorizontal,
}
