<template>
	<div
		class="base-image"
		:class="[
			`base-image--${fit}`,
			{
				'base-image--loaded': isLoaded,
				'base-image--error': hasError,
				'base-image--placeholder': hasPlaceholder && !isLoaded,
				'base-image--zoomable': resolvedHasZoom,
			},
			classes.root,
		]"
		:style="[containerStyle, borderRadiusStyle, sizeScaleStyle, customColorStyle]">
		<div v-if="hasPlaceholder && !isLoaded && !hasError" class="base-image__placeholder" :class="classes.placeholder">
			<slot name="placeholder">
				<div class="base-image__shimmer"></div>
			</slot>
		</div>

		<div v-if="hasError" class="base-image__error" :class="classes.error">
			<slot name="error">
				<span class="base-image__error-icon">🖼️</span>
				<span class="base-image__error-text">{{ UI_IMAGE_ERROR_TEXT }}</span>
			</slot>
		</div>

		<picture v-if="!hasError">
			<source v-if="avifSrc" :srcset="avifSrc" type="image/avif" />
			<source v-if="webpSrc" :srcset="webpSrc" type="image/webp" />
			<img
				:src="currentSrc"
				:srcset="srcsetValue"
				:sizes="sizesValue"
				:alt="alt"
				:width="width"
				:height="height"
				:loading="loading"
				decoding="async"
				class="base-image__img"
				:class="classes.img"
				@click="handleImageClick"
				@load="handleLoad"
				@error="handleError" />
		</picture>

		<BaseImageZoom
			v-if="zoom.isZoomOpen.value"
			ref="zoomRef"
			:zoom="zoom"
			:gallery="gallery"
			:alt="alt"
			:classes="classes"
			:show-minimap="resolvedShowMinimap"
			:current-scale="zoom.currentScale.value" />
	</div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import '../styles/BaseImage.style.scss'

import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useImageZoom } from '@composables/useImageZoom'
import { useSizeScale } from '@composables/useSizeScale'
import { UI_IMAGE_ERROR_TEXT, UI_IMAGE_LOAD_TIMEOUT_MS, UI_IMAGE_LOADING_MIN_HEIGHT, SIZE_SCALE_DEFAULT} from '@constants'
import { buildOptimizedSrc, buildSrcset, isExternalImage, replaceExtension } from '@utils/imageUtils'
import { useImageGallery } from '../model/useImageGallery'
import BaseImageZoom from './BaseImageZoom.vue'
import type { BaseImageEmits, BaseImageProps } from '../model/BaseImage.types'

const props = withDefaults(defineProps<BaseImageProps>(), {
	src: undefined,
	alt: undefined,
	timeout: UI_IMAGE_LOAD_TIMEOUT_MS,
	fit: 'cover',
	loading: 'lazy',
	borderRadius: 12,
	hasPlaceholder: true,
	hasZoom: false,
	closeOnOverlay: true,
	initialScale: 1,
	zoomStep: 0.25,
	minScale: 0.5,
	maxScale: 5,
	showMinimap: true,
	convertToWebp: false,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: [
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
	],
})

