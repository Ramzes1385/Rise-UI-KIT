<template>
	<svg
		class="base-media-player__volume-icon"
		:class="{ 'base-media-player__volume-icon--silent': isSilent }"
		viewBox="0 0 24 24"
		aria-hidden="true"
		focusable="false">
		<path d="M11 5 6 9H2v6h4l5 4V5z" />
		<path class="base-media-player__volume-arc" :style="nearArcStyle" d="M15.54 8.46a5 5 0 0 1 0 7.07" />
		<path class="base-media-player__volume-arc" :style="farArcStyle" d="M19.07 4.93a10 10 0 0 1 0 14.14" />
		<path class="base-media-player__volume-cross" d="M23 9l-6 6M17 9l6 6" />
	</svg>
</template>

<script setup lang="ts">
import { useMediaVolumeIcon } from '../model/useMediaVolumeIcon'
import type { MediaVolumeIconProps } from '../types/MediaVolumeIcon.types'

const props = defineProps<MediaVolumeIconProps>()

const { isSilent, nearArcStyle, farArcStyle } = useMediaVolumeIcon(props)
</script>
