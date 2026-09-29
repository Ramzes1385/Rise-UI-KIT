import { setLocale } from '@/locales/state'
import { onBeforeUnmount, provide, watch } from 'vue'
import type { BaseAppProps } from '../types/BaseApp.types'
import { TELEPORT_TARGET_KEY } from '@composables/app/useTeleportTarget'
import { createToastStore, getActiveToastStore, setActiveToastStore, TOAST_MAX, TOAST_STORE_KEY } from '@composables/app/useToast'
import { createOverlayStore, getActiveOverlayStore, OVERLAY_STORE_KEY, setActiveOverlayStore } from '@composables/overlay/useOverlay'

export function useBaseApp(props: BaseAppProps) {
	const toasts = createToastStore({ max: () => props.toaster?.max ?? TOAST_MAX })
	const overlays = createOverlayStore()

	watch(
		() => props.locale,
		locale => {
			if (locale) setLocale(locale)
		},
		{ immediate: true },
	)

	if (props.teleportTo) provide(TELEPORT_TARGET_KEY, props.teleportTo)

	provide(TOAST_STORE_KEY, toasts)
	provide(OVERLAY_STORE_KEY, overlays)
	setActiveToastStore(toasts)
	setActiveOverlayStore(overlays)

	onBeforeUnmount(() => {
		overlays.closeAll()
		if (getActiveToastStore() === toasts) setActiveToastStore(null)
		if (getActiveOverlayStore() === overlays) setActiveOverlayStore(null)
	})

	return {
		toasts,
		overlays,
		handleOpenChange(id: number, value: boolean): void {
			if (!value) overlays.close(id)
		},
	}
}
