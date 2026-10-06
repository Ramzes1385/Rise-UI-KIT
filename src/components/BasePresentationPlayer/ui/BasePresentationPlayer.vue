<template>
	<div
		ref="rootRef"
		class="base-media-player"
		:class="[
			ui('root'),
			variantClass,
			{
				'base-media-player--idle': isIdle,
				'base-media-player--fullscreen': isFullscreen,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, rootStyle]"
		data-theme="dark"
		role="region"
		tabindex="-1"
		:aria-label="title">
		<div class="base-media-player__dock">
			<div :class="[ui('stage'), classes.stage, { 'base-presentation-player__stage--backward': isBackward }]" @click="onStageClick">
				<Transition name="base-presentation-player__slide" mode="out-in">
					<div v-if="slide" :key="slide.id" :class="ui('slide')">
						<slot name="slide" :slide="slide" :index="index" v-bind="slideActions">
							<video
								v-if="videoSrc"
								ref="videoRef"
								class="base-media-player__media"
								:src="videoSrc"
								:muted="isVideoMuted"
								:autoplay="isVideoMuted"
								:loop="isVideoMuted"
								:crossorigin="crossorigin"
								:aria-label="slide.alt ?? slide.title"
								playsinline
								@play="onMediaPlay"
								@pause="onMediaPause"></video>
							<img
								v-else-if="imageSrc"
								class="base-media-player__media"
								:src="imageSrc"
								:alt="slide.alt ?? slide.title"
								:crossorigin="crossorigin" />
						</slot>
					</div>
				</Transition>
			</div>
			<PresentationCaptions v-if="captionLines.length" :lines="captionLines" :box-style="captionBoxStyle" />
			<audio
				ref="audioRef"
				class="base-media-player__audio"
				:src="audioSrc"
				preload="auto"
				:crossorigin="crossorigin"
				@play="onMediaPlay"
				@pause="onMediaPause"></audio>
			<div v-if="hasTitle" class="base-media-player__top">
				<span class="base-media-player__title">
					{{ title }}
					<span v-if="slide" class="base-media-player__episode">· {{ slide.title }}</span>
				</span>
			</div>
			<Transition name="base-media-player__loader">
				<div v-if="isWaiting" class="base-media-player__loader" role="status" :aria-label="UI_PLAYER.LOADING">
					<MediaIcon name="loading" />
				</div>
			</Transition>
			<div v-if="isStartScreen" class="base-media-player__start">
				<button type="button" class="base-media-player__big-play" tabindex="-1" aria-hidden="true" @click="play">
					<MediaIcon name="play" />
				</button>
			</div>
			<div v-if="isDoneScreen" :class="ui('done')">
				<MediaIcon :class="ui('done-icon')" name="trophy" />
				<p :class="ui('done-title')">{{ doneTitle }}</p>
				<p :class="ui('done-text')">{{ doneText }}</p>
				<BaseButton variant="soft" :size-scale="sizeScale" @click="play">{{ UI_PRESENTATION.REPLAY }}</BaseButton>
			</div>
			<Transition name="base-media-player__resume">
				<div v-if="resumeIndex !== null" class="base-media-player__resume">
					<span>{{ resumeText }}</span>
					<BaseButton variant="soft" :size-scale="sizeScale" @click="resume">{{ UI_PRESENTATION.RESUME_YES }}</BaseButton>
					<BaseButton variant="ghost" class="base-media-player__button" :size-scale="sizeScale" @click="dismissResume">
						{{ UI_PRESENTATION.RESUME_NO }}
					</BaseButton>
				</div>
			</Transition>
			<div class="base-media-player__controls" :class="classes.controls">
				<MediaSlider
					class="base-media-player__seek"
					:model-value="sliderValue"
					:max="sliderMax"
					:step="1"
					:large-step="1"
					:label="UI_PRESENTATION.SLIDES"
					:value-text="valueText"
					:segments="segments"
					:hover-text="hoverText"
					@update:model-value="onSeek" />
				<div class="base-media-player__bar">
					<div class="base-media-player__group">
						<MediaControlButton
							icon="previous"
							:label="UI_PRESENTATION.PREVIOUS"
							:aria-disabled="index === 0 || undefined"
							@click="previous" />
						<MediaControlButton :icon="playIcon" :label="playLabel" @click="togglePlay" />
						<span
							:class="[ui('next'), { 'base-presentation-player__next--locked': isNextLocked }]"
							:style="{ '--presentation-lock': lockPercent }">
							<MediaControlButton
								icon="next"
								:label="UI_PRESENTATION.NEXT"
								:tooltip="isNextLocked ? lockText : undefined"
								:aria-disabled="index >= count - 1 || isNextLocked || undefined"
								:aria-describedby="isNextLocked ? lockHintId : undefined"
								@click="next" />
							<svg v-if="isNextLocked" :class="ui('ring')" viewBox="0 0 36 36" aria-hidden="true">
								<circle class="base-presentation-player__ring-track" cx="18" cy="18" r="16" />
								<circle class="base-presentation-player__ring-fill" cx="18" cy="18" r="16" pathLength="100" />
							</svg>
							<span v-if="isNextLocked" :id="lockHintId" class="base-media-player__visually-hidden">{{ lockText }}</span>
						</span>
						<div class="base-media-player__volume-group">
							<MediaControlButton :icon="volumeIcon" :label="muteLabel" @click="toggleMute" />
							<div class="base-media-player__volume-popover">
								<MediaSlider
									class="base-media-player__volume"
									:model-value="volumeValue"
									:max="1"
									:step="0.05"
									:large-step="0.1"
									:label="UI_PLAYER.VOLUME"
									:value-text="volumeValueText"
									is-vertical
									@update:model-value="setVolume" />
							</div>
						</div>
						<div class="base-media-player__info">
							<span class="base-media-player__time" aria-hidden="true">{{ index + 1 }} / {{ count }}</span>
						</div>
					</div>
					<div class="base-media-player__group base-media-player__group--end">
						<MediaControlButton
							v-if="hasCaptions"
							class="base-presentation-player__captions-button"
							:icon="isCaptionsOn ? 'captions' : 'captions-off'"
							:label="UI_PLAYER.CAPTIONS"
							:is-active="isCaptionsOn"
							:aria-pressed="isCaptionsOn"
							@click="toggleCaptions" />
						<MediaControlButton
							v-if="hasNotes"
							class="base-presentation-player__notes-button"
							icon="list"
							:label="UI_PRESENTATION.NOTES"
							:is-active="panelView === 'notes'"
							:aria-expanded="panelView === 'notes'"
							@click="togglePanel('notes')" />
						<MediaControlButton
							class="base-presentation-player__slides-button"
							icon="playlist"
							:label="UI_PRESENTATION.SLIDE_LIST"
							:badge="count"
							:is-active="panelView === 'slides'"
							:aria-expanded="panelView === 'slides'"
							@click="togglePanel('slides')" />
						<MediaPopover v-if="speedMenu.items.length > 1">
							<template #default="{ isOpen, toggle }">
								<MediaControlButton
									icon="speed"
									:label="UI_PLAYER.SPEED_MENU"
									:text="rateText"
									aria-haspopup="menu"
									:aria-expanded="isOpen"
									@click="toggle" />
							</template>
							<template #panel="{ close }"><MediaMenuPanel :menu="speedMenu" @close="close" /></template>
						</MediaPopover>
						<MediaControlButton
							v-if="isFullscreenSupported"
							:icon="isFullscreen ? 'fullscreen-exit' : 'fullscreen'"
							:label="fullscreenLabel"
							@click="toggleFullscreen" />
					</div>
				</div>
			</div>
			<Transition name="base-media-player__episodes" :duration="panelDuration">
				<section
					v-if="panelView"
					ref="panelRef"
					class="base-media-player__episodes"
					:class="ui('panel')"
					:aria-label="panelView === 'notes' ? UI_PRESENTATION.NOTES : UI_PRESENTATION.SLIDE_LIST"
					@keydown="onPanelKeydown">
					<div class="base-media-player__episodes-header">
						<div v-if="hasNotes" class="base-media-player__episodes-views">
							<button
								type="button"
								class="base-media-player__episodes-view"
								:aria-pressed="panelView === 'slides'"
								@click="showPanelView('slides')">
								{{ UI_PRESENTATION.SLIDE_LIST }}
							</button>
							<button
								type="button"
								class="base-media-player__episodes-view"
								:aria-pressed="panelView === 'notes'"
								@click="showPanelView('notes')">
								{{ UI_PRESENTATION.NOTES }}
							</button>
						</div>
						<span v-else class="base-media-player__episodes-title">{{ UI_PRESENTATION.SLIDE_LIST }}</span>
						<MediaControlButton icon="close" :label="UI_ARIA.CLOSE" @click="closePanel" />
					</div>
					<div v-if="panelView === 'notes'" :class="ui('notes')" tabindex="-1">
						<p v-if="slide" :class="ui('notes-title')">{{ index + 1 }}. {{ slide.title }}</p>
						<p v-for="(paragraph, paragraphIndex) in notesParagraphs" :key="paragraphIndex" :class="ui('notes-text')">
							{{ paragraph }}
						</p>
						<p v-if="!notesParagraphs.length" :class="ui('notes-text')">{{ UI_PRESENTATION.NOTES_EMPTY }}</p>
					</div>
					<ol v-else class="base-media-player__episodes-list">
						<li v-for="card in slideCards" :key="card.id" :style="{ '--media-item-index': card.index }">
							<button
								type="button"
								class="base-media-player__episode-card"
								:class="{
									'base-media-player__episode-card--current': card.isCurrent,
									'base-presentation-player__card--locked': card.isLocked,
								}"
								:aria-current="card.isCurrent ? 'true' : undefined"
								:aria-disabled="card.isLocked || undefined"
								@click="chooseSlide(card.index)">
								<span class="base-media-player__episode-number" aria-hidden="true">{{ card.number }}</span>
								<span class="base-media-player__episode-cover" aria-hidden="true">
									<img
										v-if="card.image"
										class="base-media-player__episode-image"
										:src="card.image"
										alt=""
										loading="lazy" />
									<span v-if="card.duration" class="base-media-player__episode-duration">{{ card.duration }}</span>
								</span>
								<span class="base-media-player__episode-info">
									<span class="base-media-player__episode-name">{{ card.title }}</span>
								</span>
								<span v-if="card.isLocked" :class="ui('card-mark')">
									<svg class="base-presentation-player__lock" viewBox="0 0 448 512" aria-hidden="true">
										<path :d="PRESENTATION_LOCK_ICON" />
									</svg>
									<span class="base-media-player__visually-hidden">{{ UI_PRESENTATION.SLIDE_LOCKED }}</span>
								</span>
								<span v-else-if="card.isCompleted" :class="[ui('card-mark'), 'base-presentation-player__card-mark--done']">
									<MediaIcon name="check" />
									<span class="base-media-player__visually-hidden">{{ UI_PRESENTATION.SLIDE_DONE }}</span>
								</span>
							</button>
						</li>
					</ol>
				</section>
			</Transition>
			<div class="base-media-player__visually-hidden" role="status">{{ statusText }}</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BasePresentationPlayer.style.scss'
