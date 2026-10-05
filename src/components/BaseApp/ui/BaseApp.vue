<template>
	<Transition name="base-app-loading-bar">
		<div
			v-if="loadingBar.isVisible.value"
			:class="loadingBar.classes.value"
			:style="loadingBar.styles.value"
			role="progressbar"
			:aria-label="loadingBar.label.value" />
	</Transition>
	<slot />
	<BaseNotification
		:items="toasts.items.value"
		:position="toaster?.position"
		:duration="toaster?.duration"
		:variant="toaster?.variant"
		:size-scale="toaster?.sizeScale"
		@remove="toasts.remove" />
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
import '../styles/BaseApp.style.scss'
import { useBaseApp } from '../model/useBaseApp'
import { BaseNotification } from '@components/BaseNotification'
import type { BaseAppProps, BaseAppSlots } from '../types/BaseApp.types'

defineOptions({ inheritAttrs: false })

const props = defineProps<BaseAppProps>()
defineSlots<BaseAppSlots>()

const { toasts, overlays, loadingBar, handleOpenChange } = useBaseApp(props)
</script>
