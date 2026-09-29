<template>
	<div v-if="isCasting" class="base-media-player__cast" :class="{ 'base-media-player__cast--remote': isCastConnected }">
		<p class="base-media-player__cast-message" role="status">
			<BaseIcon name="cast" />
			{{ castMessage }}
		</p>
		<div v-if="isCastConnected" class="base-media-player__cast-controls">
			<MediaSlider
				class="base-media-player__seek"
				:model-value="castRemote.currentTime"
				:max="castRemote.duration"
				:step="props.seekStep"
				:large-step="props.seekStepLarge"
				:label="UI_PLAYER.SEEK"
				:value-text="castTimeText"
				@update:model-value="castSeek" />
			<div class="base-media-player__bar">
				<BaseButton
					variant="ghost"
					class="base-media-player__button"
					:aria-label="castRemote.isPaused ? UI_PLAYER.PLAY : UI_PLAYER.PAUSE"
					@click="castPlayOrPause">
					<template #left><BaseIcon :name="castRemote.isPaused ? 'play' : 'pause'" /></template>
				</BaseButton>
				<span class="base-media-player__time">{{ castTimeText }}</span>
				<BaseButton variant="soft" :size-scale="props.sizeScale" @click="stopCast">{{ UI_PLAYER.CAST_STOP }}</BaseButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { UI_PLAYER } from '../../model/messages'
import { BaseButton } from '@components/BaseButton'
import MediaSlider from '../controls/MediaSlider.vue'
import { usePlayerContext } from '../../model/player/usePlayerContext'

const { props, isCasting, isCastConnected, castMessage, castRemote, castTimeText, castSeek, castPlayOrPause, stopCast } = usePlayerContext()
</script>
