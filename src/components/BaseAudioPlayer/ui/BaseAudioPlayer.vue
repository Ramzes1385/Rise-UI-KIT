<template>
	<div
		class="base-audio-player"
		:class="[
			variantClass,
			{
				'base-audio-player--disabled': isDisabled,
				'base-audio-player--error': state.error,
				'base-audio-player--transcript': hasTranscript,
			},
			classes.root,
		]"
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
		<BaseButton
			v-if="hasTranscript"
			variant="ghost"
			class="base-audio-player__transcript-toggle"
			:custom-class="classes.transcriptToggle"
			:aria-label="UI_TRANSCRIPT.TITLE"
			:aria-expanded="isTranscriptOpen"
			:aria-controls="isTranscriptOpen ? transcriptId : undefined"
			:is-disabled="isDisabled"
			:size-scale="sizeScale"
			@click="toggleTranscript">
			<template #left><BaseIcon name="subtitles" /></template>
		</BaseButton>
		<Transition name="base-audio-player__transcript">
			<section
				v-if="hasTranscript && isTranscriptOpen"
				:id="transcriptId"
				ref="panelRef"
				class="base-audio-player__transcript"
				:class="classes.transcript"
				:aria-label="UI_TRANSCRIPT.TITLE"
				@keydown="onPanelKeydown">
				<div class="base-audio-player__transcript-tools">
					<BaseInput
						v-model="transcriptQuery"
						class="base-audio-player__transcript-search"
						:aria-label="UI_TRANSCRIPT.SEARCH"
						:placeholder="UI_TRANSCRIPT.SEARCH_PLACEHOLDER"
						:is-disabled="transcriptStatus !== 'ready'"
						:size-scale="sizeScale">
						<template #prefix><BaseIcon class="base-audio-player__transcript-search-icon" name="search" /></template>
					</BaseInput>
					<BaseButton
						variant="ghost"
						class="base-audio-player__transcript-download"
						:aria-label="UI_TRANSCRIPT.DOWNLOAD"
						:is-disabled="!canDownloadTranscript"
						:size-scale="sizeScale"
						@click="downloadTranscript">
						<template #left><BaseIcon name="download" /></template>
					</BaseButton>
				</div>
				<p class="base-audio-player__transcript-result" role="status">{{ transcriptResult }}</p>
				<p v-if="transcriptStatus === 'loading'" class="base-audio-player__transcript-note">{{ UI_TRANSCRIPT.LOADING }}</p>
				<p v-else-if="transcriptStatus === 'error'" class="base-audio-player__transcript-note" role="alert">
					{{ UI_TRANSCRIPT.ERROR }}
				</p>
				<p v-else-if="!canDownloadTranscript" class="base-audio-player__transcript-note">{{ UI_TRANSCRIPT.EMPTY }}</p>
				<ol
					v-if="transcriptItems.length"
					ref="listRef"
					class="base-audio-player__transcript-list"
					:aria-label="UI_TRANSCRIPT.CUES"
					@keydown="onListKeydown"
					@wheel.passive="pauseFollow"
					@touchmove.passive="pauseFollow">
					<li v-for="item in transcriptItems" :key="item.index">
						<button
							type="button"
							class="base-audio-player__cue"
							:class="{ 'base-audio-player__cue--current': item.isCurrent }"
							:data-cue-index="item.index"
							:tabindex="item.index === rovingIndex ? 0 : -1"
							:aria-current="item.isCurrent ? 'true' : undefined"
							:disabled="isDisabled"
							@focus="onCueFocus(item.index)"
							@click="chooseCue(item)">
							<span class="base-audio-player__cue-time">{{ item.time }}</span>
							<span v-if="item.speaker" class="base-audio-player__cue-speaker">
								<template v-for="(part, index) in item.speakerParts" :key="index">
									<mark v-if="part.isMatch" class="base-audio-player__match">{{ part.text }}</mark>
									<template v-else>{{ part.text }}</template>
								</template>
							</span>
							<span class="base-audio-player__cue-text">
								<template v-for="(part, index) in item.parts" :key="index">
									<mark v-if="part.isMatch" class="base-audio-player__match">{{ part.text }}</mark>
									<template v-else>{{ part.text }}</template>
								</template>
							</span>
						</button>
					</li>
				</ol>
				<BaseButton
					v-if="isFollowPaused && transcriptStatus === 'ready'"
					variant="soft"
					class="base-audio-player__transcript-follow"
					:size-scale="sizeScale"
					@click="followCurrent">
					{{ UI_TRANSCRIPT.FOLLOW }}
				</BaseButton>
			</section>
		</Transition>
		<p v-if="state.error" class="base-audio-player__error" role="alert">{{ UI_AUDIO.ERROR }}</p>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseAudioPlayer.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { BaseWaveform } from '@components/BaseWaveform'
import { kitDefaults } from '@composables/base/useDefaults'
import { UI_AUDIO, UI_TRANSCRIPT } from '@/locales/messages'
import { useBaseAudioPlayer } from '../model/useBaseAudioPlayer'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseAudioPlayerEmits, BaseAudioPlayerProps } from '../types/BaseAudioPlayer.types'

const props = withDefaults(
	defineProps<BaseAudioPlayerProps>(),
	kitDefaults('BaseAudioPlayer', {
		sizeScale: SIZE_SCALE_DEFAULT,
		bars: 48,
		playbackRates: () => [1, 1.5, 2],
		isExclusive: true,
	}),
)

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
	panelRef,
	listRef,
	transcriptId,
	hasTranscript,
	isTranscriptOpen,
	toggleTranscript,
	transcriptStatus,
	transcriptQuery,
	transcriptItems,
	transcriptResult,
	canDownloadTranscript,
	downloadTranscript,
	chooseCue,
	rovingIndex,
	isFollowPaused,
	followCurrent,
	pauseFollow,
	onCueFocus,
	onListKeydown,
	onPanelKeydown,
} = useBaseAudioPlayer(props, emit)

defineExpose(exposed)
</script>
