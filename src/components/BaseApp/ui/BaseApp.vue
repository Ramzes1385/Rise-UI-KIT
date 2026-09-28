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
import { useBaseApp } from '../model/useBaseApp'
import { BaseNotification } from '@components/BaseNotification'
import type { BaseAppProps, BaseAppSlots } from '../types/BaseApp.types'

// Корень — фрагмент: BaseApp не добавляет обёртку и не влияет на раскладку приложения
defineOptions({ inheritAttrs: false })

const props = defineProps<BaseAppProps>()
defineSlots<BaseAppSlots>()

const { toasts, overlays, handleOpenChange } = useBaseApp(props)
</script>
