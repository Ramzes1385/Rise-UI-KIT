import { formatMessage } from '@/locales'
import { computed, nextTick, ref } from 'vue'
import type { UiProp } from '@composables/base/useUi'
import type { BaseModalPart } from '@components/BaseModal'
import { UI_ARIA, UI_IMAGE_VIEWER } from '@/locales/messages'
import type { BaseImageZoomProps } from '../types/BaseImageZoom.types'

export function useBaseImageZoom(props: BaseImageZoomProps) {
	const zoomImgRef = ref<HTMLElement | null>(null)
	const minimapImgRef = ref<HTMLElement | null>(null)
	const imageAlt = computed((): string => props.gallery.currentAlt.value ?? props.alt)

	return {
		imageAlt,
		dialogLabel: computed((): string => {
			const title = imageAlt.value ? formatMessage(UI_IMAGE_VIEWER.TITLE_NAMED, { alt: imageAlt.value }) : UI_ARIA.IMAGE_VIEWER
			if (!props.gallery.hasGallery.value) return title
			const position = { current: props.gallery.galleryIndex.value + 1, total: props.gallery.galleryList.value.length }
			return formatMessage(UI_IMAGE_VIEWER.TITLE_POSITION, { title, ...position })
		}),
		modalUi: computed((): UiProp<BaseModalPart> => ({
			root: [
				props.ui('zoom'),
				props.gallery.hasGallery.value && 'base-image__zoom--gallery',
				props.zoom.isZoomAnimated.value && 'base-image__zoom--animated',
			]
				.filter(Boolean)
				.join(' '),
			content: 'base-image__zoom-dialog',
			body: 'base-image__zoom-body',
		})),
		thumbLabel: (index: number): string =>
			formatMessage(UI_ARIA.GALLERY_ITEM, { current: index + 1, total: props.gallery.galleryList.value.length }),
		zoomImgRef,
		minimapImgRef,
		handleImageLoad: () => nextTick(props.zoom.syncSizes),
		exposed: { zoomImgRef, minimapImgRef },
	}
}
