<template>
	<div v-if="activeClip" class="base-media-player__ad base-media-player__ad--clip" role="region" :aria-label="clipLabel">
		<video
			ref="clipMediaRef"
			class="base-media-player__ad-media"
			:src="clipSrc"
			:muted="state.isMuted"
			playsinline
			@click="toggleClipPause"
			@loadedmetadata="onClipTime"
			@timeupdate="onClipTime"
			@play="onClipPlayState"
			@pause="onClipPlayState"
			@ended="finishClip"
			@error="finishClip"></video>
		<div class="base-media-player__ad-bar">
			<span class="base-media-player__ad-label">{{ clipLabel }}</span>
			<MediaControlButton :icon="isClipPaused ? 'play' : 'pause'" :label="clipPauseLabel" @click="toggleClipPause" />
			<button v-if="canSkipClip" type="button" class="base-media-player__skip base-media-player__skip--inline" @click="finishClip">
				{{ clipSkipLabel }}
				<MediaIcon name="skip" />
			</button>
			<span v-else class="base-media-player__ad-wait">{{ clipSkipText }}</span>
		</div>
		<div class="base-media-player__ad-progress" :style="clipProgressStyle"></div>
	</div>
</template>

<script setup lang="ts">
import MediaIcon from '../controls/MediaIcon.vue'
import MediaControlButton from '../controls/MediaControlButton.vue'
import { usePlayerContext } from '../../model/player/usePlayerContext'

const {
	state,
	activeClip,
	clipSrc,
	clipMediaRef,
	clipLabel,
	clipPauseLabel,
	clipSkipLabel,
	clipSkipText,
	canSkipClip,
	isClipPaused,
	clipProgressStyle,
	finishClip,
	toggleClipPause,
	onClipTime,
	onClipPlayState,
} = usePlayerContext()
</script>