import '@components/BaseMediaPlayer/styles/BaseMediaPlayer.style.scss'
import '@components/BaseMediaPlayer/styles/MediaControls.style.scss'
import '@components/BaseMediaPlayer/styles/MediaMenus.style.scss'
import '@components/BaseMediaPlayer/styles/MediaOverlays.style.scss'
import '@components/BaseMediaPlayer/styles/MediaPanels.style.scss'
import { BaseButton } from '@components/BaseButton'
import { kitDefaults } from '@composables/base/useDefaults'
import PresentationCaptions from './PresentationCaptions.vue'
import MediaIcon from '@components/BaseMediaPlayer/ui/controls/MediaIcon.vue'
import MediaPopover from '@components/BaseMediaPlayer/ui/menus/MediaPopover.vue'
import MediaSlider from '@components/BaseMediaPlayer/ui/controls/MediaSlider.vue'
import MediaMenuPanel from '@components/BaseMediaPlayer/ui/menus/MediaMenuPanel.vue'
import { useBasePresentationPlayer } from '../model/player/useBasePresentationPlayer'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import MediaControlButton from '@components/BaseMediaPlayer/ui/controls/MediaControlButton.vue'
import type {
	BasePresentationPlayerEmits,
	BasePresentationPlayerExpose,
	BasePresentationPlayerProps,
	BasePresentationPlayerSlots,
} from '../types/BasePresentationPlayer.types'

