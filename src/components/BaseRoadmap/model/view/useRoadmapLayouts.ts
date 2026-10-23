import { computed, ref, watch } from 'vue'
import { UI_ROADMAP } from '@/locales/messages'
import { ROADMAP_LAYOUTS } from '../../types/BaseRoadmap.types'
import type { SegmentedOption } from '@components/BaseSegmented'
import { ROADMAP_LAYOUT_COMPONENTS } from '../../ui/layouts/roadmapLayouts'
import type { BaseRoadmapProps, RoadmapLayout } from '../../types/BaseRoadmap.types'

const FALLBACK_LAYOUT: RoadmapLayout = 'list'

function layoutLabel(layout: RoadmapLayout): string {
	const labels: Record<RoadmapLayout, string> = {
		path: UI_ROADMAP.LAYOUT_PATH,
		snake: UI_ROADMAP.LAYOUT_SNAKE,
		list: UI_ROADMAP.LAYOUT_LIST,
		horizontal: UI_ROADMAP.LAYOUT_HORIZONTAL,
	}
	return labels[layout]
}

function isRegistered(layout: RoadmapLayout): boolean {
	return ROADMAP_LAYOUT_COMPONENTS[layout] !== undefined
}

export function useRoadmapLayouts(props: BaseRoadmapProps, isNarrow: () => boolean) {
	const chosen = ref<RoadmapLayout | null>(null)
	watch(
		() => props.layout,
		() => {
			chosen.value = null
		},
	)

	const requested = computed((): RoadmapLayout => {
		if (isNarrow() && props.narrowLayout) return props.narrowLayout
		return chosen.value ?? props.layout ?? 'path'
	})
	const layout = computed((): RoadmapLayout => (isRegistered(requested.value) ? requested.value : FALLBACK_LAYOUT))
	const options = computed((): SegmentedOption[] =>
		ROADMAP_LAYOUTS.filter(isRegistered).map(value => ({ value, label: layoutLabel(value) })),
	)

	return {
		layout,
		layoutComponent: computed(() => ROADMAP_LAYOUT_COMPONENTS[layout.value]),
		layoutOptions: options,
		hasLayoutSwitch: computed(() => Boolean(props.hasLayoutSwitch) && options.value.length > 1 && !(isNarrow() && props.narrowLayout)),
		setLayout(value: string | number): void {
			chosen.value = value as RoadmapLayout
		},
	}
}
