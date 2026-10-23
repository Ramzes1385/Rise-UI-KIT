import { ref } from 'vue'
import { UI_PLAYER } from '../messages'
import { MEDIA_DEBUG_TABS } from '../../types/panels/MediaStatsPanel.types'
import type { MediaDebugTab } from '../../types/panels/MediaStatsPanel.types'

const TAB_LABELS: Record<MediaDebugTab, () => string> = {
	metrics: () => UI_PLAYER.DEBUG_METRICS,
	events: () => UI_PLAYER.DEBUG_EVENTS,
}

export function useMediaStatsPanel() {
	const tab = ref<MediaDebugTab>('metrics')
	return {
		tab,
		tabs: MEDIA_DEBUG_TABS.map(id => ({ id, label: TAB_LABELS[id]() })),
		selectTab(id: MediaDebugTab): void {
			tab.value = id
		},
	}
}
