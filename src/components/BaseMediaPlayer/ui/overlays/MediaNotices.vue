<template>
	<div
		v-for="banner in visibleBanners"
		:key="banner.id"
		class="base-media-player__banner"
		:class="`base-media-player__banner--${banner.position ?? 'bottom'}`">
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
				<MediaIcon v-if="bannerLink(banner)" class="base-media-player__banner-arrow" name="chevron-right" />
			</component>
		</slot>
		<button
			v-if="banner.isClosable !== false"
			type="button"
			class="base-media-player__banner-close"
			:aria-label="UI_ARIA.CLOSE"
			@pointerdown.stop
			@click.stop="closeBanner(banner)">
			<MediaIcon name="close" />
		</button>
	</div>
</template>

<script setup lang="ts">
import { UI_ARIA } from '../../model/messages'
import MediaIcon from '../controls/MediaIcon.vue'
import { usePlayerContext } from '../../model/player/usePlayerContext'
import type { MediaNoticesSlots } from '../../types/overlays/MediaNotices.types'

defineSlots<MediaNoticesSlots>()

const { visibleBanners, bannerImage, bannerLink, clickBanner, closeBanner } = usePlayerContext()
</script>
