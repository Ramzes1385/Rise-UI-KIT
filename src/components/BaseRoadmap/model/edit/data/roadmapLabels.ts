import { formatMessage } from '@/locales/state'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import { roadmapTitle } from '../changes/roadmapFind'
import { buildMove } from '../changes/roadmapCommands'
import type { RoadmapData } from '../../../types/roadmapData.types'
import type { RoadmapEditKey } from '../../../types/internal/roadmapEdit.internal.types'

export function editText(key: RoadmapEditKey, params: Record<string, string | number>): string {
	return formatMessage(UI_ROADMAP_EDIT[key], params)
}

export function moveLabel(current: RoadmapData, id: string, to: { stage?: string; index: number }): string {
	const built = buildMove(current, id, to)
	const change = Array.isArray(built) ? built[0] : undefined
	const title = roadmapTitle(current, id)
	if (change?.type !== 'move') return editText('LABEL_MOVE', { title })
	if (change.entity === 'stage') return editText('LABEL_MOVE_STAGE', { title, n: change.to + 1, m: current.stages.length })
	const stage = current.stages.find(item => item.id === change.to.stage)!
	const extra = change.from.stage === change.to.stage ? 0 : 1
	return editText('LABEL_MOVE_TOPIC', {
		title,
		stage: stage.title,
		n: change.to.index + 1,
		m: stage.topics.length + extra,
	})
}
