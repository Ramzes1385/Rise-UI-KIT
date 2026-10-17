import { computed } from 'vue'
import { UI_ROADMAP } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { stageMetaText, stageStatusText } from '../format/roadmapText'
import type { RoadmapStageHeaderEmits, RoadmapStageHeaderProps } from '../../../types/internal/roadmapView.types'

export function useRoadmapStageHeader(props: RoadmapStageHeaderProps, emit: RoadmapStageHeaderEmits) {
	return {
		progress: computed(() => (props.view.total ? props.view.done / props.view.total : 0)),
		numberText: computed(() => formatMessage(UI_ROADMAP.STAGE_NUMBER, { n: props.view.index + 1 })),
		statusText: computed(() => stageStatusText(props.view.status)),
		metaText: computed(() => stageMetaText(props.view, props.unlockTitle)),
		hereText: UI_ROADMAP.STAGE_HERE,
		onToggle(): void {
			if (!props.isStatic) emit('toggle', props.view.stage.id)
		},
	}
}
