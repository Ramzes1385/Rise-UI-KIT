import { roadmapTitle } from './roadmapFind'
import { formatMessage } from '@/locales/state'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import type { RoadmapData } from '../../../types/roadmapData.types'
import type { RoadmapBuilt, RoadmapRejection } from '../../../types/internal/roadmapEdit.internal.types'

export function isRejection(built: RoadmapBuilt): built is RoadmapRejection {
	return !Array.isArray(built)
}

export function rejectUnknown(id: string): RoadmapRejection {
	return { code: 'unknown', text: formatMessage(UI_ROADMAP_EDIT.REJECT_UNKNOWN, { id }) }
}

export function rejectDuplicate(id: string): RoadmapRejection {
	return { code: 'duplicate', text: formatMessage(UI_ROADMAP_EDIT.REJECT_DUPLICATE, { id }) }
}

export function rejectInvalid(): RoadmapRejection {
	return { code: 'invalid', text: UI_ROADMAP_EDIT.REJECT_INVALID }
}

export function rejectCycle(data: RoadmapData, cycle: string[]): RoadmapRejection {
	const path = cycle.map(id => roadmapTitle(data, id)).join(' → ')
	return { code: 'cycle', text: formatMessage(UI_ROADMAP_EDIT.REJECT_CYCLE, { path }) }
}
