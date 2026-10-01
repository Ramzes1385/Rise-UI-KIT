<template>
	<div
		class="base-audio-player"
		:class="[variantClass, { 'base-audio-player--disabled': isDisabled, 'base-audio-player--error': state.error }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="group"
		:aria-label="title">
		<audio
			ref="audioRef"
			class="base-audio-player__audio"
			:src="safeSrc"
			preload="metadata"
			@play="onPlay"
			@pause="onPause"
			@ended="onEnded"
			@timeupdate="onTimeUpdate"
			@seeked="onTimeUpdate"
			@durationchange="onDurationChange"
			@loadedmetadata="onDurationChange"
			@ratechange="onRateChange"
			@error="onError"></audio>
		<BaseButton
			class="base-audio-player__button"
			:class="classes.button"
			:variant="variant === 'ghost' ? 'ghost' : 'soft'"
			:size-scale="sizeScale"
			:aria-label="playLabel"
			:is-disabled="isDisabled"
			@click="togglePlay">
			<template #left><BaseIcon :name="state.isPaused ? 'play' : 'pause'" /></template>
		</BaseButton>
		<div class="base-audio-player__body">
			<span v-if="hasTitle" class="base-audio-player__title">{{ title }}</span>
			<BaseWaveform
				class="base-audio-player__waveform"
				:class="classes.waveform"
				:peaks="peaks"
				:duration="duration"
				:current-time="state.currentTime"
				:label="UI_AUDIO.SEEK"
				:variant="variant === 'default' ? 'default' : 'soft'"
				:size-scale="sizeScale"
				:is-disabled="isDisabled"
				@update:current-time="seek" />
		</div>
		<span class="base-audio-player__time" :class="classes.time">{{ timeText }}</span>
		<BaseButton
			v-if="hasRates"
			variant="ghost"
			class="base-audio-player__rate"
			:custom-class="classes.rate"
			:aria-label="rateLabel"
			:is-disabled="isDisabled"
			:size-scale="sizeScale"
			@click="nextRate">
			{{ rateText }}
		</BaseButton>
		<p v-if="state.error" class="base-audio-player__error" role="alert">{{ UI_AUDIO.ERROR }}</p>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseAudioPlayer.style.scss'
import { UI_AUDIO } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { BaseWaveform } from '@components/BaseWaveform'
import { useBaseAudioPlayer } from '../model/useBaseAudioPlayer'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseAudioPlayerEmits, BaseAudioPlayerProps } from '../types/BaseAudioPlayer.types'

const props = withDefaults(defineProps<BaseAudioPlayerProps>(), {
	sizeScale: SIZE_SCALE_DEFAULT,
	bars: 48,
	playbackRates: () => [1, 1.5, 2],
	isExclusive: true,
})

const emit = defineEmits<BaseAudioPlayerEmits>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	audioRef,
	state,
	duration,
	peaks,
	safeSrc,
	playLabel,
	timeText,
	hasRates,
	rateText,
	rateLabel,
	nextRate,
	togglePlay,
	seek,
	exposed,
	onPlay,
	onPause,
	onEnded,
	onTimeUpdate,
	onDurationChange,
	onRateChange,
	onError,
} = useBaseAudioPlayer(props, emit)

defineExpose(exposed)
</script>
