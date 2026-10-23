import { computePathLayout } from '../../layout/pathLayout'
import { computeSnakeLayout } from '../../layout/snakeLayout'
import type { RoadmapLayout } from '../../../types/BaseRoadmap.types'
import { ROADMAP_AREA_GUTTER, ROADMAP_PANEL_WIDTH, ROADMAP_SIDE_MIN_WIDTH } from '../../../types/internal/roadmapView.types'

const CANVAS_LAYOUTS = { path: computePathLayout, snake: computeSnakeLayout }

export function sideMinWidth(layout: RoadmapLayout, stageCount: number, sizeScale: number): number {
	if (layout !== 'path' && layout !== 'snake') return ROADMAP_SIDE_MIN_WIDTH
	const stages = Array.from({ length: stageCount }, () => ({ topics: 0, isExpanded: false }))
	const { width } = CANVAS_LAYOUTS[layout](stages, { isRtl: false })
	return Math.max(ROADMAP_SIDE_MIN_WIDTH, ((width + ROADMAP_AREA_GUTTER + ROADMAP_PANEL_WIDTH) * sizeScale) / 100)
}
