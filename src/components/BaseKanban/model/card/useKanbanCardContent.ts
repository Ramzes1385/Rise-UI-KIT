import { computed } from 'vue'
import { cardMeta } from './kanbanCardMeta'
import type { KanbanCardContentProps } from '../../types/KanbanParts.types'

export function useKanbanCardContent(props: KanbanCardContentProps) {
	return {
		meta: computed(() => cardMeta(props.card, { today: props.today, isDone: props.isDone })),
		assignees: computed(() => (props.card.assignees ?? []).map(person => ({ name: person.name, src: person.avatar }))),
		coverStyle: computed(() => {
			if (props.card.coverImage) return { backgroundImage: `url("${props.card.coverImage}")` }
			return props.card.coverColor ? { backgroundColor: props.card.coverColor } : null
		}),
	}
}
