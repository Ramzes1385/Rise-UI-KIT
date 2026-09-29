<template>
	<svg class="base-media-player__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
		<path :d="MEDIA_ICONS[name]" />
	</svg>
</template>

<script setup lang="ts">
import { MEDIA_ICONS } from '../types/MediaIcon.types'
import type { MediaIconProps } from '../types/MediaIcon.types'

defineProps<MediaIconProps>()
</script>
