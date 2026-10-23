import { computed } from 'vue'
import { UI_ROADMAP } from '@/locales/messages'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import { formatMessage, formatNumber } from '@/locales/state'
import { useRoadmapEditorContext } from './roadmapEditorContext'
import type { RoadmapEditTopicProps } from '../../../types/internal/roadmapEditView.types'

export function useRoadmapEditTopic(props: RoadmapEditTopicProps) {
	const { editor, sort, isDisabled } = useRoadmapEditorContext()
	const { stage } = props
	return {
		isDisabled,
		isSelected: computed(() => editor.inspector.targetId.value === props.topic.id),
		isGrabbed: computed(() => sort.topics.grabbedId.value === props.topic.id),
		isPlaceholder: computed(() => sort.topics.drag.value?.item.id === props.topic.id),
		isLinkSource: computed(() => editor.linkFrom.value === props.topic.id),
		isAlternative: computed(() => {
			const group = props.topic.choice
			return (
				group !== undefined && props.stage.topics.findIndex(item => item.choice === group) < props.stage.topics.indexOf(props.topic)
			)
		}),
		hoursText: computed(() => (props.topic.hours ? formatMessage(UI_ROADMAP.HOURS, { n: formatNumber(props.topic.hours) }) : '')),
		handleLabel: computed(() => formatMessage(UI_ROADMAP_EDIT.HANDLE_TOPIC, { title: props.topic.title })),
		onKeydown: (event: KeyboardEvent): void => sort.onHandleKeydown(event, { kind: 'topic', value: props.topic }),
		onPointerDown: (event: PointerEvent): void => sort.topics.handlePointerDown(event, props.topic),
		onClick: (): void => {
			if (!sort.topics.consumeClick()) editor.activate(props.topic.id)
		},
		stageTitle: stage.title,
	}
}
