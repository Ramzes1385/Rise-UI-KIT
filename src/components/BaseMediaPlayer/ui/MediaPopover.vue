<template>
	<div ref="rootRef" class="base-media-player__popover-anchor" @keydown="onKeydown" @focusout="onFocusOut">
		<slot :is-open="isOpen" :toggle="toggle" />
		<Transition name="base-media-player__popover">
			<div v-if="isOpen" class="base-media-player__popover" :class="`base-media-player__popover--${position}`">
				<slot name="panel" :close="close" />
			</div>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import { useMediaPopover } from '../model/useMediaPopover'
import type { MediaPopoverProps, MediaPopoverSlots } from '../types/MediaMenu.types'

withDefaults(defineProps<MediaPopoverProps>(), { position: 'top-end' })
defineSlots<MediaPopoverSlots>()

const { rootRef, isOpen, close, toggle, onKeydown, onFocusOut } = useMediaPopover()
</script>
