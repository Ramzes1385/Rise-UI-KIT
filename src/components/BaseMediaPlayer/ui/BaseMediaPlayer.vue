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
				'base-media-player--drop-target': isDropTarget,
				'base-media-player--ad': isAdPlaying,
				'base-media-player--audio': isAudioMode,
				'base-media-player--casting': isCasting,
				'base-media-player--cast-remote': isCastConnected,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, rootStyle]"
		data-theme="dark"
		role="region"
		tabindex="-1"
		:aria-label="accessibleName"
		@dragover="onCaptionDragOver"
		@dragleave="onCaptionDragLeave"
		@drop="onCaptionDrop">
		<BaseContextMenu
			class="base-media-player__frame"
			:items="contextItems"
			:is-disabled="isContextMenuOpen || isBoosted"
			@update:is-open="setContextMenuOpen">
			<video
				ref="mediaRef"
				class="base-media-player__media"
				:class="classes.media"
				:src="src"
				:poster="posterSrc"
				:preload="preload"
				:loop="isLoopOn"
				:muted="isAutoplay"
				:crossorigin="crossorigin"
				playsinline
				@click="onFrameClick"
				@dblclick="onFrameDoubleClick"
				@pointerdown="onFramePointerDown"
				@pointerup="onFramePointerEnd"
				@pointercancel="onFramePointerEnd"
				@pointerleave="onFramePointerEnd"
				@play="onMediaEvent.play"
				@pause="onMediaEvent.pause"
				@ended="onMediaEvent.ended"></video>
			<audio ref="audioRef" class="base-media-player__audio" preload="auto" :crossorigin="crossorigin"></audio>
			<div v-if="captionLines.length || isCaptionDragging" class="base-media-player__captions">
				<div
					class="base-media-player__caption-box"
					:class="captionBoxClass"
					:style="captionBoxStyle"
					:title="UI_PLAYER.CAPTIONS_DRAG"
					@pointerdown="onCaptionPointerDown"
					@pointermove="onCaptionPointerMove"
					@pointerup="onCaptionPointerUp"
					@pointercancel="onCaptionPointerUp"
					@lostpointercapture="onCaptionPointerUp">
					<span v-for="(line, lineIndex) in captionLines" :key="lineIndex" class="base-media-player__caption-line">
						<span
							v-for="(segment, segmentIndex) in line"
							:key="segmentIndex"
							:class="{
								'base-media-player__caption--italic': segment.isItalic,
								'base-media-player__caption--bold': segment.isBold,
								'base-media-player__caption--underline': segment.isUnderline,
							}">
							{{ segment.text }}
						</span>
					</span>
				</div>
			</div>
			<div
				v-if="seekHint"
				:key="seekHint.key"
				class="base-media-player__seek-hint"
				:class="`base-media-player__seek-hint--${seekHint.side}`"
				aria-hidden="true">
				{{ seekHintText }}
			</div>
			<div v-if="isBoosted" class="base-media-player__boost" aria-hidden="true">{{ boostRate }}×</div>
			<MediaCastOverlay />
			<div v-if="hasTitle || logoSrc" class="base-media-player__top" :class="`base-media-player__top--logo-${logoPosition}`">
				<span v-if="hasTitle" class="base-media-player__title" :class="classes.title">
					{{ title }}
					<span v-if="episodeTitle" class="base-media-player__episode">· {{ episodeTitle }}</span>
				</span>
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
				<slot name="error" :error="overlayError" :retry="retryPlayback">
					<p class="base-media-player__message">{{ errorMessage }}</p>
					<BaseButton v-if="canRetry" variant="soft" :size-scale="sizeScale" @click="retryPlayback">
						{{ UI_TEXT.RETRY }}
					</BaseButton>
				</slot>
			</div>
			<MediaControlBar />
			<MediaAdOverlay />
			<MediaNotices>
				<template v-if="$slots.banner" #banner="bannerProps"><slot name="banner" v-bind="bannerProps" /></template>
			</MediaNotices>
			<div v-if="resumeTime !== null" class="base-media-player__resume">
				<span>{{ resumeText }}</span>
				<BaseButton variant="soft" :size-scale="sizeScale" @click="resume">{{ UI_PLAYER.RESUME_YES }}</BaseButton>
				<BaseButton variant="ghost" class="base-media-player__button" :size-scale="sizeScale" @click="dismissResume">
					{{ UI_PLAYER.RESUME_NO }}
				</BaseButton>
			</div>
			<MediaStatsPanel v-if="isStatsOpen" :rows="statsRows" @close="toggleStats" @copy="copyStats" />
			<BaseButton
				v-if="skipChapter && !activeAdSegment"
				variant="soft"
				class="base-media-player__skip"
				:size-scale="sizeScale"
				@click="skipCurrentChapter">
				{{ skipLabel }}
			</BaseButton>
			<div v-if="nextCountdown !== null" class="base-media-player__next">
				<p class="base-media-player__next-title" aria-hidden="true">{{ nextCountdownText }}</p>
				<p class="base-media-player__next-episode" role="status">{{ UI_PLAYER.NEXT_EPISODE }}: {{ nextEpisode?.title }}</p>
				<div class="base-media-player__next-actions">
					<BaseButton variant="soft" :size-scale="sizeScale" @click="playNextNow">{{ UI_PLAYER.NEXT_NOW }}</BaseButton>
					<BaseButton variant="ghost" class="base-media-player__button" :size-scale="sizeScale" @click="cancelNext">
						{{ UI_TEXT.CANCEL }}
					</BaseButton>
				</div>
			</div>
			<MediaReportForm v-model:is-open="isReportOpen" @submit="submitReport" />
			<div v-if="isDropTarget" class="base-media-player__drop" aria-hidden="true">{{ UI_PLAYER.CAPTIONS_DROP }}</div>
			<input
				v-if="hasCaptionUpload"
				ref="captionInputRef"
				class="base-media-player__file"
				type="file"
				:accept="captionAccept"
				tabindex="-1"
				hidden
				@change="onCaptionFileChange" />
			<div class="base-media-player__flash" role="status">{{ flashMessage }}</div>
		</BaseContextMenu>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseMediaPlayer.style.scss'
