import type { Component } from 'vue'
import RoadmapList from './RoadmapList.vue'
import type { RoadmapLayout } from '../../types/BaseRoadmap.types'

export const ROADMAP_LAYOUT_COMPONENTS: Partial<Record<RoadmapLayout, Component>> = {
	list: RoadmapList,
}
