<template>
	<div
		ref="rootRef"
		class="base-media-player"
		:class="[variantClass, { 'base-media-player--idle': isIdle, 'base-media-player--fullscreen': isFullscreen }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, rootStyle]"
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
		<div v-if="error" class="base-media-player__overlay" :class="classes.overlay" role="alert">
			<slot name="error" :error="error" :retry="actions.retry">
				<p class="base-media-player__message">{{ errorMessage }}</p>
				<BaseButton v-if="errorAction" variant="soft" :size-scale="sizeScale" @click="errorAction.run">
					{{ errorAction.label }}
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
					<template #left><BaseIcon :name="isSilent ? 'volume-off' : 'volume'" /></template>
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
import { UI_PLAYER } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { kitDefaults } from '@composables/useDefaults'
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
	error,
	isIdle,
	togglePlay,
	isFullscreen,
	isFullscreenSupported,
	toggleFullscreen,
	fullscreenLabel,
	src,
	posterSrc,
	errorMessage,
	errorAction,
	rootStyle,
	isSilent,
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
