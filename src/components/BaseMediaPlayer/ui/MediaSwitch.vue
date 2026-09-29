<template>
	<button
		type="button"
		role="switch"
		class="base-media-player__switch"
		:aria-checked="isChecked"
		@click="emit('update:isChecked', !isChecked)">
		<span class="base-media-player__switch-track" aria-hidden="true"><span class="base-media-player__switch-thumb" /></span>
		<span class="base-media-player__switch-label">{{ label }}</span>
	</button>
</template>

<script setup lang="ts">
import type { MediaSwitchEmits, MediaSwitchProps } from '../types/MediaControls.types'

defineProps<MediaSwitchProps>()
const emit = defineEmits<MediaSwitchEmits>()
</script>
