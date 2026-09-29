<template>
	<div v-if="currentAd" class="base-media-player__ad" role="region" :aria-label="UI_PLAYER.AD">
		<video
			v-if="isAdVideo"
			ref="adMediaRef"
			class="base-media-player__ad-media"
			:src="currentAd.src"
			:muted="state.isMuted"
			playsinline
			@loadedmetadata="onAdTime"
			@timeupdate="onAdTime"
			@play="onAdPlayState"
			@pause="onAdPlayState"
			@ended="completeAd"
			@error="failAd"></video>
		<img v-else class="base-media-player__ad-media" :src="currentAd.src" :alt="currentAd.title ?? ''" />
		<a
			v-if="adLink"
			class="base-media-player__ad-surface"
			:href="adLink"
			target="_blank"
			rel="noopener noreferrer sponsored"
			tabindex="-1"
			aria-hidden="true"
			@click="clickAd"></a>
		<div class="base-media-player__ad-bar">
			<span class="base-media-player__ad-label">{{ adLabel }}</span>
			<BaseButton variant="ghost" class="base-media-player__button" :aria-label="adPauseLabel" @click="toggleAdPause">
				<template #left><BaseIcon :name="isAdPaused ? 'play' : 'pause'" /></template>
			</BaseButton>
			<a
				v-if="adLink"
				class="base-media-player__ad-link"
				:href="adLink"
				target="_blank"
				rel="noopener noreferrer sponsored"
				@click="clickAd">
				{{ UI_PLAYER.AD_VISIT }}
			</a>
			<BaseButton v-if="canSkipAd" variant="soft" class="base-media-player__ad-skip" @click="skipAd">{{
				UI_PLAYER.AD_SKIP
			}}</BaseButton>
			<span v-else-if="adSkipText" class="base-media-player__ad-wait">{{ adSkipText }}</span>
		</div>
		<div class="base-media-player__ad-progress" :style="adProgressStyle"></div>
	</div>
	<div v-else-if="isAdLoading" class="base-media-player__ad" role="region" :aria-label="UI_PLAYER.AD">
		<BaseLoader class="base-media-player__loader" :label="UI_PLAYER.LOADING" />
	</div>
	<div v-else-if="activeAdSegment" class="base-media-player__ad-segment">
		<span class="base-media-player__ad-label">{{ adSegmentLabel }}</span>
		<BaseButton v-if="canSkipAdSegment" variant="soft" class="base-media-player__ad-skip" @click="skipAdSegment">
			{{ UI_PLAYER.AD_SKIP }}
		</BaseButton>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { UI_PLAYER } from '../../model/messages'
import { BaseButton } from '@components/BaseButton'
import { BaseLoader } from '@components/BaseLoader'
import { usePlayerContext } from '../../model/player/usePlayerContext'

const {
	state,
	currentAd,
	isAdVideo,
	isAdPaused,
	isAdLoading,
	adMediaRef,
	adLabel,
	adLink,
	canSkipAd,
	adSkipText,
	adPauseLabel,
	adProgressStyle,
	skipAd,
	completeAd,
	failAd,
	clickAd,
	toggleAdPause,
	onAdTime,
	onAdPlayState,
	activeAdSegment,
	adSegmentLabel,
	canSkipAdSegment,
	skipAdSegment,
} = usePlayerContext()
</script>
