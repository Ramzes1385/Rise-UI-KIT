import type { RoadmapCommentThread } from '../../../types/roadmapEdit.types'
export function nextRoadmapReviewId(prefix: string, used: Iterable<string>): string {
	const taken = new Set(used)
	let index = taken.size + 1
	while (taken.has(`${prefix}${index}`)) index += 1
	return `${prefix}${index}`
}
export function roadmapThreadsByTarget(threads: readonly RoadmapCommentThread[]): Map<string, RoadmapCommentThread[]> {
	const map = new Map<string, RoadmapCommentThread[]>()
	for (const thread of threads) {
		const key = `${thread.target.entity}:${thread.target.id}`
		map.set(key, [...(map.get(key) ?? []), thread])
	}
	return map
}
