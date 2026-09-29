import { isSafeUrl } from '@utils/urlUtils'
import { computed, reactive, watch } from 'vue'
import type { MediaBanner, MediaBannersOptions } from '../types/MediaNotices.types'

const DEFAULT_DURATION = 10

const IMAGE_PROTOCOLS = ['http:', 'https:', 'blob:', 'data:'] as const

const LINK_PROTOCOLS = ['http:', 'https:'] as const

export function useMediaBanners(options: MediaBannersOptions) {
	const closed = reactive(new Set<string>())
	const visible = computed(() =>
		(options.banners() ?? []).filter(banner => {
			const time = options.state.currentTime
			return !closed.has(banner.id) && banner.start <= time && time < (banner.end ?? banner.start + DEFAULT_DURATION)
		}),
	)
	watch(visible, (banners, previous) => {
		const shown = new Set(previous.map(banner => banner.id))
		banners.filter(banner => !shown.has(banner.id)).forEach(banner => options.emitBanner({ type: 'show', banner }))
	})
	watch([() => options.state.isEnded, options.banners], ([isEnded], [, previousBanners]) => {
		if (isEnded || options.banners() !== previousBanners) closed.clear()
	})

	return {
		visibleBanners: visible,
		bannerImage: (banner: MediaBanner): string | undefined =>
			banner.image && isSafeUrl(banner.image, IMAGE_PROTOCOLS) ? banner.image : undefined,
		bannerLink: (banner: MediaBanner): string | undefined =>
			banner.href && isSafeUrl(banner.href, LINK_PROTOCOLS) ? banner.href : undefined,
		clickBanner: (banner: MediaBanner): void => options.emitBanner({ type: 'click', banner }),
		closeBanner(banner: MediaBanner): void {
			closed.add(banner.id)
			options.emitBanner({ type: 'close', banner })
		},
	}
}
