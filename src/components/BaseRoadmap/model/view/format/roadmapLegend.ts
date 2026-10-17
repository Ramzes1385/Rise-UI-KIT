import { UI_ROADMAP } from '@/locales/messages'
import type { RoadmapLegendItem } from '../../../types/internal/roadmapView.types'

export function legendItems(): RoadmapLegendItem[] {
	return [
		{ key: 'done', status: 'done', fraction: 1, label: UI_ROADMAP.TOPIC_DONE },
		{ key: 'in-progress', status: 'in-progress', fraction: 0.25, label: UI_ROADMAP.TOPIC_IN_PROGRESS },
		{ key: 'available', status: 'available', fraction: 0, label: UI_ROADMAP.TOPIC_AVAILABLE },
		{ key: 'locked', status: 'locked', fraction: 0, label: UI_ROADMAP.TOPIC_LOCKED },
	]
}
