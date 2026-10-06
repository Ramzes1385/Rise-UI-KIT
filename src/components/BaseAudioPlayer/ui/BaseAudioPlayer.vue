<template>
	<div
		:class="[
			ui('root'),
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
			:class="[ui('button'), classes.button]"
			:variant="variant === 'ghost' ? 'ghost' : 'soft'"
			:size-scale="sizeScale"
			:aria-label="playLabel"
			:is-disabled="isDisabled"
			@click="togglePlay">
			<template #left>
				<Transition name="base-audio-player__icon">
					<BaseIcon :key="state.isPaused ? 'play' : 'pause'" :name="state.isPaused ? 'play' : 'pause'" />
				</Transition>
			</template>
		</BaseButton>
		<div :class="ui('body')">
			<span v-if="hasTitle" :class="ui('title')">{{ title }}</span>
			<BaseWaveform
				:class="[ui('waveform'), classes.waveform]"
				:peaks="peaks"
				:duration="duration"
				:current-time="state.currentTime"
				:label="UI_AUDIO.SEEK"
				:variant="variant === 'default' ? 'default' : 'soft'"
				:size-scale="sizeScale"
				:is-disabled="isDisabled"
				@update:current-time="seek" />
		</div>
		<span :class="[ui('time'), classes.time]">{{ timeText }}</span>
		<BaseButton
			v-if="hasRates"
			variant="ghost"
			:class="ui('rate')"
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
			:class="ui('transcript-toggle')"
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
				:class="[ui('transcript'), classes.transcript]"
				:aria-label="UI_TRANSCRIPT.TITLE"
				@keydown="onPanelKeydown">
				<div :class="ui('transcript-tools')">
					<BaseInput
						v-model="transcriptQuery"
						:class="ui('transcript-search')"
						:aria-label="UI_TRANSCRIPT.SEARCH"
						:placeholder="UI_TRANSCRIPT.SEARCH_PLACEHOLDER"
						:is-disabled="transcriptStatus !== 'ready'"
						:size-scale="sizeScale">
						<template #prefix><BaseIcon class="base-audio-player__transcript-search-icon" name="search" /></template>
					</BaseInput>
					<BaseButton
						variant="ghost"
						:class="ui('transcript-download')"
						:aria-label="UI_TRANSCRIPT.DOWNLOAD"
						:is-disabled="!canDownloadTranscript"
						:size-scale="sizeScale"
						@click="downloadTranscript">
						<template #left><BaseIcon name="download" /></template>
					</BaseButton>
				</div>
				<p :class="ui('transcript-result')" role="status">{{ transcriptResult }}</p>
				<p v-if="transcriptStatus === 'loading'" :class="ui('transcript-note')">{{ UI_TRANSCRIPT.LOADING }}</p>
				<p v-else-if="transcriptStatus === 'error'" :class="ui('transcript-note')" role="alert">
					{{ UI_TRANSCRIPT.ERROR }}
				</p>
				<p v-else-if="!canDownloadTranscript" :class="ui('transcript-note')">{{ UI_TRANSCRIPT.EMPTY }}</p>
				<ol
					v-if="transcriptItems.length"
					ref="listRef"
					:class="ui('transcript-list')"
					:aria-label="UI_TRANSCRIPT.CUES"
					@keydown="onListKeydown"
					@wheel.passive="pauseFollow"
					@touchmove.passive="pauseFollow">
					<li v-for="item in transcriptItems" :key="item.index">
						<button
							type="button"
							:class="[ui('cue'), { 'base-audio-player__cue--current': item.isCurrent }]"
							:data-cue-index="item.index"
							:tabindex="item.index === rovingIndex ? 0 : -1"
							:aria-current="item.isCurrent ? 'true' : undefined"
							:disabled="isDisabled"
							@focus="onCueFocus(item.index)"
							@click="chooseCue(item)">
							<span :class="ui('cue-time')">{{ item.time }}</span
							>{{ ' ' }}
							<span v-if="item.speaker" :class="ui('cue-speaker')">
								<template v-for="(part, index) in item.speakerParts" :key="index">
									<mark v-if="part.isMatch" class="base-audio-player__match">{{ part.text }}</mark>
									<template v-else>{{ part.text }}</template>
								</template>
							</span>
							{{ ' ' }}
							<span :class="ui('cue-text')">
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
					:class="ui('transcript-follow')"
					:size-scale="sizeScale"
					@click="followCurrent">
					{{ UI_TRANSCRIPT.FOLLOW }}
				</BaseButton>
			</section>
		</Transition>
		<p v-if="state.error" :class="ui('error')" role="alert">{{ UI_AUDIO.ERROR }}</p>
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
	ui,
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