const { sizeScaleStyle: baseSizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const sizeScaleStyle = computed((): Record<string, string> | undefined => {
	return baseSizeScaleStyle.value as Record<string, string> | undefined
})

const emit = defineEmits<BaseImageEmits>()

const isLoaded = ref(false)
const hasError = ref(false)
const isUsingFallback = ref(false)
let loadingTimeoutId: number | null = null

const resolvedHasZoom = computed((): boolean => props.zoomConfig?.hasZoom ?? props.hasZoom)
const resolvedShowMinimap = computed((): boolean => props.zoomConfig?.showMinimap ?? props.showMinimap)

const zoomRef = ref<InstanceType<typeof BaseImageZoom> | null>(null)

const zoom = useImageZoom({
	initialScale: () => props.zoomConfig?.initialScale ?? props.initialScale,
	zoomStep: () => props.zoomConfig?.zoomStep ?? props.zoomStep,
	minScale: () => props.zoomConfig?.minScale ?? props.minScale,
	maxScale: () => props.zoomConfig?.maxScale ?? props.maxScale,
	closeOnOverlay: () => props.zoomConfig?.closeOnOverlay ?? props.closeOnOverlay,
	onZoom: (scale: number) => emit('zoom', scale),
	getZoomImgEl: () => zoomRef.value?.zoomImgRef ?? null,
	getMinimapImgEl: () => zoomRef.value?.minimapImgRef ?? null,
})

const gallery = useImageGallery({
	gallery: () => props.gallery,
	src: () => props.src,
	resetZoom: () => zoom.resetZoom(),
})

const hasCustomDimensions = computed((): boolean => {
	return !!props.width || !!props.height || !!props.aspectRatio
})

const containerStyle = computed((): Record<string, string> => {
	const styles: Record<string, string> = {}

	if (props.aspectRatio) {
		styles['aspect-ratio'] = props.aspectRatio
	}

	if (props.width && !props.aspectRatio) {
		const widthValue = typeof props.width === 'number' ? `${props.width}px` : props.width
		styles.width = `calc(${widthValue} * var(--size-scale, 1))`
	}

	if (props.height && !props.aspectRatio) {
		const heightValue = typeof props.height === 'number' ? `${props.height}px` : props.height
		styles.height = `calc(${heightValue} * var(--size-scale, 1))`
	}

	if (!hasCustomDimensions.value && (!isLoaded.value || hasError.value)) {
		styles['aspect-ratio'] = '16/9'
		styles['min-height'] = UI_IMAGE_LOADING_MIN_HEIGHT
		styles['width'] = '100%'
	}

	return styles
})

const borderRadiusStyle = computed((): Record<string, string> => {
	if (props.borderRadius === 0) return { borderRadius: '0' }
	return { borderRadius: `calc(${props.borderRadius}px * var(--size-scale, 1))` }
})

const optimizedSrc = computed((): string => buildOptimizedSrc(props.src, props.srcWidth))

const currentSrc = computed((): string => {
	if (isUsingFallback.value && props.fallbackSrc) {
		return props.fallbackSrc
	}
	return optimizedSrc.value
})

const avifSrc = computed((): string | null => {
	if (isExternalImage(props.src)) return null
	return replaceExtension(props.src, '.avif')
})

const webpSrc = computed((): string | null => {
	if (props.convertToWebp) return replaceExtension(props.src, '.webp')
	if (isExternalImage(props.src)) return null
	return replaceExtension(props.src, '.webp')
})

const srcsetValue = computed((): string | undefined => buildSrcset(props.src, props.srcWidth))

const sizesValue = computed((): string => {
	if (props.width) return `${props.width}px`
	return '100vw'
})

function clearLoadingTimeout(): void {
	if (loadingTimeoutId !== null) {
		clearTimeout(loadingTimeoutId)
		loadingTimeoutId = null
	}
}

function startLoadingTimeout(): void {
	clearLoadingTimeout()
	if (props.timeout && props.timeout > 0) {
		loadingTimeoutId = window.setTimeout(() => {
			if (!isLoaded.value && !hasError.value) {
				handleError()
			}
		}, props.timeout)
	}
}

function handleLoad(): void {
	clearLoadingTimeout()
	isLoaded.value = true
	emit('load')
}

function handleError(): void {
	clearLoadingTimeout()
	if (props.fallbackSrc && !isUsingFallback.value) {
		isUsingFallback.value = true
		hasError.value = false
		isLoaded.value = false
		startLoadingTimeout()
	} else {
		hasError.value = true
		emit('error')
	}
}

function handleImageClick(): void {
	if (!resolvedHasZoom.value) return
	const foundIndex = gallery.galleryList.value.indexOf(props.src)
	gallery.galleryIndex.value = foundIndex >= 0 ? foundIndex : 0
	zoom.openZoom()
}

function handleGlobalKeyDown(event: KeyboardEvent): void {
	if (!zoom.isZoomOpen.value) return
	if (event.key === 'ArrowLeft') {
		gallery.handleGalleryPrev()
	} else if (event.key === 'ArrowRight') {
		gallery.handleGalleryNext()
	} else if (event.key === 'Escape') {
		zoom.closeZoom()
	}
}

watch(
	() => props.src,
	() => {
		isLoaded.value = false
		hasError.value = false
		isUsingFallback.value = false
		startLoadingTimeout()
	},
	{ immediate: true },
)

watch(
	() => zoom.isZoomOpen.value,
	isOpen => {
		if (isOpen) {
			window.addEventListener('keydown', handleGlobalKeyDown)
		} else {
			window.removeEventListener('keydown', handleGlobalKeyDown)
		}
	},
)

onUnmounted(() => {
	clearLoadingTimeout()
	window.removeEventListener('keydown', handleGlobalKeyDown)
})
</script>
