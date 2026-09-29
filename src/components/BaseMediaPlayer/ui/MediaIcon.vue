<template>
	<svg class="base-media-player__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
		<template v-if="morph">
			<path class="base-media-player__icon-morph" :d="morph[0]" />
			<path class="base-media-player__icon-morph" :d="morph[1]" />
		</template>
		<Transition v-else name="base-media-player__icon">
			<path :key="name" :d="path" />
		</Transition>
	</svg>
</template>

<script setup lang="ts">
import { useMediaIcon } from '../model/useMediaIcon'
import type { MediaIconProps } from '../types/MediaIcon.types'

const props = defineProps<MediaIconProps>()
const { morph, path } = useMediaIcon(props)
</script>
