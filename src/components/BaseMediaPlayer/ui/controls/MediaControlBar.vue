<template>
	<div ref="controlsRef" :class="[ui('controls'), classes.controls]">
		<MediaSlider
			:class="[ui('seek'), classes.seek]"
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
					<button
						v-if="chapters.length"
						type="button"
						class="base-media-player__chapter"
						:aria-label="chapterLabel"
						:aria-expanded="isChaptersOpen"
						@click="toggleChapters">
						<span class="base-media-player__chapter-title">{{ currentChapter?.title ?? UI_PLAYER.CHAPTERS }}</span>
						<MediaIcon name="chevron-right" />
					</button>
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
							:tooltip="audioHint"
							aria-haspopup="menu"
							:aria-expanded="isOpen"
							@click="toggle" />
					</template>
					<template #panel="{ close }"><MediaMenuPanel :menu="audioMenu" @close="close" /></template>
				</MediaPopover>
				<MediaPopover v-if="hasWatchParty">
					<template #default="{ isOpen, toggle }">
						<MediaControlButton
							icon="people"
							:label="UI_PLAYER.WATCH"
							:badge="watchCount || undefined"
							aria-haspopup="dialog"
							:aria-expanded="isOpen"
							@click="toggle" />
					</template>
					<template #panel><MediaWatchPanel /></template>
				</MediaPopover>
				<MediaControlButton
					v-if="props.hasShare"
					class="base-media-player__share-button"
					icon="share"
					:label="UI_PLAYER.SHARE"
					aria-haspopup="dialog"
					:aria-expanded="isShareOpen"
					@click="toggleShare" />
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
						v-for="(step, index) in seekRow"
						:key="step"
						:style="{ '--media-item-index': index }"
						:icon="step < 0 ? 'rewind' : 'forward'"
						:caption="String(Math.abs(step))"
						:label="seekLabel(step)"
						@click="actions.seekBy(step)" />
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
import '../../styles/MediaControls.style.scss'
import '../../styles/MediaMenus.style.scss'
import MediaIcon from './MediaIcon.vue'
import MediaSlider from './MediaSlider.vue'
import MediaSwitch from './MediaSwitch.vue'
import { UI_PLAYER } from '../../model/messages'
import MediaPopover from '../menus/MediaPopover.vue'
import MediaSeekPreview from './MediaSeekPreview.vue'
import MediaMenuPanel from '../menus/MediaMenuPanel.vue'
import MediaControlButton from './MediaControlButton.vue'
import MediaSpeedPanel from '../menus/MediaSpeedPanel.vue'
import MediaWatchPanel from '../panels/MediaWatchPanel.vue'
import { usePlayerControls } from '../../model/controls/usePlayerControls'

const {
	actions,
	activeCaptionId,
	adMarks,
	adSegmentRanges,
	audioMenu,
	audioHint,
	audioOptions,
	captionMenu,
	captionTracks,
	castLabel,
	chapterSegments,
	chapterLabel,
	chapters,
	classes,
	ui,
	controlsRef,
	currentChapter,
	currentTimeText,
	durationText,
	episodeCount,
	fullscreenLabel,
	hasCast,
	hasEpisodes,
	hasWatchParty,
	isAmbient,
	isAudioMode,
	isAutoNext,
	isCasting,
	isChaptersOpen,
	isEpisodesOpen,
	isFullscreen,
	isFullscreenSupported,
	isPip,
	isPipSupported,
	isSeekRowOpen,
	isShareOpen,
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
	seekRow,
	seekValueText,
	setAmbient,
	setAutoNext,
	state,
	theaterLabel,
	toggleCast,
	toggleChapters,
	toggleEpisodes,
	toggleFullscreen,
	togglePip,
	togglePlay,
	toggleSeekRow,
	toggleShare,
	toggleTheater,
	volumeIcon,
	volumeValue,
	volumeValueText,
	watchCount,
} = usePlayerControls()
</script>
