import { computed } from 'vue'
import { UI_ROADMAP } from '@/locales/messages'
import type { BadgeStatus } from '@components/BaseBadge'
import { formatMessage, formatNumber } from '@/locales/state'
import type { DropdownMenuItems } from '@components/BaseDropdownMenu'
import { formatHours, subtopicsText, topicKindText, topicStatusText } from '../format/roadmapText'
import type { RoadmapTopicPanelEmits, RoadmapTopicPanelProps } from '../../../types/internal/roadmapView.types'

const BADGE_STATUS: Record<string, BadgeStatus> = { done: 'success', 'in-progress': 'primary', skipped: 'warning' }

export function useRoadmapTopicPanel(props: RoadmapTopicPanelProps, emit: RoadmapTopicPanelEmits) {
	const status = computed(() => props.view.state.status)
	const isLocked = computed(() => status.value === 'locked')
	const isDone = computed(() => status.value === 'done')
	const percent = computed(() => Math.round(props.view.state.fraction * 100))
	const hasProgress = computed(() => status.value === 'done' || status.value === 'in-progress' || status.value === 'skipped')

	return {
		isLocked,
		isDone,
		percent,
		percentText: computed(() => formatMessage(UI_ROADMAP.SUMMARY_PERCENT, { percent: formatNumber(percent.value) })),
		statusText: computed(() => topicStatusText(status.value)),
		badgeStatus: computed((): BadgeStatus => BADGE_STATUS[status.value] ?? 'neutral'),
		isMarkDisabled: computed(() => isLocked.value || props.isDisabled || props.isBusy),
		markText: computed(() => (isDone.value ? UI_ROADMAP.MARK_UNDONE : UI_ROADMAP.MARK_DONE)),
		subtopicsText: computed(() => subtopicsText(props.view.state.done, props.view.state.total)),
		stageText: computed(() => formatMessage(UI_ROADMAP.PANEL_STAGE, { n: props.stage.index + 1, title: props.stage.stage.title })),
		hoursText: computed(() => (props.view.topic.hours === undefined ? '' : formatHours(props.view.topic.hours))),
		kindText: computed(() => topicKindText(props.view.topic, props.view.isAlternative)),
		isChecked: (subtopicId: string): boolean => isDone.value || props.doneSubtopics.includes(subtopicId),
		menuItems: computed((): DropdownMenuItems => [
			{
				label: UI_ROADMAP.SKIP,
				isDisabled: isLocked.value || status.value === 'skipped' || props.isDisabled || props.isBusy,
				onSelect: () => emit('set-status', props.view.topic.id, 'skipped'),
			},
			{
				label: UI_ROADMAP.RESET,
				isDisabled: !hasProgress.value || props.isDisabled || props.isBusy,
				onSelect: () => emit('set-status', props.view.topic.id, null),
			},
		]),
		onToggleSubtopic(subtopicId: string, isDoneValue: boolean): void {
			emit('toggle-subtopic', props.view.topic.id, subtopicId, isDoneValue)
		},
		onMark(): void {
			emit('set-status', props.view.topic.id, isDone.value ? null : 'done')
		},
	}
}
