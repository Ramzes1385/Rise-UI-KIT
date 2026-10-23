import { ref, watch } from 'vue'
import type { RoadmapStageEditEmit, RoadmapStageEditProps } from '../../types/internal/roadmap3dUi.types'

export function useRoadmapStageEdit(props: RoadmapStageEditProps, emit: RoadmapStageEditEmit) {
	const draft = ref(props.title)
	let url = props.customUrl

	watch(
		() => props.title,
		value => (draft.value = value),
	)

	return {
		draft,
		setDraft: (value: string | number | null): void => {
			draft.value = String(value ?? '')
		},
		commitTitle: (): void => {
			const title = draft.value.trim()
			if (title && title !== props.title) emit('rename', title)
			else draft.value = props.title
		},
		onUrl: (value: string | number | null): void => {
			url = String(value ?? '').trim()
			if (url !== props.customUrl) emit('url', url)
		},
	}
}
