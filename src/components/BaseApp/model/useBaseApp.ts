/** Composable: логика BaseApp — свои хранилища уведомлений и оверлеев, язык и цель телепорта */
import { onBeforeUnmount, provide, watch } from 'vue'
import { setLocale } from '@/locales/state'
import { TELEPORT_TARGET_KEY } from '@composables/useTeleportTarget'
import { createOverlayStore, getActiveOverlayStore, OVERLAY_STORE_KEY, setActiveOverlayStore } from '@composables/useOverlay'
import { createToastStore, getActiveToastStore, setActiveToastStore, TOAST_MAX, TOAST_STORE_KEY } from '@composables/useToast'
import type { BaseAppProps } from '../types/BaseApp.types'

export function useBaseApp(props: BaseAppProps) {
	// У каждого BaseApp свои хранилища: вложенный BaseApp не показывает уведомления внешнего второй раз
	const toasts = createToastStore({ max: () => props.toaster?.max ?? TOAST_MAX })
	const overlays = createOverlayStore()

	// Язык ставится до создания дочерних компонентов: они сразу рендерят строки на нём
	watch(
		() => props.locale,
		locale => {
			if (locale) setLocale(locale)
		},
		{ immediate: true },
	)

	// Цель телепорта для компонентов внутри BaseApp и его уведомлений. Задаётся при монтировании
	if (props.teleportTo) provide(TELEPORT_TARGET_KEY, props.teleportTo)

	provide(TOAST_STORE_KEY, toasts)
	provide(OVERLAY_STORE_KEY, overlays)
	setActiveToastStore(toasts)
	setActiveOverlayStore(overlays)

	onBeforeUnmount(() => {
		// Ожидающие открытия промисы разрешаются undefined: код после await не зависает
		overlays.closeAll()
		if (getActiveToastStore() === toasts) setActiveToastStore(null)
		if (getActiveOverlayStore() === overlays) setActiveOverlayStore(null)
	})

	return {
		toasts,
		overlays,
		/** Компонент закрылся сам (update:isOpen = false) без результата */
		handleOpenChange(id: number, value: boolean): void {
			if (!value) overlays.close(id)
		},
	}
}
