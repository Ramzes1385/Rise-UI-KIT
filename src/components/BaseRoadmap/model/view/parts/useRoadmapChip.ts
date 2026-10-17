import { computed } from 'vue'
import { UI_ROADMAP } from '@/locales/messages'
import { ringFraction, topicMetaText, topicSrText } from '../format/roadmapText'
import type { RoadmapTopicChipEmits, RoadmapTopicChipProps } from '../../../types/internal/roadmapView.types'

function isTouchEvent(event: MouseEvent): boolean {
	return typeof PointerEvent !== 'undefined' && event instanceof PointerEvent && event.pointerType === 'touch'
}

export function useRoadmapChip(props: RoadmapTopicChipProps, emit: RoadmapTopicChipEmits) {
	return {
		modifiers: computed(() => {
			const { state, isSelected, isFiltered, isAlternative, topic } = props.view
			return [
				`base-roadmap__topic--${state.status}`,
				{
					'base-roadmap__topic--selected': isSelected,
					'base-roadmap__topic--filtered': isFiltered,
					'base-roadmap__topic--alternative': isAlternative,
					'base-roadmap__topic--optional': topic.kind === 'optional',
				},
			]
		}),
		fraction: computed(() => ringFraction(props.view.state.status, props.view.state.fraction)),
		meta: computed(() => topicMetaText(props.view)),
		srText: computed(() => topicSrText(props.view, props.missing ?? [])),
		orText: UI_ROADMAP.OR,
		recommendedText: UI_ROADMAP.RECOMMENDED,
		onSelect(): void {
			emit('select', props.view.topic.id)
		},
		onIconClick(event: MouseEvent): void {
			emit(isTouchEvent(event) ? 'select' : 'toggle', props.view.topic.id)
		},
	}
}
