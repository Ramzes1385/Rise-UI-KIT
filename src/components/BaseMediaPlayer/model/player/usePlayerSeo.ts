import type { StructuredData } from '@utils/seo/structuredDataUtils'
import { useStructuredData } from '@composables/seo/useStructuredData'
import type { MediaPlayerProps } from '../../types/BaseMediaPlayer.types'
import type { MediaSourceItem } from '../../types/playback/MediaCore.types'
import type { StructuredDataContext } from '@composables/seo/useStructuredData'

function firstSource(sources: MediaSourceItem[] | string | undefined): string | undefined {
	return typeof sources === 'string' ? sources : sources?.[0]?.src
}

function mediaSchema(
	props: MediaPlayerProps,
	content: { name: () => string; poster: () => string | undefined; sources: () => MediaSourceItem[] | string | undefined },
	{ url }: StructuredDataContext,
): StructuredData {
	return {
		'@type': props.mode === 'audio' ? 'AudioObject' : 'VideoObject',
		name: content.name(),
		thumbnailUrl: url(content.poster()),
		contentUrl: url(firstSource(content.sources())),
	}
}

export function usePlayerSeo(
	props: MediaPlayerProps,
	content: { name: () => string; poster: () => string | undefined; sources: () => MediaSourceItem[] | string | undefined },
) {
	return useStructuredData(
		'BaseMediaPlayer',
		() => props.seo,
		context => mediaSchema(props, content, context),
	)
}
