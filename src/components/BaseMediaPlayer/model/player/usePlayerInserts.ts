import type { Ref } from 'vue'
import { MEDIA_PROTOCOLS } from '../core/useMediaSources'
import { useMediaClips } from '../playlist/useMediaClips'
import { useMediaAdBreaks } from '../ads/useMediaAdBreaks'
import { useMediaBanners } from '../notices/useMediaBanners'
import { useMediaAdSegments } from '../ads/useMediaAdSegments'
import { useMediaAchievements } from '../notices/useMediaAchievements'
import type { usePlayerPlaylist } from '../playlist/usePlayerPlaylist'
import type { MediaAdEvent } from '../../types/overlays/MediaAds.types'
import type { BaseMediaPlayerEmits, MediaPlayerProps } from '../../types/BaseMediaPlayer.types'
import type { MediaState, MediaActions, MediaSourceItem } from '../../types/playback/MediaCore.types'

export function lowestSource(sources: MediaSourceItem[]): MediaSourceItem | undefined {
	const height = (item: MediaSourceItem): number => Number.parseInt(item.label ?? '', 10)
	return sources.filter(item => Number.isFinite(height(item))).sort((a, b) => height(a) - height(b))[0]
}

export function usePlayerAds(
	emit: BaseMediaPlayerEmits,
	player: {
		state: Readonly<MediaState>
		actions: MediaActions
		elements: { mediaRef: Ref<HTMLVideoElement | null>; adMediaRef: Ref<HTMLVideoElement | null> }
		series: ReturnType<typeof usePlayerPlaylist>
	},
) {
	const options = {
		breaks: player.series.content.adBreaks,
		segments: player.series.content.adSegments,
		state: player.state,
		actions: player.actions,
		media: player.elements.mediaRef,
		adMedia: player.elements.adMediaRef,
		emitAd: (event: MediaAdEvent) => emit('ad', event),
	}
	return { ...useMediaAdBreaks(options), ...useMediaAdSegments(options) }
}

export function usePlayerClips(
	props: MediaPlayerProps,
	player: {
		state: Readonly<MediaState>
		actions: MediaActions
		elements: { mediaRef: Ref<HTMLVideoElement | null>; clipMediaRef: Ref<HTMLVideoElement | null> }
		series: ReturnType<typeof usePlayerPlaylist>
		ads: { isAdPlaying: Readonly<Ref<boolean>> }
	},
) {
	return useMediaClips({
		intro: player.series.content.intro,
		outro: player.series.content.outro,
		contentKey: player.series.content.key,
		state: player.state,
		actions: player.actions,
		media: player.elements.mediaRef,
		clipMedia: player.elements.clipMediaRef,
		isAdPlaying: () => player.ads.isAdPlaying.value,
		allowedProtocols: () => props.allowedProtocols ?? MEDIA_PROTOCOLS,
	})
}

export function usePlayerNotices(
	props: MediaPlayerProps,
	emit: BaseMediaPlayerEmits,
	player: { state: Readonly<MediaState>; series: ReturnType<typeof usePlayerPlaylist> },
) {
	return {
		...useMediaBanners({ banners: player.series.content.banners, state: player.state, emitBanner: event => emit('banner', event) }),
		...useMediaAchievements({
			achievements: () => props.achievements,
			earned: () => props.earnedAchievements,
			state: player.state,
			emitAchievement: achievement => emit('achievement', achievement),
		}),
	}
}
