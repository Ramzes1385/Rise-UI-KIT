<template>
	<div ref="controlsRef" class="base-media-player__controls" :class="classes.controls">
		<MediaSlider
			class="base-media-player__seek"
			:class="classes.seek"
			:model-value="state.currentTime"
			:max="state.duration"
			:step="props.seekStep"
			:large-step="props.seekStepLarge"
			:buffered="state.buffered"
			:label="UI_PLAYER.SEEK"
			:value-text="seekValueText"
			:marks="chapterMarks"
			:hover-text="seekHoverText"
			@update:model-value="actions.seek" />
		<div class="base-media-player__bar">
			<BaseButton
				v-if="previousEpisode"
				variant="ghost"
				class="base-media-player__button"
				:aria-label="UI_PLAYER.PREVIOUS_EPISODE"
				@click="playPrevious">
				<template #left><BaseIcon name="skip-previous" /></template>
			</BaseButton>
			<BaseButton variant="ghost" class="base-media-player__button" :aria-label="playLabel" @click="togglePlay">
				<template #left><BaseIcon :name="state.isPaused ? 'play' : 'pause'" /></template>
			</BaseButton>
			<BaseButton
				v-if="nextEpisode"
				variant="ghost"
				class="base-media-player__button"
				:aria-label="UI_PLAYER.NEXT_EPISODE"
				@click="playNext">
				<template #left><BaseIcon name="skip-next" /></template>
			</BaseButton>
			<BaseButton variant="ghost" class="base-media-player__button" :aria-label="muteLabel" @click="actions.toggleMute">
				<template #left><MediaVolumeIcon :volume="state.volume" :is-muted="state.isMuted" /></template>
			</BaseButton>
			<MediaSlider
				class="base-media-player__volume"
				:class="classes.volume"
				:model-value="volumeValue"
				:max="1"
				:step="props.volumeStep"
				:large-step="props.volumeStep * 2"
				:label="UI_PLAYER.VOLUME"
				:value-text="volumeValueText"
				@update:model-value="actions.setVolume" />
			<div class="base-media-player__info">
				<span class="base-media-player__time" :class="classes.time">{{ currentTimeText }} / {{ durationText }}</span>
				<BaseDropdownMenu v-if="chapters.length" :items="chapterItems" position="top-start" :aria-label="UI_PLAYER.CHAPTERS">
					<BaseButton variant="ghost" class="base-media-player__button base-media-player__chapter">
						{{ currentChapter?.title ?? UI_PLAYER.CHAPTERS }}
					</BaseButton>
				</BaseDropdownMenu>
			</div>
			<BaseDropdownMenu v-if="hasEpisodes" :items="episodeItems" position="top-end" :aria-label="UI_PLAYER.EPISODES">
				<BaseButton variant="ghost" class="base-media-player__button" :aria-label="UI_PLAYER.EPISODES">
					<template #left><BaseIcon name="list-bullet" /></template>
				</BaseButton>
			</BaseDropdownMenu>
			<BaseButton
				v-if="captionTracks.length"
				variant="ghost"
				class="base-media-player__button base-media-player__captions-button"
				:aria-label="UI_PLAYER.CAPTIONS"
				:aria-pressed="activeCaptionId !== null"
				@click="toggleCaptions">
				<template #left><BaseIcon name="subtitles" /></template>
			</BaseButton>
			<MediaSettingsMenu
				:rates="rates"
				:rate="state.playbackRate"
				:qualities="qualities"
				:active-quality-id="activeQualityId"
				:caption-tracks="captionTracks"
				:active-caption-id="activeCaptionId"
				:caption-style="captionStyle"
				:can-load-captions="props.hasCaptionUpload"
				:audio-options="audioOptions"
				:active-audio-id="activeAudioId"
				@select-rate="actions.setPlaybackRate"
				@select-quality="selectQuality"
				@select-caption="selectCaptionTrack"
				@load-captions="openCaptionFile"
				@update-caption-style="updateCaptionStyle"
				:has-auto-next="hasEpisodes"
				:is-auto-next="isAutoNext"
				@select-audio="selectAudioTrack"
				@update-auto-next="setAutoNext" />
			<BaseButton
				v-if="!isFullscreen"
				variant="ghost"
				class="base-media-player__button"
				:aria-label="theaterLabel"
				@click="toggleTheater">
				<template #left><BaseIcon :name="isTheater ? 'theater-exit' : 'theater'" /></template>
			</BaseButton>
			<BaseButton
				v-if="isFullscreenSupported"
				variant="ghost"
				class="base-media-player__button"
				:aria-label="fullscreenLabel"
				@click="toggleFullscreen">
				<template #left><BaseIcon :name="isFullscreen ? 'fullscreen-exit' : 'fullscreen'" /></template>
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import MediaSlider from './MediaSlider.vue'
import { UI_PLAYER } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import MediaVolumeIcon from './MediaVolumeIcon.vue'
import { BaseButton } from '@components/BaseButton'
import MediaSettingsMenu from './MediaSettingsMenu.vue'
import { useMediaControlBar } from '../model/usePlayerContext'
import { BaseDropdownMenu } from '@components/BaseDropdownMenu'

const {
	actions,
	activeAudioId,
	activeCaptionId,
	activeQualityId,
	audioOptions,
	captionStyle,
	captionTracks,
	chapterItems,
	chapterMarks,
	chapters,
	classes,
	controlsRef,
	currentChapter,
	currentTimeText,
	durationText,
	episodeItems,
	fullscreenLabel,
	hasEpisodes,
	isAutoNext,
	isFullscreen,
	isFullscreenSupported,
	isTheater,
	muteLabel,
	nextEpisode,
	openCaptionFile,
	playLabel,
	playNext,
	playPrevious,
	previousEpisode,
	props,
	qualities,
	rates,
	seekHoverText,
	seekValueText,
	selectAudioTrack,
	selectCaptionTrack,
	selectQuality,
	setAutoNext,
	state,
	theaterLabel,
	toggleCaptions,
	toggleFullscreen,
	togglePlay,
	toggleTheater,
	updateCaptionStyle,
	volumeValue,
	volumeValueText,
} = useMediaControlBar()
</script>
