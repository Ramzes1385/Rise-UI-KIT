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
				<span class="base-image__error-text">Ошибка загрузки</span>
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

		<teleport to="body">
			<div
				v-if="zoom.isZoomOpen.value"
				class="base-image__zoom"
				@wheel.prevent="zoom.handleWheel"
				@click.self="zoom.handleOverlayClick">
				<div class="base-image__zoom-toolbar">
					<BaseButton
						variant="ghost"
						class="base-image__zoom-btn"
						:custom-class="classes.zoomOutButton"
						:is-disabled="zoom.isMinScale.value"
						@click="zoom.zoomOut">
						<template #left><BaseIcon name="minus" :custom-class="classes.zoomOutIcon" /></template>
					</BaseButton>
					<BaseText tag="span" class="base-image__zoom-scale" :custom-class="classes.zoomScale"
						>{{ zoom.scalePercent.value }}%</BaseText
					>
					<BaseButton
						variant="ghost"
						class="base-image__zoom-btn"
						:custom-class="classes.zoomInButton"
						:is-disabled="zoom.isMaxScale.value"
						@click="zoom.zoomIn">
						<template #left><BaseIcon name="plus" :custom-class="classes.zoomInIcon" /></template>
					</BaseButton>
					<BaseButton
						variant="ghost"
						class="base-image__zoom-btn"
						:custom-class="classes.zoomResetButton"
						@click="zoom.resetZoom">
						<template #left><BaseIcon name="rotate-ccw" :custom-class="classes.zoomResetIcon" /></template>
					</BaseButton>
					<BaseButton
						variant="ghost"
						class="base-image__zoom-btn"
						:custom-class="classes.rotateLeftButton"
						@click="zoom.rotateLeft">
						<template #left><BaseIcon name="rotate-left" :custom-class="classes.rotateLeftIcon" /></template>
					</BaseButton>
					<BaseButton
						variant="ghost"
						class="base-image__zoom-btn"
						:custom-class="classes.rotateRightButton"
						@click="zoom.rotateRight">
						<template #left><BaseIcon name="rotate-right" :custom-class="classes.rotateRightIcon" /></template>
					</BaseButton>
					<BaseButton
						variant="ghost"
						class="base-image__zoom-btn base-image__zoom-btn--close"
						:custom-class="classes.zoomCloseButton"
						@click="zoom.closeZoom">
						<template #left><BaseIcon name="close" :custom-class="classes.zoomCloseIcon" /></template>
					</BaseButton>
				</div>

				<BaseButton
					v-if="gallery.hasGalleryPrev.value"
					variant="ghost"
					class="base-image__zoom-nav base-image__zoom-nav--prev"
					:custom-class="classes.galleryPrevButton"
					@click="gallery.handleGalleryPrev">
					<template #left><BaseIcon name="chevron-left" :custom-class="classes.galleryPrevIcon" /></template>
				</BaseButton>
				<BaseButton
					v-if="gallery.hasGalleryNext.value"
					variant="ghost"
					class="base-image__zoom-nav base-image__zoom-nav--next"
					:custom-class="classes.galleryNextButton"
					@click="gallery.handleGalleryNext">
					<template #left><BaseIcon name="chevron-right" :custom-class="classes.galleryNextIcon" /></template>
				</BaseButton>

				<div class="base-image__zoom-container">
					<img
						ref="zoomImgRef"
						:src="gallery.currentZoomSrc.value"
						:alt="alt"
						class="base-image__zoom-img"
						:style="zoom.zoomImageStyle.value"
						draggable="false"
						@load="() => nextTick(zoom.syncSizes)" />
				</div>

				<div v-if="gallery.hasGallery.value" class="base-image__zoom-gallery">
					<div class="base-image__zoom-gallery-track">
						<div
							v-for="(img, index) in gallery.galleryList.value"
							:key="index"
							class="base-image__zoom-thumb"
							:class="{ 'base-image__zoom-thumb--active': gallery.galleryIndex.value === index }"
							@click="gallery.handleGalleryGo(index)">
							<img :src="img" :alt="`${alt} ${index + 1}`" class="base-image__zoom-thumb-img" />
						</div>
					</div>
					<BaseText
						v-if="gallery.galleryList.value.length > 1"
						tag="span"
						class="base-image__zoom-counter"
						:custom-class="classes.galleryCounter"
						>{{ gallery.galleryIndex.value + 1 }} / {{ gallery.galleryList.value.length }}</BaseText
					>
				</div>

				<div
					v-if="resolvedShowMinimap && zoom.currentScale.value > 1"
					class="base-image__minimap"
					@click="zoom.handleMinimapClick"
					@mousedown.prevent="zoom.handleMinimapDragStart">
					<img
						ref="minimapImgRef"
						:src="gallery.currentZoomSrc.value"
						:alt="alt"
						class="base-image__minimap-img"
						:style="zoom.minimapImageStyle.value"
						draggable="false"
						@load="() => nextTick(zoom.syncSizes)" />
					<div class="base-image__minimap-viewport" :style="zoom.minimapViewportStyle.value"></div>
				</div>
			</div>
		</teleport>
	</div>
