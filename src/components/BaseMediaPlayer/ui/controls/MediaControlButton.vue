<template>
	<button
		type="button"
		class="base-media-player__control"
		:class="{
			'base-media-player__control--stacked': caption,
			'base-media-player__control--active': isActive || isPressed,
		}"
		:aria-label="label"
		:aria-pressed="isPressed"
		:data-tooltip="tooltip ?? label">
		<MediaIcon :name="icon" />
		<span v-if="text" class="base-media-player__control-text" aria-hidden="true">{{ text }}</span>
		<span v-if="caption" class="base-media-player__control-caption" aria-hidden="true">{{ caption }}</span>
		<span v-if="badge" :key="badge" class="base-media-player__control-badge" aria-hidden="true">{{ badge }}</span>
	</button>
</template>

<script setup lang="ts">
import MediaIcon from './MediaIcon.vue'
import type { MediaControlButtonProps } from '../../types/controls/MediaControls.types'

withDefaults(defineProps<MediaControlButtonProps>(), { isPressed: undefined })
</script>
