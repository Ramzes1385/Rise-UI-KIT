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
			:markers="adMarks"
			:highlights="adSegmentRanges"
			@update:model-value="actions.seek" />
		<div class="base-media-player__bar">
			<div class="base-media-player__group">
				<MediaControlButton
					v-if="previousEpisode"
					class="base-media-player__episode-button"
					icon="previous"
					:label="UI_PLAYER.PREVIOUS_EPISODE"
					@click="playPrevious" />
				<MediaControlButton :icon="state.isPaused ? 'play' : 'pause'" :label="playLabel" @click="togglePlay" />
				<MediaControlButton
					v-if="nextEpisode"
					class="base-media-player__episode-button"
					icon="next"
					:label="UI_PLAYER.NEXT_EPISODE"
					@click="playNext" />
				<MediaControlButton
					icon="rewind"
					:caption="String(seekSteps.large)"
					:label="seekLabel(-seekSteps.large)"
					@click="actions.seekBy(-seekSteps.large)" />
				<MediaControlButton
					icon="forward"
					:caption="String(seekSteps.large)"
					:label="seekLabel(seekSteps.large)"
					@click="actions.seekBy(seekSteps.large)" />
				<div class="base-media-player__volume-group">
					<MediaControlButton :icon="volumeIcon" :label="muteLabel" @click="actions.toggleMute" />
					<div class="base-media-player__volume-popover">
						<MediaSlider
							class="base-media-player__volume"
							:class="classes.volume"
							:model-value="volumeValue"
							:max="1"
							:step="props.volumeStep"
							:large-step="props.volumeStep * 2"
							:label="UI_PLAYER.VOLUME"
							:value-text="volumeValueText"
							:is-vertical="!isAudioMode"
							@update:model-value="actions.setVolume" />
					</div>
				</div>
				<div class="base-media-player__info">
					<span class="base-media-player__time" :class="classes.time">
						{{ currentTimeText }}<span class="base-media-player__duration"> / {{ durationText }}</span>
					</span>
					<BaseDropdownMenu
						v-if="chapters.length"
						:items="chapterItems"
						position="top-start"
						:aria-label="UI_PLAYER.CHAPTERS"
						close-on-check>
						<button type="button" class="base-media-player__chapter">{{ currentChapter?.title ?? UI_PLAYER.CHAPTERS }}</button>
					</BaseDropdownMenu>
				</div>
			</div>
			<div class="base-media-player__group base-media-player__group--end">
				<BaseDropdownMenu :items="speedItems" position="top-end" :aria-label="UI_PLAYER.SPEED_MENU" close-on-check>
					<MediaControlButton icon="speed" :label="UI_PLAYER.SPEED_MENU" :text="rateText" />
				</BaseDropdownMenu>
				<BaseDropdownMenu
					v-if="qualities.length > 1"
					:items="qualityItems"
					position="top-end"
					:aria-label="UI_PLAYER.QUALITY"
					close-on-check>
					<MediaControlButton icon="quality" :label="UI_PLAYER.QUALITY" :text="qualityText" />
				</BaseDropdownMenu>
				<BaseDropdownMenu
					v-if="(captionTracks.length || props.hasCaptionUpload) && !isAudioMode"
					:items="captionItems"
					position="top-end"
					:aria-label="UI_PLAYER.CAPTIONS"
					close-on-check>
					<MediaControlButton
						class="base-media-player__captions-button"
						:icon="activeCaptionId === null ? 'captions-off' : 'captions'"
						:label="UI_PLAYER.CAPTIONS"
						:is-active="activeCaptionId !== null" />
				</BaseDropdownMenu>
				<BaseDropdownMenu
					v-if="audioOptions.length > 1"
					:items="audioItems"
					position="top-end"
					:aria-label="UI_PLAYER.AUDIO"
					close-on-check>
					<MediaControlButton icon="dub" :label="UI_PLAYER.AUDIO" :text="audioText" />
				</BaseDropdownMenu>
				<MediaControlButton
					v-if="hasCast"
					:icon="isCasting ? 'cast-connected' : 'cast'"
					:label="castLabel"
					:is-pressed="isCasting"
					@click="toggleCast" />
				<BaseDropdownMenu
					v-if="hasEpisodes"
					:items="episodeItems"
					position="top-end"
					:aria-label="UI_PLAYER.EPISODES"
					close-on-check>
					<MediaControlButton icon="playlist" :label="UI_PLAYER.EPISODES" :badge="episodeCount" />
				</BaseDropdownMenu>
				<MediaControlButton
					v-if="isPipSupported && !isAudioMode"
					class="base-media-player__pip-button"
					:icon="isPip ? 'pip-exit' : 'pip'"
					:label="pipLabel"
					:is-pressed="isPip"
					@click="togglePip" />
				<MediaControlButton
					v-if="!isFullscreen && !isAudioMode"
					class="base-media-player__theater-button"
					:icon="isTheater ? 'theater-exit' : 'theater'"
					:label="theaterLabel"
					@click="toggleTheater" />
				<MediaControlButton
					v-if="isFullscreenSupported && !isAudioMode"
					:icon="isFullscreen ? 'fullscreen-exit' : 'fullscreen'"
					:label="fullscreenLabel"
					@click="toggleFullscreen" />
			</div>
		</div>
		<div class="base-media-player__bar base-media-player__bar--secondary">
			<div class="base-media-player__group">
				<MediaControlButton
					icon="rewind"
					:caption="String(seekSteps.long)"
					:label="seekLabel(-seekSteps.long)"
					@click="actions.seekBy(-seekSteps.long)" />
				<MediaControlButton
					icon="rewind"
					:caption="String(seekSteps.short)"
					:label="seekLabel(-seekSteps.short)"
					@click="actions.seekBy(-seekSteps.short)" />
				<MediaControlButton
					icon="forward"
					:caption="String(seekSteps.short)"
					:label="seekLabel(seekSteps.short)"
					@click="actions.seekBy(seekSteps.short)" />
				<MediaControlButton
					icon="forward"
					:caption="String(seekSteps.long)"
					:label="seekLabel(seekSteps.long)"
					@click="actions.seekBy(seekSteps.long)" />
			</div>
			<div class="base-media-player__group base-media-player__group--end">
				<MediaSwitch v-if="hasEpisodes" :label="UI_PLAYER.AUTO_NEXT" :is-checked="isAutoNext" @update:is-checked="setAutoNext" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/MediaControls.style.scss'
