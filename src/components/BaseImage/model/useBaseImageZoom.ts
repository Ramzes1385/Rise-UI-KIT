import { formatMessage } from '@/locales'
import { computed, nextTick, ref } from 'vue'
import { UI_ARIA, UI_IMAGE_VIEWER } from '@/locales/messages'
import { useFocusTrap } from '@composables/overlay/useFocusTrap'
import type { BaseImageZoomProps } from '../types/BaseImageZoom.types'
import { useTeleportTarget } from '@composables/app/useTeleportTarget'

export function useBaseImageZoom(props: BaseImageZoomProps) {
	const teleportTarget = useTeleportTarget()
	const dialogRef = ref<HTMLElement | null>(null)
	const zoomImgRef = ref<HTMLElement | null>(null)
	const minimapImgRef = ref<HTMLElement | null>(null)
	useFocusTrap({ containerRef: dialogRef, isActive: () => true })
	const imageAlt = computed((): string => props.gallery.currentAlt.value ?? props.alt)

	return {
		teleportTarget,
		imageAlt,
		dialogLabel: computed((): string => {
			const title = imageAlt.value ? formatMessage(UI_IMAGE_VIEWER.TITLE_NAMED, { alt: imageAlt.value }) : UI_ARIA.IMAGE_VIEWER
			if (!props.gallery.hasGallery.value) return title
			const position = { current: props.gallery.galleryIndex.value + 1, total: props.gallery.galleryList.value.length }
			return formatMessage(UI_IMAGE_VIEWER.TITLE_POSITION, { title, ...position })
		}),
		thumbLabel: (index: number): string =>
			formatMessage(UI_ARIA.GALLERY_ITEM, { current: index + 1, total: props.gallery.galleryList.value.length }),
		dialogRef,
		zoomImgRef,
		minimapImgRef,
		handleImageLoad: () => nextTick(props.zoom.syncSizes),
		exposed: { zoomImgRef, minimapImgRef },
	}
}
