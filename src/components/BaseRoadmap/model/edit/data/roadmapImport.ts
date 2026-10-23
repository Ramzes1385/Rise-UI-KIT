import { UI_ROADMAP_EDIT } from '@/locales/messages'
import { validateRoadmap } from '../../progress/roadmapValidate'
import type { RoadmapData } from '../../../types/roadmapData.types'
import type { RoadmapRejection } from '../../../types/internal/roadmapEdit.internal.types'

const BLOCKING = new Set(['CYCLE', 'DUPLICATE_ID'])

function reject(text: string): RoadmapRejection {
	return { code: 'invalid', text }
}

function parse(input: string | RoadmapData): unknown {
	if (typeof input !== 'string') return input
	try {
		return JSON.parse(input)
	} catch {
		return null
	}
}

function isShape(value: unknown): value is RoadmapData {
	const data = value as Partial<RoadmapData> | null
	return (
		typeof data === 'object' &&
		data !== null &&
		typeof data.title === 'string' &&
		typeof data.version === 'number' &&
		Array.isArray(data.stages) &&
		data.stages.every(stage => typeof stage?.id === 'string' && Array.isArray(stage.topics))
	)
}

export function importRoadmap(input: string | RoadmapData): RoadmapData | RoadmapRejection {
	const value = parse(input)
	if (!isShape(value)) return reject(UI_ROADMAP_EDIT.REJECT_IMPORT)
	const blocking = validateRoadmap(value).issues.filter(issue => BLOCKING.has(issue.code))
	return blocking.length > 0 ? reject(UI_ROADMAP_EDIT.REJECT_IMPORT_ISSUES) : JSON.parse(JSON.stringify(value))
}
