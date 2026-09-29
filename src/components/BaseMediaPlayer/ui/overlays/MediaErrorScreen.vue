<template>
	<div v-if="overlayError" class="base-media-player__overlay" :class="overlayClasses" role="alert">
		<div class="base-media-player__error-scene" aria-hidden="true">
			<span v-for="layer in errorLayers" :key="layer.key" :class="layer.className"></span>
		</div>
		<slot :error="overlayError" :retry="retryPlayback">
			<div class="base-media-player__error-card">
				<span class="base-media-player__overlay-badge"><MediaIcon name="alert" class="base-media-player__overlay-icon" /></span>
				<p class="base-media-player__overlay-title">{{ UI_PLAYER.ERROR_TITLE }}</p>
				<p class="base-media-player__message">{{ errorMessage }}</p>
				<button v-if="canRetry" type="button" class="base-media-player__retry" @click="retryPlayback">
					<MediaIcon name="refresh" />
					{{ UI_TEXT.RETRY }}
				</button>
			</div>
		</slot>
	</div>
</template>

<script setup lang="ts">
import '../../styles/MediaError.style.scss'
import MediaIcon from '../controls/MediaIcon.vue'
import { UI_PLAYER, UI_TEXT } from '../../model/messages'
import { useMediaErrorScreen } from '../../model/player/useMediaErrorScreen'
import type { MediaErrorScreenSlots } from '../../types/overlays/MediaError.types'

defineSlots<MediaErrorScreenSlots>()

const { overlayError, errorMessage, canRetry, retryPlayback, overlayClasses, errorLayers } = useMediaErrorScreen()
</script>
