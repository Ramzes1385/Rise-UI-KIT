<template>
	<div
		ref="rootRef"
		class="base-media-player"
		:class="[
			variantClass,
			{
				'base-media-player--idle': isIdle,
				'base-media-player--fullscreen': isFullscreen,
				'base-media-player--theater': isTheater,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, rootStyle]"
		data-theme="dark"
		role="region"
		tabindex="-1"
		:aria-label="title">
		<video
			ref="mediaRef"
			class="base-media-player__media"
			:class="classes.media"
			:src="src"
			:poster="posterSrc"
			:preload="preload"
			:loop="isLoop"
			:muted="isAutoplay"
			:crossorigin="crossorigin"
			playsinline
			@click="togglePlay"
			@dblclick="toggleFullscreen"
			@play="onMediaEvent.play"
			@pause="onMediaEvent.pause"
			@ended="onMediaEvent.ended"></video>
		<div v-if="hasTitle || logoSrc" class="base-media-player__top" :class="`base-media-player__top--logo-${logoPosition}`">
			<span v-if="hasTitle" class="base-media-player__title" :class="classes.title">{{ title }}</span>
			<a
				v-if="logoSrc && logoLink"
				class="base-media-player__logo"
				:class="classes.logo"
				:href="logoLink"
				target="_blank"
				rel="noopener noreferrer"
				:aria-label="logoAlt">
				<img class="base-media-player__logo-image" :src="logoSrc" alt="" />
			</a>
			<img v-else-if="logoSrc" class="base-media-player__logo" :class="classes.logo" :src="logoSrc" :alt="logoAlt ?? ''" />
		</div>
		<BaseLoader v-if="isBuffering" class="base-media-player__loader" :label="UI_PLAYER.LOADING" />
		<div v-if="isStartScreen" class="base-media-player__start">
			<button type="button" class="base-media-player__big-play" tabindex="-1" aria-hidden="true" @click="actions.play">
				<BaseIcon name="play" />
			</button>
			<p v-if="isAutoplayBlocked" class="base-media-player__hint" role="status">{{ errorMessage }}</p>
		</div>
		<div v-if="overlayError" class="base-media-player__overlay" :class="classes.overlay" role="alert">
			<slot name="error" :error="overlayError" :retry="actions.retry">
				<p class="base-media-player__message">{{ errorMessage }}</p>
				<BaseButton v-if="canRetry" variant="soft" :size-scale="sizeScale" @click="actions.retry">
					{{ UI_TEXT.RETRY }}
				</BaseButton>
			</slot>
		</div>
		<div ref="controlsRef" class="base-media-player__controls" :class="classes.controls">
			<MediaSlider
				class="base-media-player__seek"
				:class="classes.seek"
				:model-value="state.currentTime"
				:max="state.duration"
				:step="seekStep"
				:large-step="seekStepLarge"
				:buffered="state.buffered"
				:label="UI_PLAYER.SEEK"
				:value-text="seekValueText"
				@update:model-value="actions.seek" />
			<div class="base-media-player__bar">
				<BaseButton variant="ghost" class="base-media-player__button" :aria-label="playLabel" @click="togglePlay">
					<template #left><BaseIcon :name="state.isPaused ? 'play' : 'pause'" /></template>
				</BaseButton>
				<BaseButton variant="ghost" class="base-media-player__button" :aria-label="muteLabel" @click="actions.toggleMute">
					<template #left><MediaVolumeIcon :volume="state.volume" :is-muted="state.isMuted" /></template>
				</BaseButton>
				<MediaSlider
					class="base-media-player__volume"
					:class="classes.volume"
					:model-value="volumeValue"
					:max="1"
					:step="volumeStep"
					:large-step="volumeStep * 2"
					:label="UI_PLAYER.VOLUME"
					:value-text="volumeValueText"
					@update:model-value="actions.setVolume" />
				<span class="base-media-player__time" :class="classes.time">{{ currentTimeText }} / {{ durationText }}</span>
				<MediaSettingsMenu
					:rates="rates"
					:rate="state.playbackRate"
					:qualities="qualities"
					:active-src="src"
					@select-rate="actions.setPlaybackRate"
					@select-quality="selectQuality" />
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
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseMediaPlayer.style.scss'
import MediaSlider from './MediaSlider.vue'
import { BaseIcon } from '@components/BaseIcon'
import MediaVolumeIcon from './MediaVolumeIcon.vue'
import { BaseButton } from '@components/BaseButton'
import { BaseLoader } from '@components/BaseLoader'
import { kitDefaults } from '@composables/useDefaults'
import MediaSettingsMenu from './MediaSettingsMenu.vue'
import { UI_PLAYER, UI_TEXT } from '@/locales/messages'
import { useBaseMediaPlayer } from '../model/useBaseMediaPlayer'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import type {
	BaseMediaPlayerEmits,
	BaseMediaPlayerExpose,
	BaseMediaPlayerProps,
	BaseMediaPlayerSlots,
} from '../types/BaseMediaPlayer.types'

const props = withDefaults(
	defineProps<BaseMediaPlayerProps>(),
	kitDefaults('BaseMediaPlayer', {
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
		preload: 'metadata',
		aspectRatio: '16 / 9',
		hasKeyboardShortcuts: true,
		seekStep: 5,
		seekStepLarge: 10,
		volumeStep: 0.05,
		playbackRates: () => [0.5, 0.75, 1, 1.25, 1.5, 2],
		idleTimeout: 3000,
		hasTitle: true,
		logoPosition: 'top-right',
		currentTime: undefined,
		volume: undefined,
		isMuted: undefined,
		playbackRate: undefined,
		isTheater: undefined,
	}),
)
const emit = defineEmits<BaseMediaPlayerEmits>()
defineSlots<BaseMediaPlayerSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	classes,
	rootRef,
	mediaRef,
	controlsRef,
	state,
	actions,
	isIdle,
	togglePlay,
	toggleFullscreen,
	isFullscreen,
	isFullscreenSupported,
	fullscreenLabel,
	theaterLabel,
	isTheater,
	toggleTheater,
	src,
	posterSrc,
	logoSrc,
	logoLink,
	rootStyle,
	rates,
	qualities,
	selectQuality,
	overlayError,
	isAutoplayBlocked,
	errorMessage,
	canRetry,
	isBuffering,
	isStartScreen,
	playLabel,
	muteLabel,
	currentTimeText,
	durationText,
	seekValueText,
	volumeValue,
	volumeValueText,
	onMediaEvent,
	exposed,
} = useBaseMediaPlayer(props, emit)

defineExpose<BaseMediaPlayerExpose>(exposed)
</script>
