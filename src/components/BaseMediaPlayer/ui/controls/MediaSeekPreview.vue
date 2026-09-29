<template>
	<div class="base-media-player__preview">
		<div v-if="thumbnail" class="base-media-player__preview-frame" :style="thumbnail.frame">
			<div class="base-media-player__preview-sprite" :style="thumbnail.sprite"></div>
		</div>
		<canvas
			v-else-if="hasFrame"
			ref="canvasRef"
			class="base-media-player__preview-frame"
			:class="{ 'base-media-player__preview-frame--loading': !isFrameReady }"></canvas>
		<span v-if="chapter" class="base-media-player__preview-chapter">{{ chapter }}</span>
		<span class="base-media-player__preview-time">{{ timeText }}</span>
	</div>
</template>

<script setup lang="ts">
import { useMediaSeekPreview } from '../../model/preview/useMediaSeekPreview'
import type { MediaSeekPreviewProps } from '../../types/content/MediaPreview.types'

const props = defineProps<MediaSeekPreviewProps>()

const { canvasRef, thumbnail, hasFrame, isFrameReady, chapter, timeText } = useMediaSeekPreview(props)
</script>
