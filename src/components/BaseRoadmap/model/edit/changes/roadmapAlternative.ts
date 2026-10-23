import { buildUpdate } from './roadmapCommands'
import { findRoadmapEntity } from './roadmapFind'
import type { RoadmapData } from '../../../types/roadmapData.types'
import type { RoadmapChange } from '../../../types/roadmapEdit.types'
import type { RoadmapBuilt } from '../../../types/internal/roadmapEdit.internal.types'

function merged(parts: RoadmapBuilt[]): RoadmapChange[] {
	return parts.flatMap(part => part as RoadmapChange[])
}

export function buildAlternative(data: RoadmapData, id: string, isOn: boolean): RoadmapBuilt {
	const found = findRoadmapEntity(data, id)
	if (!found?.topic) return []
	const siblings = found.stage.topics
	if (isOn) {
		const before = siblings[found.topicIndex - 1]
		if (!before) return []
		const group = before.choice ?? `choice-${found.stage.id}`
		return merged([
			before.choice === undefined ? buildUpdate(data, before.id, { choice: group }) : [],
			buildUpdate(data, id, { choice: group }),
		])
	}
	const rest = siblings.filter(item => item.choice === found.topic?.choice && item.id !== id)
	const cleared = rest.length === 1 ? [rest[0].id] : []
	return merged([id, ...cleared].map(target => buildUpdate(data, target, { choice: undefined })))
}
