<template>
	<slot />
	<BaseNotification
		:items="toasts.items.value"
		:position="toaster?.position"
		:duration="toaster?.duration"
		:variant="toaster?.variant"
		:size-scale="toaster?.sizeScale"
		@remove="toasts.remove" />
	<!-- Оверлеи useOverlay() и useConfirm(): компонент получает props и isOpen, закрывается событием close или update:isOpen -->
	<component
		:is="overlay.component"
		v-for="overlay in overlays.entries.value"
		:key="overlay.id"
		v-bind="overlay.props"
		:is-open="overlay.isOpen"
		@update:is-open="(value: boolean) => handleOpenChange(overlay.id, value)"
		@close="(result?: unknown) => overlays.close(overlay.id, result)"
		@after-leave="overlays.destroyIfClosed(overlay.id)" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, provide, watch } from 'vue'
import { setLocale } from '@/locales/state'
import { BaseNotification } from '@components/BaseNotification'
import { TELEPORT_TARGET_KEY } from '@composables/useTeleportTarget'
import { createOverlayStore, getActiveOverlayStore, OVERLAY_STORE_KEY, setActiveOverlayStore } from '@composables/useOverlay'
import { createToastStore, getActiveToastStore, setActiveToastStore, TOAST_MAX, TOAST_STORE_KEY } from '@composables/useToast'
import type { BaseAppProps, BaseAppSlots } from '../types/BaseApp.types'

// Корень — фрагмент: BaseApp не добавляет обёртку и не влияет на раскладку приложения
defineOptions({ inheritAttrs: false })

const props = defineProps<BaseAppProps>()
defineSlots<BaseAppSlots>()

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

/** Компонент закрылся сам (update:isOpen = false) без результата */
function handleOpenChange(id: number, value: boolean): void {
	if (!value) overlays.close(id)
}

onBeforeUnmount(() => {
	// Ожидающие открытия промисы разрешаются undefined: код после await не зависает
	overlays.closeAll()
	if (getActiveToastStore() === toasts) setActiveToastStore(null)
	if (getActiveOverlayStore() === overlays) setActiveOverlayStore(null)
})
</script>