</template>

<script setup lang="ts">
import type { BaseImageEmits, BaseImageProps } from '../model/BaseImage.types'

import '../styles/BaseImage.style.scss'

import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useImageZoom } from '@composables/useImageZoom'
import { useSizeScale } from '@composables/useSizeScale'
import { buildOptimizedSrc, buildSrcset, isExternalImage, replaceExtension } from '@utils/imageUtils'
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import type { PropType } from 'vue'
import { useImageGallery } from '../model/useImageGallery'

/* eslint-disable vue/require-default-prop -- intentionally optional props keep Vue runtime behavior unchanged after withDefaults removal */
const props = defineProps({
	src: { type: String, required: true },
	alt: { type: String, required: true },
	fallbackSrc: String,
	timeout: { type: Number, default: 5000 },
	width: [Number, String] as PropType<BaseImageProps['width']>,
	height: [Number, String] as PropType<BaseImageProps['height']>,
	fit: { type: String as PropType<BaseImageProps['fit']>, default: 'cover' },
	color: Object as PropType<BaseImageProps['color']>,
	loading: { type: String as PropType<BaseImageProps['loading']>, default: 'lazy' },
	borderRadius: { type: Number, default: 12 },
	hasPlaceholder: { type: Boolean, default: true },
	aspectRatio: String,
	srcWidth: Number,
	hasZoom: { type: Boolean, default: false },
	closeOnOverlay: { type: Boolean, default: true },
	initialScale: { type: Number, default: 1 },
	zoomStep: { type: Number, default: 0.25 },
	minScale: { type: Number, default: 0.5 },
	maxScale: { type: Number, default: 5 },
	showMinimap: { type: Boolean, default: true },
	zoomConfig: Object as PropType<BaseImageProps['zoomConfig']>,
	convertToWebp: { type: Boolean, default: false },
	gallery: Array as PropType<BaseImageProps['gallery']>,
	sizeScale: { type: Number, default: 100 },
	customClass: [String, Object] as PropType<BaseImageProps['customClass']>,
})
/* eslint-enable vue/require-default-prop */

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

const zoomImgRef = ref<HTMLElement | null>(null)
const minimapImgRef = ref<HTMLElement | null>(null)

const zoom = useImageZoom({
	initialScale: () => props.zoomConfig?.initialScale ?? props.initialScale,
	zoomStep: () => props.zoomConfig?.zoomStep ?? props.zoomStep,
	minScale: () => props.zoomConfig?.minScale ?? props.minScale,
	maxScale: () => props.zoomConfig?.maxScale ?? props.maxScale,
	closeOnOverlay: () => props.zoomConfig?.closeOnOverlay ?? props.closeOnOverlay,
	onZoom: (scale: number) => emit('zoom', scale),
	getZoomImgEl: () => zoomImgRef.value,
	getMinimapImgEl: () => minimapImgRef.value,
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
		styles['min-height'] = '120px'
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
