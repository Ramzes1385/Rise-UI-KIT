<template>
	<div
		ref="rootRef"
		data-rise-bounds
		:class="[
			ui('root'),
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
		<component :is="'script'" v-if="structuredData" type="application/ld+json" v-html="structuredData" />
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
					:class="[ui('media'), classes.media]"
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
					<div v-if="isCoverVisible" :class="ui('cover')" aria-hidden="true">
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
					<div v-if="isPauseScreen" :class="[ui('paused'), { 'base-media-player__paused--next': nextCountdown !== null }]">
						<button type="button" :class="ui('big-play')" tabindex="-1" aria-hidden="true" @click="actions.play">
							<MediaIcon :name="pauseScreenIcon" />
						</button>
					</div>
				</Transition>
				<div v-if="captionLines.length || isCaptionDragging" :class="ui('captions')">
					<BaseTooltip is-wrapperless :text="UI_PLAYER.CAPTIONS_DRAG">
						<div
							class="base-media-player__caption-box"
							:class="captionBoxClass"
							:style="captionBoxStyle"
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
					</BaseTooltip>
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
				<div v-if="hasTitle || logoSrc" :class="[ui('top'), `base-media-player__top--logo-${logoPosition}`]">
					<span v-if="hasTitle" :class="[ui('title'), classes.title]">
						{{ title }}
						<span v-if="episodeTitle" class="base-media-player__episode">· {{ episodeTitle }}</span>
					</span>
					<BaseLink
						v-if="logoSrc && logoLink"
						variant="ghost"
						:class="[ui('logo'), classes.logo]"
						:href="logoLink"
						target="_blank"
						:has-external-icon="false"
						:aria-label="logoAlt">
						<img class="base-media-player__logo-image" :src="logoSrc" alt="" />
					</BaseLink>
					<img v-else-if="logoSrc" :class="[ui('logo'), classes.logo]" :src="logoSrc" :alt="logoAlt ?? ''" />
				</div>
				<Transition name="base-media-player__loader">
					<div v-if="isBuffering" :class="ui('loader')" role="status" :aria-label="UI_PLAYER.LOADING">
						<MediaIcon name="loading" />
					</div>
				</Transition>
				<div v-if="isStartScreen" :class="ui('start')">
					<button type="button" :class="ui('big-play')" tabindex="-1" aria-hidden="true" @click="actions.play">
						<MediaIcon name="play" />
					</button>
					<p v-if="isAutoplayBlocked" class="base-media-player__hint" role="status">{{ errorMessage }}</p>
				</div>
				<MediaErrorScreen>
					<template v-if="$slots.error" #default="errorProps"><slot name="error" v-bind="errorProps" /></template>
				</MediaErrorScreen>
				<MediaControlBar />
				<MediaAdOverlay />
				<MediaClipOverlay />
				<MediaNotices>
					<template v-if="$slots.banner" #banner="bannerProps"><slot name="banner" v-bind="bannerProps" /></template>
				</MediaNotices>
				<Transition name="base-media-player__resume">
					<div v-if="resumeTime !== null" :class="ui('resume')">
						<span>{{ resumeText }}</span>
						<BaseButton variant="soft" :size-scale="sizeScale" @click="resume">{{ UI_PLAYER.RESUME_YES }}</BaseButton>
						<BaseButton variant="ghost" class="base-media-player__button" :size-scale="sizeScale" @click="dismissResume">
							{{ UI_PLAYER.RESUME_NO }}
						</BaseButton>
					</div>
				</Transition>
				<MediaStatsPanel v-if="isStatsOpen" :rows="statsRows" :events="statsEvents" @close="toggleStats" @copy="copyStats" />
				<Transition name="base-media-player__skip">
					<button v-if="skipChapter && !activeAdSegment" type="button" :class="ui('skip')" @click="skipCurrentChapter">
						{{ skipLabel }}
						<MediaIcon name="skip" />
					</button>
				</Transition>
				<MediaNextCard />
				<MediaReportForm v-model:is-open="isReportOpen" @submit="submitReport" />
				<MediaSharePanel v-if="hasShare" />
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
import { UI_PLAYER } from '../model/messages'
import { BaseLink } from '@components/BaseLink'
import MediaIcon from './controls/MediaIcon.vue'
import { BaseButton } from '@components/BaseButton'
import { BaseTooltip } from '@components/BaseTooltip'
import MediaNotices from './overlays/MediaNotices.vue'
import MediaNextCard from './overlays/MediaNextCard.vue'
import MediaAdOverlay from './overlays/MediaAdOverlay.vue'
import MediaReportForm from './panels/MediaReportForm.vue'
import MediaSharePanel from './panels/MediaSharePanel.vue'
import MediaStatsPanel from './panels/MediaStatsPanel.vue'
import { kitDefaults } from '@composables/base/useDefaults'
import MediaControlBar from './controls/MediaControlBar.vue'
import { BaseContextMenu } from '@components/BaseContextMenu'
import MediaCastOverlay from './overlays/MediaCastOverlay.vue'
import MediaClipOverlay from './overlays/MediaClipOverlay.vue'
import MediaErrorScreen from './overlays/MediaErrorScreen.vue'
import MediaChaptersPanel from './panels/MediaChaptersPanel.vue'
import MediaEpisodesPanel from './panels/MediaEpisodesPanel.vue'
import MediaControlButton from './controls/MediaControlButton.vue'
import { useBaseMediaPlayer } from '../model/player/useBaseMediaPlayer'
import MediaAchievementToast from './overlays/MediaAchievementToast.vue'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
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
		errorEffect: 'retro',
		seo: false,
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
	structuredData,
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
	isAutoplayBlocked,
	errorMessage,
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
	accessibleName,
	episodeTitle,
	skipChapter,
	skipCurrentChapter,
	skipLabel,
	nextCountdown,
	exposed,
	ui,
	isAdPlaying,
	isClipPlaying,
	isCasting,
	isCastConnected,
	activeAdSegment,
} = useBaseMediaPlayer(props, emit)

defineExpose<BaseMediaPlayerExpose>(exposed)
</script>
