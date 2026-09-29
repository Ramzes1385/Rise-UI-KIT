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
			:segments="chapterSegments"
			:markers="adMarks"
			:highlights="adSegmentRanges"
			@update:model-value="actions.seek">
			<template #tooltip="{ value }"><MediaSeekPreview :time="value" /></template>
		</MediaSlider>
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
				<MediaControlButton
					class="base-media-player__seek-more"
					icon="more"
					:label="UI_PLAYER.SEEK_MORE"
					:is-active="isSeekRowOpen"
					:aria-expanded="isSeekRowOpen"
					@click="toggleSeekRow" />
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
					<MediaPopover v-if="chapters.length" position="top-start">
						<template #default="{ isOpen, toggle }">
							<button
								type="button"
								class="base-media-player__chapter"
								aria-haspopup="menu"
								:aria-expanded="isOpen"
								@click="toggle">
								{{ currentChapter?.title ?? UI_PLAYER.CHAPTERS }}
							</button>
						</template>
						<template #panel="{ close }"><MediaMenuPanel :menu="chapterMenu" @close="close" /></template>
					</MediaPopover>
				</div>
			</div>
			<div class="base-media-player__group base-media-player__group--end">
				<MediaSwitch v-if="hasEpisodes" :label="UI_PLAYER.AUTO_NEXT" :is-checked="isAutoNext" @update:is-checked="setAutoNext" />
				<MediaPopover>
					<template #default="{ isOpen, toggle }">
						<MediaControlButton
							icon="speed"
							:label="UI_PLAYER.SPEED_MENU"
							:text="rateText"
							aria-haspopup="dialog"
							:aria-expanded="isOpen"
							@click="toggle" />
					</template>
					<template #panel><MediaSpeedPanel /></template>
				</MediaPopover>
				<MediaPopover v-if="qualities.length > 1">
					<template #default="{ isOpen, toggle }">
						<MediaControlButton
							icon="quality"
							:label="UI_PLAYER.QUALITY"
							:text="qualityText"
							aria-haspopup="menu"
							:aria-expanded="isOpen"
							@click="toggle" />
					</template>
					<template #panel="{ close }"><MediaMenuPanel :menu="qualityMenu" @close="close" /></template>
				</MediaPopover>
				<MediaPopover v-if="(captionTracks.length || props.hasCaptionUpload) && !isAudioMode">
					<template #default="{ isOpen, toggle }">
						<MediaControlButton
							class="base-media-player__captions-button"
							:icon="activeCaptionId === null ? 'captions-off' : 'captions'"
							:label="UI_PLAYER.CAPTIONS"
							:is-active="activeCaptionId !== null"
							aria-haspopup="menu"
							:aria-expanded="isOpen"
							@click="toggle" />
					</template>
					<template #panel="{ close }"><MediaMenuPanel :menu="captionMenu" @close="close" /></template>
				</MediaPopover>
				<MediaPopover v-if="audioOptions.length > 1">
					<template #default="{ isOpen, toggle }">
						<MediaControlButton
							icon="dub"
							:label="UI_PLAYER.AUDIO"
							:text="audioText"
							aria-haspopup="menu"
							:aria-expanded="isOpen"
							@click="toggle" />
					</template>
					<template #panel="{ close }"><MediaMenuPanel :menu="audioMenu" @close="close" /></template>
				</MediaPopover>
				<MediaControlButton
					v-if="hasCast"
					:icon="isCasting ? 'cast-connected' : 'cast'"
					:label="castLabel"
					:is-pressed="isCasting"
					@click="toggleCast" />
				<MediaControlButton
					v-if="hasEpisodes"
					class="base-media-player__episodes-button"
					icon="playlist"
					:label="UI_PLAYER.EPISODES"
					:badge="episodeCount"
					:is-active="isEpisodesOpen"
					:aria-expanded="isEpisodesOpen"
					@click="toggleEpisodes" />
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
		<Transition name="base-media-player__row">
			<div v-if="isSeekRowOpen" class="base-media-player__bar base-media-player__bar--secondary">
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
				<div v-if="!isAudioMode" class="base-media-player__group base-media-player__group--end">
					<MediaControlButton
						:icon="isAmbient ? 'light' : 'light-off'"
						:label="UI_PLAYER.AMBIENT"
						:is-pressed="isAmbient"
						@click="setAmbient(!isAmbient)" />
				</div>
			</div>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import '../styles/MediaControls.style.scss'
import '../styles/MediaMenus.style.scss'
import MediaSlider from './MediaSlider.vue'
import MediaSwitch from './MediaSwitch.vue'
import { UI_PLAYER } from '../model/messages'
import MediaPopover from './MediaPopover.vue'
import MediaMenuPanel from './MediaMenuPanel.vue'
import MediaSpeedPanel from './MediaSpeedPanel.vue'
import MediaSeekPreview from './MediaSeekPreview.vue'
import MediaControlButton from './MediaControlButton.vue'
import { usePlayerControls } from '../model/usePlayerControls'

const {
	actions,
	activeCaptionId,
	adMarks,
	adSegmentRanges,
	audioMenu,
	audioOptions,
	audioText,
	captionMenu,
	captionTracks,
	castLabel,
	chapterSegments,
	chapterMenu,
	chapters,
	classes,
	controlsRef,
	currentChapter,
	currentTimeText,
	durationText,
	episodeCount,
	fullscreenLabel,
	hasCast,
	hasEpisodes,
	isAmbient,
	isAudioMode,
	isAutoNext,
	isCasting,
	isEpisodesOpen,
	isFullscreen,
	isFullscreenSupported,
	isPip,
	isPipSupported,
	isSeekRowOpen,
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
	qualityMenu,
	qualityText,
	rateText,
	seekLabel,
	seekSteps,
	seekValueText,
	setAmbient,
	setAutoNext,
	state,
	theaterLabel,
	toggleCast,
	toggleEpisodes,
	toggleFullscreen,
	togglePip,
	togglePlay,
	toggleSeekRow,
	toggleTheater,
	volumeIcon,
	volumeValue,
	volumeValueText,
} = usePlayerControls()
</script>
