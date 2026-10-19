import { computed } from 'vue'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import type { SegmentedOption } from '@components/BaseSegmented'
import type { BaseRoadmapEmits, RoadmapMode } from '../../../types/BaseRoadmap.types'
import type { RoadmapModel, RoadmapProps } from '../../../types/internal/roadmapView.types'

const MODE_TEXT: Record<RoadmapMode, () => string> = {
	view: () => UI_ROADMAP_EDIT.MODE_VIEW,
	edit: () => UI_ROADMAP_EDIT.MODE_EDIT,
	review: () => UI_ROADMAP_EDIT.MODE_REVIEW,
}

export function useRoadmapModes(props: RoadmapProps, emit: BaseRoadmapEmits, model: RoadmapModel) {
	return {
		hasModes: computed(() => (props.modes?.length ?? 0) > 0),
		modeOptions: computed<SegmentedOption[]>(() => (props.modes ?? []).map(mode => ({ value: mode, label: MODE_TEXT[mode]() }))),
		changeMode: (value: string | number): void => model.setMode(value as RoadmapMode),
		publish: (): void => emit('publish', model.data.value),
	}
}
