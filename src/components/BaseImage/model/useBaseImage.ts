import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import type BaseImageZoom from '../ui/BaseImageZoom.vue'
import { useSizeScale } from '@composables/base/useSizeScale'
import { useImageZoom } from '@composables/image/useImageZoom'
import { useImageState } from '@composables/image/useImageState'
import { useCustomClass } from '@composables/base/useCustomClass'
import { useCustomColor } from '@composables/base/useCustomColor'
import { useImageGallery } from '@composables/image/useImageGallery'
import type { StructuredData } from '@utils/seo/structuredDataUtils'
import { useStructuredData } from '@composables/seo/useStructuredData'
import type { BaseImageEmits, ImageProps } from '../types/BaseImage.types'

const IMAGE_ELEMENTS = [
	'root',
	'placeholder',
	'error',
	'img',
	'zoomOutButton',
	'zoomOutIcon',
	'zoomScale',
	'zoomInButton',
	'zoomInIcon',
	'zoomResetButton',
	'zoomResetIcon',
	'rotateLeftButton',
	'rotateLeftIcon',
	'rotateRightButton',
	'rotateRightIcon',
	'zoomCloseButton',
	'zoomCloseIcon',
	'galleryPrevButton',
	'galleryPrevIcon',
	'galleryNextButton',
	'galleryNextIcon',
	'galleryCounter',
]

function useZoomViewer(props: ImageProps, emit: BaseImageEmits, zoomRef: Ref<InstanceType<typeof BaseImageZoom> | null>) {
	const gallery = useImageGallery({
		gallery: () => props.gallery,
		src: () => props.src,
		resetZoom: () => zoom.resetZoom(),
	})
	const zoom = useImageZoom({
		initialScale: () => props.zoomConfig?.initialScale ?? 1,
		zoomStep: () => props.zoomConfig?.zoomStep ?? 0.25,
		minScale: () => props.zoomConfig?.minScale ?? 0.5,
		maxScale: () => props.zoomConfig?.maxScale ?? 5,
		closeOnOverlay: () => props.zoomConfig?.closeOnOverlay ?? true,
		onZoom: (scale: number) => emit('zoom', scale),
		getZoomImgEl: () => zoomRef.value?.zoomImgRef ?? null,
		getMinimapImgEl: () => zoomRef.value?.minimapImgRef ?? null,
		onArrowLeft: () => gallery.handleGalleryPrev(),
		onArrowRight: () => gallery.handleGalleryNext(),
	})
	return { gallery, zoom }
}

function useLoadState(props: ImageProps, emit: BaseImageEmits, imgRef: Ref<HTMLImageElement | null>) {
	return useImageState({
		src: () => props.src,
		fallbackSrc: () => props.fallbackSrc,
		timeout: () => props.timeout,
		width: () => props.width,
		height: () => props.height,
		aspectRatio: () => props.aspectRatio,
		borderRadius: () => props.borderRadius,
		srcWidth: () => props.srcWidth,
		convertToWebp: () => props.convertToWebp,
		convertToAvif: () => props.convertToAvif,
		loading: () => props.loading,
		imgRef,
		onLoad: () => emit('load'),
		onError: () => emit('error'),
	})
}

function imageSchema(props: ImageProps, url: (value?: string) => string | undefined): StructuredData {
	return { '@type': 'ImageObject', contentUrl: url(props.src), caption: props.alt || undefined }
}

export function useBaseImage(props: ImageProps, emit: BaseImageEmits) {
	const { classes } = useCustomClass({ getClass: () => props.customClass, elementKeys: IMAGE_ELEMENTS })
	const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
	const { customColorStyle } = useCustomColor({ getColor: () => props.color })
	const resolvedHasZoom = computed((): boolean => props.zoomConfig?.hasZoom ?? false)
	const zoomRef = ref<InstanceType<typeof BaseImageZoom> | null>(null)
	const imgRef = ref<HTMLImageElement | null>(null)
	const { gallery, zoom } = useZoomViewer(props, emit, zoomRef)
	const { borderRadiusStyle, ...state } = useLoadState(props, emit, imgRef)

	return {
		classes,
		sizeScaleStyle,
		customColorStyle,
		resolvedHasZoom,
		resolvedShowMinimap: computed((): boolean => props.zoomConfig?.showMinimap ?? true),
		zoomTriggerAttrs: computed(() => {
			if (!resolvedHasZoom.value) return undefined
			return { type: 'button', 'aria-haspopup': 'dialog', 'aria-label': props.alt ? undefined : UI_ARIA.IMAGE_VIEWER }
		}),
		zoomRef,
		imgRef,
		gallery,
		zoom,
		...state,
		...useStructuredData(
			'BaseImage',
			() => props.seo,
			({ url }) => imageSchema(props, url),
		),
		radiusStyle: computed(() => (props.borderRadius === undefined ? undefined : borderRadiusStyle.value)),
		handleImageClick(): void {
			if (!resolvedHasZoom.value) return
			const foundIndex = gallery.galleryList.value.indexOf(props.src)
			gallery.galleryIndex.value = foundIndex >= 0 ? foundIndex : 0
			zoom.openZoom()
		},
	}
}