const props = withDefaults(
	defineProps<BasePresentationPlayerProps>(),
	kitDefaults('BasePresentationPlayer', {
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
		audio: undefined,
		slide: undefined,
		hasTitle: true,
		hasKeyboardShortcuts: true,
		playbackRates: () => [0.75, 1, 1.25, 1.5, 2],
		aspectRatio: '16 / 9',
		idleTimeout: 3000,
		crossorigin: undefined,
		navigation: 'free',
		maxRate: 1,
		storageKey: undefined,
		captions: undefined,
		isCaptionsOn: undefined,
		speechVoice: undefined,
		speechProvider: undefined,
	}),
)

const emit = defineEmits<BasePresentationPlayerEmits>()

defineSlots<BasePresentationPlayerSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	rootStyle,
	rootRef,
	audioRef,
	videoRef,
	slide,
	index,
	count,
	audioSrc,
	videoSrc,
	imageSrc,
	isVideoMuted,
	playIcon,
	isNextLocked,
	lockText,
	lockHintId,
	lockPercent,
	isDoneScreen,
	doneTitle,
	doneText,
	resumeIndex,
	resumeText,
	resume,
	dismissResume,
	isWaiting,
	isStartScreen,
	isIdle,
	isFullscreen,
	isFullscreenSupported,
	UI_PLAYER,
	UI_PRESENTATION,
	sliderValue,
	sliderMax,
	segments,
	valueText,
	hoverText,
	statusText,
	playLabel,
	muteLabel,
	volumeIcon,
	volumeValue,
	volumeValueText,
	fullscreenLabel,
	rateText,
	speedMenu,
	play,
	pause,
	togglePlay,
	next,
	previous,
	goTo,
	onSeek,
	onStageClick,
	setVolume,
	toggleMute,
	toggleFullscreen,
	onMediaPlay,
	onMediaPause,
	captionLines,
	captionBoxStyle,
	hasCaptions,
	isCaptionsOn,
	toggleCaptions,
	hasNotes,
	panelView,
	panelRef,
	togglePanel,
	showPanelView,
	closePanel,
	notesParagraphs,
	slideCards,
	chooseSlide,
	onPanelKeydown,
	slideActions,
	UI_ARIA,
	PRESENTATION_LOCK_ICON,
	ui,
	isBackward,
	panelDuration,
} = useBasePresentationPlayer(props, emit)

defineExpose<BasePresentationPlayerExpose>({ play, pause, next, previous, goTo })
</script>
