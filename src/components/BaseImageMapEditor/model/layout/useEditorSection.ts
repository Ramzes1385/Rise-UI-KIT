import { computed, useId } from 'vue'
import { useExpandTransition } from '@composables/interaction/useExpandTransition'
import type { ImageMapEditorSectionProps } from '../../types/ImageMapEditorLayout.types'

export function useEditorSection(props: ImageMapEditorSectionProps) {
	const bodyId = `${useId()}-body`
	const expand = useExpandTransition()

	return {
		bodyId,
		isOpen: computed(() => props.sections.isOpen(props.id)),
		isCollapsible: computed(() => props.sections.isNarrow.value),
		hooks: computed(() => (props.sections.isReady.value ? expand : {})),
		toggle(): void {
			props.sections.toggle(props.id)
		},
	}
}