import '../styles/MediaMenus.style.scss'
import MediaSlider from './MediaSlider.vue'
import MediaSwitch from './MediaSwitch.vue'
import { UI_PLAYER } from '../model/messages'
import MediaControlButton from './MediaControlButton.vue'
import { usePlayerControls } from '../model/usePlayerControls'
import { BaseDropdownMenu } from '@components/BaseDropdownMenu'

const {
	actions,
	activeCaptionId,
	adMarks,
	adSegmentRanges,
	audioItems,
	audioOptions,
	audioText,
	captionItems,
	captionTracks,
	castLabel,
	chapterItems,
	chapterMarks,
	chapters,
	classes,
	controlsRef,
	currentChapter,
	currentTimeText,
	durationText,
	episodeCount,
	episodeItems,
	fullscreenLabel,
	hasCast,
	hasEpisodes,
	isAudioMode,
	isAutoNext,
	isCasting,
	isFullscreen,
	isFullscreenSupported,
	isPip,
	isPipSupported,
	isTheater,
	muteLabel,
	nextEpisode,
	pipLabel,
	playLabel,
	playNext,
	playPrevious,
	previousEpisode,
	props,
	qualities,
	qualityItems,
	qualityText,
	rateText,
	seekHoverText,
	seekLabel,
	seekSteps,
	seekValueText,
	setAutoNext,
	speedItems,
	state,
	theaterLabel,
	toggleCast,
	toggleFullscreen,
	togglePip,
	togglePlay,
	toggleTheater,
	volumeIcon,
	volumeValue,
	volumeValueText,
} = usePlayerControls()
</script>
