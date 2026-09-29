<template>
	<div
		ref="rootRef"
		class="base-media-player"
		:class="[
			variantClass,
			rotationClass,
			{
				'base-media-player--idle': isIdle,
				'base-media-player--mini': isMini,
				'base-media-player--ambient': isAmbient,
				'base-media-player--fullscreen': isFullscreen,
				'base-media-player--theater': isTheater,
				'base-media-player--drop-target': isDropTarget,
				'base-media-player--ad': isAdPlaying,
				'base-media-player--clip': isClipPlaying,
				'base-media-player--audio': isAudioMode,
				'base-media-player--casting': isCasting,
				'base-media-player--cast-remote': isCastConnected,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, rootStyle, ambientStyle]"
		data-theme="dark"
		role="region"
		tabindex="-1"
		:aria-label="accessibleName"
		@dragover="onCaptionDragOver"
		@dragleave="onCaptionDragLeave"
		@drop="onCaptionDrop">
		<div v-if="isMini" class="base-media-player__mini-placeholder" aria-hidden="true">
			<MediaIcon name="mini" />
			{{ UI_PLAYER.MINI_PLACEHOLDER }}
		</div>
		<div class="base-media-player__dock">
			<BaseContextMenu
				class="base-media-player__frame"
				:items="contextItems"
				:custom-class="contextClasses"
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
				<Transition name="base-media-player__cover">
					<div v-if="isCoverVisible" class="base-media-player__cover" aria-hidden="true">
						<img v-if="posterSrc" class="base-media-player__cover-media" :src="posterSrc" alt="" />
						<video
							v-if="posterVideoSrc"
							class="base-media-player__cover-media"
							:src="posterVideoSrc"
							autoplay
							muted
							loop
							playsinline
							disablepictureinpicture
							disableremoteplayback></video>
					</div>
				</Transition>
				<Transition name="base-media-player__paused">
					<div
						v-if="isPauseScreen"
						class="base-media-player__paused"
						:class="{ 'base-media-player__paused--next': nextCountdown !== null }">
						<button type="button" class="base-media-player__big-play" tabindex="-1" aria-hidden="true" @click="actions.play">
							<MediaIcon :name="pauseScreenIcon" />
						</button>
					</div>
				</Transition>
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
					<MediaIcon :name="seekHint.side === 'left' ? 'rewind' : 'forward'" />
					<span class="base-media-player__seek-hint-label">{{ seekHintText }}</span>
				</div>
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
				<Transition name="base-media-player__loader">
					<div v-if="isBuffering" class="base-media-player__loader" role="status" :aria-label="UI_PLAYER.LOADING">
						<MediaIcon name="loading" />
					</div>
				</Transition>
				<div v-if="isStartScreen" class="base-media-player__start">
					<button type="button" class="base-media-player__big-play" tabindex="-1" aria-hidden="true" @click="actions.play">
						<MediaIcon name="play" />
					</button>
					<p v-if="isAutoplayBlocked" class="base-media-player__hint" role="status">{{ errorMessage }}</p>
				</div>
				<div v-if="overlayError" class="base-media-player__overlay" :class="classes.overlay" role="alert">
					<slot name="error" :error="overlayError" :retry="retryPlayback">
						<MediaIcon name="alert" class="base-media-player__overlay-icon" />
						<p class="base-media-player__overlay-title">{{ UI_PLAYER.ERROR_TITLE }}</p>
						<p class="base-media-player__message">{{ errorMessage }}</p>
						<button v-if="canRetry" type="button" class="base-media-player__retry" @click="retryPlayback">
							<MediaIcon name="refresh" />
							{{ UI_TEXT.RETRY }}
						</button>
					</slot>
				</div>
				<MediaControlBar />
				<MediaAdOverlay />
				<MediaClipOverlay />
				<MediaNotices>
					<template v-if="$slots.banner" #banner="bannerProps"><slot name="banner" v-bind="bannerProps" /></template>
				</MediaNotices>
				<Transition name="base-media-player__resume">
					<div v-if="resumeTime !== null" class="base-media-player__resume">
						<span>{{ resumeText }}</span>
						<BaseButton variant="soft" :size-scale="sizeScale" @click="resume">{{ UI_PLAYER.RESUME_YES }}</BaseButton>
						<BaseButton variant="ghost" class="base-media-player__button" :size-scale="sizeScale" @click="dismissResume">
							{{ UI_PLAYER.RESUME_NO }}
						</BaseButton>
					</div>
				</Transition>
				<MediaStatsPanel v-if="isStatsOpen" :rows="statsRows" :events="statsEvents" @close="toggleStats" @copy="copyStats" />
				<Transition name="base-media-player__skip">
					<button
						v-if="skipChapter && !activeAdSegment"
						type="button"
						class="base-media-player__skip"
						@click="skipCurrentChapter">
						{{ skipLabel }}
						<MediaIcon name="skip" />
					</button>
				</Transition>
				<MediaNextCard />
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
				<div class="base-media-player__toasts">
					<div v-if="isBoosted" class="base-media-player__boost" aria-hidden="true">{{ boostRate }}×</div>
					<MediaAchievementToast />
					<div class="base-media-player__flash" role="status">{{ flashMessage }}</div>
				</div>
				<MediaChaptersPanel />
				<MediaEpisodesPanel />
				<div v-if="isMini" class="base-media-player__mini-bar">
					<MediaControlButton icon="expand" :label="UI_PLAYER.MINI_EXPAND" @click="expandMini" />
					<MediaControlButton icon="close" :label="UI_PLAYER.MINI_CLOSE" @click="closeMini" />
				</div>
			</BaseContextMenu>
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseMediaPlayer.style.scss'
import '../styles/MediaOverlays.style.scss'
import '../styles/MediaPanels.style.scss'
import MediaIcon from './controls/MediaIcon.vue'
import { BaseButton } from '@components/BaseButton'
import { UI_PLAYER, UI_TEXT } from '../model/messages'
import MediaNotices from './overlays/MediaNotices.vue'
import { kitDefaults } from '@composables/useDefaults'
import MediaNextCard from './overlays/MediaNextCard.vue'
import MediaAdOverlay from './overlays/MediaAdOverlay.vue'
import MediaReportForm from './panels/MediaReportForm.vue'
import MediaStatsPanel from './panels/MediaStatsPanel.vue'
import MediaControlBar from './controls/MediaControlBar.vue'
import { BaseContextMenu } from '@components/BaseContextMenu'
import MediaCastOverlay from './overlays/MediaCastOverlay.vue'
import MediaClipOverlay from './overlays/MediaClipOverlay.vue'
import MediaChaptersPanel from './panels/MediaChaptersPanel.vue'
import MediaEpisodesPanel from './panels/MediaEpisodesPanel.vue'
import MediaControlButton from './controls/MediaControlButton.vue'
import { useBaseMediaPlayer } from '../model/player/useBaseMediaPlayer'
import MediaAchievementToast from './overlays/MediaAchievementToast.vue'
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
		hasSeekPreview: true,
		hasMiniPlayer: false,
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
	isMini,
	closeMini,
	expandMini,
	isAmbient,
	ambientStyle,
	rotationClass,
	isFullscreen,
	isTheater,
	src,
	posterSrc,
	posterVideoSrc,
	isCoverVisible,
	isPauseScreen,
	pauseScreenIcon,
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
	contextClasses,
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
	statsEvents,
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
	skipChapter,
	skipCurrentChapter,
	skipLabel,
	nextCountdown,
	exposed,
	isAdPlaying,
	isClipPlaying,
	isCasting,
	isCastConnected,
	activeAdSegment,
} = useBaseMediaPlayer(props, emit)

defineExpose<BaseMediaPlayerExpose>(exposed)
</script>
