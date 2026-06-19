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
				<span class="base-image__error-text">{{ UI_TEXT.IMAGE_ERROR }}</span>
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
import { computed, ref } from 'vue'
import '../styles/BaseImage.style.scss'

import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useImageGallery } from '@composables/useImageGallery'
import { useImageState } from '@composables/useImageState'
import { useImageZoom } from '@composables/useImageZoom'
import { useSizeScale } from '@composables/useSizeScale'
import { UI_TEXT, UI_TIMING, SIZE_SCALE_DEFAULT} from '@constants'
import BaseImageZoom from './BaseImageZoom.vue'
import type { BaseImageEmits, BaseImageProps, BaseImageSlots } from '../model/BaseImage.types'

const props = withDefaults(defineProps<BaseImageProps>(), {
	src: undefined,
	alt: undefined,
	timeout: UI_TIMING.IMAGE_LOAD_TIMEOUT,
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
defineSlots<BaseImageSlots>()

const resolvedHasZoom = computed((): boolean => props.zoomConfig?.hasZoom ?? props.hasZoom)
const resolvedShowMinimap = computed((): boolean => props.zoomConfig?.showMinimap ?? props.showMinimap)

const zoomRef = ref<InstanceType<typeof BaseImageZoom> | null>(null)

const gallery = useImageGallery({
	gallery: () => props.gallery,
	src: () => props.src,
	resetZoom: () => zoom.resetZoom(),
})

const zoom = useImageZoom({
	initialScale: () => props.zoomConfig?.initialScale ?? props.initialScale,
	zoomStep: () => props.zoomConfig?.zoomStep ?? props.zoomStep,
	minScale: () => props.zoomConfig?.minScale ?? props.minScale,
	maxScale: () => props.zoomConfig?.maxScale ?? props.maxScale,
	closeOnOverlay: () => props.zoomConfig?.closeOnOverlay ?? props.closeOnOverlay,
	onZoom: (scale: number) => emit('zoom', scale),
	getZoomImgEl: () => zoomRef.value?.zoomImgRef ?? null,
	getMinimapImgEl: () => zoomRef.value?.minimapImgRef ?? null,
	onArrowLeft: () => gallery.handleGalleryPrev(),
	onArrowRight: () => gallery.handleGalleryNext(),
})

const {
	isLoaded,
	hasError,
	containerStyle,
	borderRadiusStyle,
	currentSrc,
	avifSrc,
	webpSrc,
	srcsetValue,
	sizesValue,
	handleLoad,
	handleError,
} = useImageState({
	src: () => props.src,
	fallbackSrc: () => props.fallbackSrc,
	timeout: () => props.timeout,
	width: () => props.width,
	height: () => props.height,
	aspectRatio: () => props.aspectRatio,
	borderRadius: () => props.borderRadius,
	srcWidth: () => props.srcWidth,
	convertToWebp: () => props.convertToWebp,
	onLoad: () => emit('load'),
	onError: () => emit('error'),
})

function handleImageClick(): void {
	if (!resolvedHasZoom.value) return
	const foundIndex = gallery.galleryList.value.indexOf(props.src)
	gallery.galleryIndex.value = foundIndex >= 0 ? foundIndex : 0
	zoom.openZoom()
}
</script>
