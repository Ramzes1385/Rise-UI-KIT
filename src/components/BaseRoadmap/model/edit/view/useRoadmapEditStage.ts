import { computed, nextTick } from 'vue'
import { UI_PLURAL } from '@/locales/messages'
import { stageMenu } from '../data/roadmapStageMenu'
import { useRoadmapEditorContext } from './roadmapEditorContext'
import { UI_ROADMAP, UI_ROADMAP_EDIT } from '@/locales/messages'
import { formatMessage, formatNumber, pluralize } from '@/locales/state'
import type { RoadmapEditStageProps } from '../../../types/internal/roadmapEditView.types'

export function useRoadmapEditStage(props: RoadmapEditStageProps) {
	const { edit, editor, sort, isDisabled } = useRoadmapEditorContext()
	const select = (): void => editor.inspector.select(props.stage.id)
	const renameStage = (): void => {
		select()
		void nextTick(editor.focusTitle)
	}
	const menu = computed(() => stageMenu(props.stage, { edit, editor, rename: renameStage }))
	const hours = computed(() => props.stage.topics.reduce((sum, topic) => sum + (topic.hours ?? 0), 0))
	return {
		isDisabled,
		menu,
		isSelected: computed(() => editor.inspector.targetId.value === props.stage.id),
		isOpen: computed(() => editor.isExpanded(props.stage.id)),
		isGrabbed: computed(() => sort.stages.grabbedId.value === props.stage.id),
		isPlaceholder: computed(() => sort.stages.drag.value?.item.id === props.stage.id),
		panelId: computed(() => `${props.stage.id}-edit-topics`),
		numberText: computed(() => formatMessage(UI_ROADMAP.STAGE_NUMBER, { n: props.index + 1 })),
		metaText: computed(() => {
			const topics = pluralize(UI_PLURAL.ROADMAP_TOPICS, props.stage.topics.length)
			return hours.value > 0 ? `${topics} · ${formatMessage(UI_ROADMAP.HOURS, { n: formatNumber(hours.value) })}` : topics
		}),
		handleLabel: computed(() => formatMessage(UI_ROADMAP_EDIT.HANDLE_STAGE, { title: props.stage.title })),
		actionsLabel: computed(() => formatMessage(UI_ROADMAP_EDIT.STAGE_ACTIONS, { title: props.stage.title })),
		toggleLabel: computed(() => formatMessage(UI_ROADMAP_EDIT.STAGE_TOPICS, { title: props.stage.title })),
		select,
		toggle: (): void => editor.toggleStage(props.stage.id),
		addTopic: (): void => void editor.addTopic(props.stage.id),
		onKeydown: (event: KeyboardEvent): void => sort.onHandleKeydown(event, { kind: 'stage', value: props.stage }),
		onPointerDown: (event: PointerEvent): void => sort.stages.handlePointerDown(event, props.stage),
		onClick: (): void => {
			if (!sort.stages.consumeClick()) editor.activate(props.stage.id)
		},
	}
}
