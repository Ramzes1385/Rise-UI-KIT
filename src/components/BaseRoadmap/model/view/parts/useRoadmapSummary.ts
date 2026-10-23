import { computed } from 'vue'
import { UI_ROADMAP } from '@/locales/messages'
import { summaryDoneText } from '../format/roadmapText'
import { formatMessage, formatNumber } from '@/locales/state'
import type { RoadmapSummaryEmits, RoadmapSummaryProps } from '../../../types/internal/roadmapView.types'

export function useRoadmapSummary(props: RoadmapSummaryProps, emit: RoadmapSummaryEmits) {
	return {
		doneText: computed(() => summaryDoneText(props.summary.done, props.summary.total)),
		percentText: computed(() => formatMessage(UI_ROADMAP.SUMMARY_PERCENT, { percent: formatNumber(props.summary.percent) })),
		leftText: computed(() =>
			props.summary.hoursLeft > 0
				? formatMessage(UI_ROADMAP.SUMMARY_HOURS, { hours: formatNumber(Math.round(props.summary.hoursLeft)) })
				: '',
		),
		continueText: computed(() => formatMessage(UI_ROADMAP.CONTINUE, { topic: props.summary.continueTitle ?? '' })),
		label: UI_ROADMAP.SUMMARY_LABEL,
		onContinue(): void {
			emit('continue')
		},
	}
}