import MediaNotices from './MediaNotices.vue'
import { BaseIcon } from '@components/BaseIcon'
import MediaAdOverlay from './MediaAdOverlay.vue'
import MediaControlBar from './MediaControlBar.vue'
import MediaReportForm from './MediaReportForm.vue'
import MediaStatsPanel from './MediaStatsPanel.vue'
import { BaseButton } from '@components/BaseButton'
import { BaseLoader } from '@components/BaseLoader'
import MediaCastOverlay from './MediaCastOverlay.vue'
import { UI_PLAYER, UI_TEXT } from '../model/messages'
import { kitDefaults } from '@composables/useDefaults'
import { BaseContextMenu } from '@components/BaseContextMenu'
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
		mode: 'auto',
		hasKeyboardShortcuts: true,
		seekStep: 5,
		seekStepLarge: 10,
		volumeStep: 0.05,
		playbackRates: () => [0.5, 0.75, 1, 1.25, 1.5, 2],
		idleTimeout: 3000,
		hasTitle: true,
		logoPosition: 'top-right',
		timeParam: 't',
		hasUrlTime: true,
		currentTime: undefined,
		volume: undefined,
		isMuted: undefined,
		playbackRate: undefined,
		isTheater: undefined,
		textTrack: undefined,
		audioTrack: undefined,
		episode: undefined,
		isAutoNext: undefined,
		nextCountdown: 5,
		hasCaptionUpload: true,
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
	actions,
	isIdle,
	isFullscreen,
	isTheater,
	src,
	posterSrc,
	logoSrc,
	logoLink,
	rootStyle,
	isAudioMode,
	overlayError,
	isAutoplayBlocked,
	errorMessage,
	canRetry,
	isBuffering,
	isStartScreen,
	onMediaEvent,
	contextItems,
	isContextMenuOpen,
	setContextMenuOpen,
	isBoosted,
	boostRate,
	seekHint,
	seekHintText,
	onFrameClick,
	onFrameDoubleClick,
	onFramePointerDown,
	onFramePointerEnd,
	isLoopOn,
	resumeTime,
	resumeText,
	resume,
	dismissResume,
	isStatsOpen,
	statsRows,
	toggleStats,
	copyStats,
	isReportOpen,
	submitReport,
	flashMessage,
	captionLines,
	isCaptionDragging,
	captionBoxStyle,
	captionBoxClass,
	onCaptionPointerDown,
	onCaptionPointerMove,
	onCaptionPointerUp,
	captionInputRef,
	captionAccept,
	isDropTarget,
	onCaptionFileChange,
	onCaptionDragOver,
	onCaptionDragLeave,
	onCaptionDrop,
	audioRef,
	retryPlayback,
	accessibleName,
	episodeTitle,
	nextEpisode,
	skipChapter,
	skipCurrentChapter,
	skipLabel,
	nextCountdown,
	nextCountdownText,
	playNextNow,
	cancelNext,
	exposed,
	isAdPlaying,
	isCasting,
	isCastConnected,
	activeAdSegment,
} = useBaseMediaPlayer(props, emit)

defineExpose<BaseMediaPlayerExpose>(exposed)
</script>
