<template>
	<div
		class="base-image"
		:class="[
			`base-image--${fit}`,
			`base-image--radius-${borderRadius}`,
			{
				'base-image--loaded': isLoaded,
				'base-image--error': hasError,
				'base-image--placeholder': hasPlaceholder && !isLoaded,
				'base-image--zoomable': hasZoom,
			},
			variantClass,
		]"
		:style="[containerStyle, sizeScaleStyle, variantStyle, customColorStyle]">
		<!-- Плейсхолдер -->
		<div v-if="hasPlaceholder && !isLoaded && !hasError" class="base-image__placeholder">
			<slot name="placeholder">
				<div class="base-image__shimmer"></div>
			</slot>
		</div>

		<!-- Ошибка загрузки -->
		<div v-if="hasError" class="base-image__error">
			<slot name="error">
				<span class="base-image__error-icon">🖼</span>
				<span class="base-image__error-text">Ошибка загрузки</span>
			</slot>
		</div>

		<!-- Изображение с picture для оптимизации -->
		<picture v-if="!hasError">
			<source v-if="avifSrc" :srcset="avifSrc" type="image/avif" />
			<source v-if="webpSrc" :srcset="webpSrc" type="image/webp" />
			<img
				:src="optimizedSrc"
				:srcset="srcsetValue"
				:sizes="sizesValue"
				:alt="alt"
				:width="width"
				:height="height"
				:loading="loading"
				decoding="async"
				class="base-image__img"
				@click="handleImageClick"
				@load="handleLoad"
				@error="handleError" />
		</picture>

		<!-- Зум оверлей -->
		<teleport to="body">
			<transition name="image-zoom-fade">
				<div
					v-if="zoom.isZoomOpen.value"
					class="base-image__zoom"
					@wheel.prevent="zoom.handleWheel"
					@keydown.escape="zoom.closeZoom"
					@click.self="zoom.handleOverlayClick">
					<!-- Тулбар -->
					<div class="base-image__zoom-toolbar">
						<BaseButton
							variant="ghost"
							class="base-image__zoom-btn"
							:is-disabled="zoom.isMinScale.value"
							:size-scale="sizeScale"
							@click="zoom.zoomOut">
							−
						</BaseButton>
						<BaseText tag="span" class="base-image__zoom-scale" :size-scale="sizeScale"
							>{{ zoom.scalePercent.value }}%</BaseText
						>
						<BaseButton
							variant="ghost"
							class="base-image__zoom-btn"
							:is-disabled="zoom.isMaxScale.value"
							:size-scale="sizeScale"
							@click="zoom.zoomIn">
							+
						</BaseButton>
						<BaseButton variant="ghost" class="base-image__zoom-btn" :size-scale="sizeScale" @click="zoom.resetZoom"
							>↺</BaseButton
						>
						<BaseButton variant="ghost" class="base-image__zoom-btn" :size-scale="sizeScale" @click="zoom.rotateLeft"
							>↶</BaseButton
						>
						<BaseButton variant="ghost" class="base-image__zoom-btn" :size-scale="sizeScale" @click="zoom.rotateRight"
							>↷</BaseButton
						>
						<BaseButton
							variant="ghost"
							class="base-image__zoom-btn base-image__zoom-btn--close"
							:size-scale="sizeScale"
							@click="zoom.closeZoom">
							✕
						</BaseButton>
					</div>

					<!-- Изображение с перетаскиванием -->
					<div
						class="base-image__zoom-container"
						@mousedown.prevent="zoom.handleDragStart"
						@mousemove.prevent="zoom.handleDragMove"
						@mouseup="zoom.handleDragEnd"
						@mouseleave="zoom.handleDragEnd">
						<img
							:src="src"
							:alt="alt"
							class="base-image__zoom-img"
							:style="zoom.zoomImageStyle.value"
							draggable="false" />
					</div>

					<!-- Мини-карта -->
					<div
						v-if="showMinimap && zoom.currentScale.value > 1"
						class="base-image__minimap"
						@click.prevent="zoom.handleMinimapClick">
						<img
							:src="src"
							:alt="alt"
							class="base-image__minimap-img"
							:style="zoom.minimapImageStyle.value"
							draggable="false" />
						<div class="base-image__minimap-viewport" :style="zoom.minimapViewportStyle.value" />
					</div>
				</div>
			</transition>
		</teleport>
	</div>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useImageZoom } from '@/shared/composables/useImageZoom'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { BaseButton } from '@/shared/ui/BaseButton'
import { BaseText } from '@/shared/ui/BaseText'
import { buildOptimizedSrc, buildSrcset, isExternalImage, replaceExtension } from '@/shared/utils/imageUtils'
import { computed, ref } from 'vue'
import './BaseImage.style.scss'
import type { BaseImageEmits, BaseImageProps } from './BaseImage.types'

const props = withDefaults(defineProps<BaseImageProps>(), {
	fit: 'cover',
	variant: 'default',
	loading: 'lazy',
	borderRadius: 'md',
	hasPlaceholder: true,
	srcWidth: undefined,
	hasZoom: false,
	closeOnOverlay: true,
	initialScale: 1,
	zoomStep: 0.25,
	minScale: 0.5,
	maxScale: 5,
	showMinimap: true,
	convertToWebp: false,
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-image', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const emit = defineEmits<BaseImageEmits>()

const isLoaded = ref(false)
const hasError = ref(false)

/** Composable для зума */
const zoom = useImageZoom({
	initialScale: () => props.initialScale,
	zoomStep: () => props.zoomStep,
	minScale: () => props.minScale,
	maxScale: () => props.maxScale,
	closeOnOverlay: () => props.closeOnOverlay,
	onZoom: (scale: number) => emit('zoom', scale),
})

/** Контейнер стили */
const containerStyle = computed((): Record<string, string> => {
	const styles: Record<string, string> = {}
	if (props.aspectRatio) styles['aspect-ratio'] = props.aspectRatio
	if (props.width && !props.aspectRatio) styles.width = `${props.width}px`
	if (props.height && !props.aspectRatio) styles.height = `${props.height}px`
	return styles
})

/** Оптимизированный src с параметром ширины */
const optimizedSrc = computed((): string => buildOptimizedSrc(props.src, props.srcWidth))

/** AVIF источник */
const avifSrc = computed((): string | null => {
	if (isExternalImage(props.src)) return null
	return replaceExtension(props.src, '.avif')
})

/** WebP источник */
const webpSrc = computed((): string | null => {
	if (props.convertToWebp) return replaceExtension(props.src, '.webp')
	if (isExternalImage(props.src)) return null
	return replaceExtension(props.src, '.webp')
})

/** Srcset для адаптивных изображений */
const srcsetValue = computed((): string | undefined => buildSrcset(props.src, props.srcWidth))

/** Sizes для адаптивных изображений */
const sizesValue = computed((): string => {
	if (props.width) return `${props.width}px`
	return '100vw'
})

/** Обработка загрузки */
function handleLoad(): void {
	isLoaded.value = true
	emit('load')
}

/** Обработка ошибки */
function handleError(): void {
	hasError.value = true
	emit('error')
}

/** Клик по изображению — открыть зум */
function handleImageClick(): void {
	if (!props.hasZoom) return
	zoom.openZoom()
}
</script>
