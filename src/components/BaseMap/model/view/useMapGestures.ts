import { UI_MAP } from '@/locales/messages'
import type { BaseMapProps } from '../../types/BaseMap.types'
import { isMacPlatform } from '@composables/interaction/useHotkeys'

const WHEEL_STEP_MS = 150

export function useMapGestures(props: BaseMapProps, actions: { zoomBy: (delta: number) => void; notify: (text: string) => void }) {
	let lastStep = 0

	function onWheel(event: WheelEvent): void {
		if (props.isScrollZoom !== false) return
		if (!event.ctrlKey && !event.metaKey) return actions.notify(isMacPlatform() ? UI_MAP.SCROLL_HINT_MAC : UI_MAP.SCROLL_HINT)
		event.preventDefault()
		if (event.timeStamp - lastStep < WHEEL_STEP_MS) return
		lastStep = event.timeStamp
		actions.zoomBy(event.deltaY < 0 ? 1 : -1)
	}

	return { onWheel }
}
