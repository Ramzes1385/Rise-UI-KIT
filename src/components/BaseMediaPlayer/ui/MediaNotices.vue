<template>
	<div
		v-for="banner in visibleBanners"
		:key="banner.id"
		class="base-media-player__banner"
		:class="`base-media-player__banner--${banner.position ?? 'bottom-left'}`">
		<slot name="banner" :banner="banner" :close="() => closeBanner(banner)">
			<component
				:is="bannerLink(banner) ? 'a' : 'div'"
				class="base-media-player__banner-body"
				:href="bannerLink(banner)"
				:target="bannerLink(banner) ? '_blank' : undefined"
				:rel="bannerLink(banner) ? 'noopener noreferrer' : undefined"
				@click="clickBanner(banner)">
				<img v-if="bannerImage(banner)" class="base-media-player__banner-image" :src="bannerImage(banner)" alt="" />
				<span v-if="banner.text" class="base-media-player__banner-text">{{ banner.text }}</span>
			</component>
		</slot>
		<BaseButton
			v-if="banner.isClosable !== false"
			variant="ghost"
			class="base-media-player__button base-media-player__banner-close"
			:aria-label="UI_ARIA.CLOSE"
			@click="closeBanner(banner)">
			<template #left><BaseIcon name="close" /></template>
		</BaseButton>
	</div>
	<div v-if="achievementToast" class="base-media-player__achievement" role="status" @click="dismissAchievement">
		<img v-if="achievementIcon" class="base-media-player__achievement-icon" :src="achievementIcon" alt="" />
		<div class="base-media-player__achievement-text">
			<p class="base-media-player__achievement-label">{{ UI_PLAYER.ACHIEVEMENT }}</p>
			<p class="base-media-player__achievement-title">{{ achievementToast.title }}</p>
			<p v-if="achievementToast.description" class="base-media-player__achievement-description">{{ achievementToast.description }}</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { UI_ARIA, UI_PLAYER } from '@/locales/messages'
import { usePlayerContext } from '../model/usePlayerContext'
import type { MediaNoticesSlots } from '../types/MediaNotices.types'

defineSlots<MediaNoticesSlots>()

const { visibleBanners, bannerImage, bannerLink, clickBanner, closeBanner, achievementToast, achievementIcon, dismissAchievement } =
	usePlayerContext()
</script>
