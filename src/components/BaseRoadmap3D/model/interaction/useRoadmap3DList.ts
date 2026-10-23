import { computed } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_ROADMAP, UI_ROADMAP_3D } from '@/locales/messages'
import type { Roadmap3DListOptions } from '../../types/internal/roadmap3dCompose.types'
import { topicStatusText } from '@components/BaseRoadmap/model/view/format/roadmapText'

export function useRoadmap3DList(options: Roadmap3DListOptions) {
	return computed(() =>
		options.snapshot.value.stages.map(stage => ({
			id: stage.id,
			label: formatMessage(UI_ROADMAP_3D.LIST_STAGE, {
				n: stage.index + 1,
				title: stage.title,
				status:
					stage.status === 'locked'
						? UI_ROADMAP.STAGE_LOCKED
						: formatMessage(UI_ROADMAP.SUMMARY_PERCENT, { percent: stage.percent }),
			}),
			isCurrent: stage.status === 'current',
			topics: stage.topics.map(topic => ({ id: topic.id, label: `${topic.title}, ${topicStatusText(topic.status).toLowerCase()}` })),
		})),
	)
}
