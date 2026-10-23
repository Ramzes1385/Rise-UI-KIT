import { useHoverTimer } from './useHoverTimer'
import { getItemKey, hasPanel } from './megaMenuItems'
import type { useMegaMenuState } from './useMegaMenuState'
import type { MegaMenuItem, MegaMenuProps } from '../types/BaseMegaMenu.types'

export function useMegaMenuHover(props: MegaMenuProps, state: ReturnType<typeof useMegaMenuState>, isEnabled: () => boolean) {
	const timer = useHoverTimer()
	const isMouse = (event: PointerEvent): boolean => isEnabled() && event.pointerType === 'mouse'

	function scheduleClose(): void {
		if (state.openItem.value && state.source.value === 'hover') timer.later(() => state.close(), props.closeDelay)
		else timer.clearTimer()
	}

	return {
		cancelHoverTimer: timer.clearTimer,
		handleItemEnter(item: MegaMenuItem, event: PointerEvent): void {
			if (!isMouse(event)) return
			if (!hasPanel(item) || item.isDisabled) return scheduleClose()
			timer.clearTimer()
			if (state.openItem.value) state.setOpen(getItemKey(item), state.source.value)
			else timer.later(() => state.setOpen(getItemKey(item), 'hover'), props.openDelay)
		},
		handleLeave(event: PointerEvent): void {
			if (isMouse(event)) scheduleClose()
		},
		handlePanelEnter(event: PointerEvent): void {
			if (isMouse(event)) timer.clearTimer()
		},
	}
}
