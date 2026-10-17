import { computed, ref } from 'vue'
import { UI_ROADMAP } from '@/locales/messages'
import { computePathLayout } from './pathLayout'
import { computeSnakeLayout } from './snakeLayout'
import { useRoadmapDirection } from './useRoadmapDirection'
import { computeHorizontalLayout } from './horizontalLayout'
import { buildStageItems, collectRequirementLinks } from './roadmapLayoutItems'
import { buildRequirementLinks, createMirror, solidFraction } from './layoutShared'
import type { RoadmapCanvasProps, RoadmapCanvasLayout, RoadmapLayoutGeometry } from '../../types/internal/roadmapLayout.types'

const COMPUTERS: Record<RoadmapCanvasLayout, typeof computePathLayout> = {
	path: computePathLayout,
	snake: computeSnakeLayout,
	horizontal: computeHorizontalLayout,
}

export function useRoadmapLayout(props: RoadmapCanvasProps) {
	const rootRef = ref<HTMLElement | null>(null)
	const isRtl = useRoadmapDirection(rootRef)
	const geometry = computed<RoadmapLayoutGeometry>(() =>
		COMPUTERS[props.kind](
			props.stages.map(view => ({ topics: view.topics.length, isExpanded: view.isExpanded })),
			{ isRtl: isRtl.value },
		),
	)

	return {
		rootRef,
		geometry,
		items: computed(() => buildStageItems(props.stages, geometry.value)),
		links: computed(() =>
			buildRequirementLinks(geometry.value, collectRequirementLinks(props.stages), createMirror(geometry.value.width, isRtl.value)),
		),
		solid: computed(() => solidFraction(props.progress, geometry.value.fractions)),
		canvasStyle: computed(() => ({ '--rl-width': geometry.value.width, '--rl-height': geometry.value.height })),
		viewBox: computed(() => `0 0 ${geometry.value.width} ${geometry.value.height}`),
		startStyle: computed(() => ({ '--rl-x': geometry.value.start.x, '--rl-y': geometry.value.start.y })),
		goalStyle: computed(() => ({ '--rl-x': geometry.value.goal.x, '--rl-y': geometry.value.goal.y })),
		startText: UI_ROADMAP.START,
	}
}
