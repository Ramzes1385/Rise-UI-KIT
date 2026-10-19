import type { RoadmapData } from '../../../types/roadmapData.types'

function dependencies(data: RoadmapData, id: string): string[] {
	for (const stage of data.stages) {
		if (stage.id === id) {
			const needed =
				stage.kind === 'optional' ? [] : stage.topics.filter(topic => topic.kind !== 'optional' && topic.choice === undefined)
			return [...(stage.requires ?? []), ...needed.map(topic => topic.id)]
		}
		const topic = stage.topics.find(item => item.id === id)
		if (topic) return [...(topic.requires ?? []), ...(stage.requires ?? [])]
	}
	return []
}

function search(data: RoadmapData, from: string, goal: { id: string; seen: Set<string> }): string[] | null {
	if (from === goal.id) return [from]
	if (goal.seen.has(from)) return null
	goal.seen.add(from)
	for (const next of dependencies(data, from)) {
		const rest = search(data, next, goal)
		if (rest) return [from, ...rest]
	}
	return null
}

export function findRoadmapCycle(data: RoadmapData, id: string, target: string): string[] | null {
	const way = search(data, target, { id, seen: new Set() })
	return way ? [id, ...way] : null
}

export function wouldCreateCycle(data: RoadmapData, id: string, target: string): boolean {
	return findRoadmapCycle(data, id, target) !== null
}
