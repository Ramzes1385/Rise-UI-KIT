import type { RoadmapLayoutStageInput } from '../../../types/internal/roadmapLayout.types'

interface InputsOptions {
	count: number
	topics?: number
	isExpanded?: boolean
}

export function stageInputs({ count, topics = 0, isExpanded = false }: InputsOptions): RoadmapLayoutStageInput[] {
	return Array.from({ length: count }, () => ({ topics, isExpanded }))
}

export function pathNumbers(path: string): number[] {
	return (path.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number)
}

export function mirroredPath({ path, width }: { path: string; width: number }): number[] {
	return pathNumbers(path).map((value, index) => (index % 2 === 0 ? Math.round((width - value) * 100) / 100 : value))
}
