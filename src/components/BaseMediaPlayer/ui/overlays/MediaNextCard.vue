<template>
	<Transition name="base-media-player__next">
		<div v-if="nextCountdown !== null" class="base-media-player__next" :style="nextCountdownStyle">
			<div class="base-media-player__next-ring" aria-hidden="true">
				<svg viewBox="0 0 100 100">
					<rect class="base-media-player__next-track" x="5" y="5" width="90" height="90" rx="24" />
					<path
						class="base-media-player__next-progress"
						pathLength="100"
						d="M50 5H71A24 24 0 0 1 95 29V71A24 24 0 0 1 71 95H29A24 24 0 0 1 5 71V29A24 24 0 0 1 29 5Z" />
				</svg>
				<span class="base-media-player__next-number">{{ nextCountdown }}</span>
			</div>
			<div class="base-media-player__next-text">
				<p class="base-media-player__next-title" aria-hidden="true">{{ nextCountdownText }}</p>
				<p class="base-media-player__next-episode" role="status">
					<span class="base-media-player__visually-hidden">{{ UI_PLAYER.NEXT_EPISODE }}: </span>{{ nextEpisode?.title }}
				</p>
			</div>
			<div class="base-media-player__next-actions">
				<BaseButton class="base-media-player__next-button base-media-player__next-button--primary" @click="playNextNow">
					<template #left><MediaIcon name="play" /></template>
					{{ UI_PLAYER.NEXT_NOW }}
				</BaseButton>
				<BaseButton class="base-media-player__next-button" variant="soft" @click="cancelNext">{{ UI_TEXT.CANCEL }}</BaseButton>
			</div>
		</div>
	</Transition>
</template>

<script setup lang="ts">
import MediaIcon from '../controls/MediaIcon.vue'
import { BaseButton } from '@components/BaseButton'
import { UI_PLAYER, UI_TEXT } from '../../model/messages'
import { usePlayerContext } from '../../model/player/usePlayerContext'

const { nextCountdown, nextCountdownStyle, nextCountdownText, nextEpisode, playNextNow, cancelNext } = usePlayerContext()
</script>
