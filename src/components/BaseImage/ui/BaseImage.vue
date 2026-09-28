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
		:style="[containerStyle, radiusStyle, sizeScaleStyle, customColorStyle]">
		<div v-if="hasPlaceholder && !isLoaded && !hasError" class="base-image__placeholder" :class="classes.placeholder">
			<slot name="placeholder">
				<div class="base-image__shimmer"></div>
			</slot>
		</div>

		<!-- Ошибка загрузки: <img> удалён, поэтому alt переходит к иконке — скринридер по-прежнему слышит, что здесь было -->
		<div v-if="hasError" class="base-image__error" :class="classes.error">
			<slot name="error">
				<BaseIcon name="image" class="base-image__error-icon" :aria-label="alt" />
				<span class="base-image__error-text">{{ UI_TEXT.IMAGE_ERROR }}</span>
			</slot>
		</div>

		<!-- С зумом изображение обёрнуто в кнопку: открывается мышью, Enter и Space; имя кнопки — alt изображения -->
		<component
			:is="resolvedHasZoom ? 'button' : 'div'"
			v-if="!hasError"
			class="base-image__frame"
			v-bind="zoomTriggerAttrs"
			@click="handleImageClick">
			<picture>
				<source v-if="avifSrc" :srcset="avifSrc" type="image/avif" />
				<source v-if="webpSrc" :srcset="webpSrc" type="image/webp" />
				<img
					ref="imgRef"
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
					@load="handleLoad"
					@error="handleError" />
			</picture>
		</component>

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
import '../styles/BaseImage.style.scss'
import { UI_TEXT } from '@/locales/messages'
import BaseImageZoom from './BaseImageZoom.vue'
import { BaseIcon } from '@components/BaseIcon'
import { useBaseImage } from '../model/useBaseImage'
import { kitDefaults } from '@composables/useDefaults'
import { SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import type { BaseImageEmits, BaseImageProps, BaseImageSlots } from '../types/BaseImage.types'

const props = withDefaults(
	defineProps<BaseImageProps>(),
	kitDefaults('BaseImage', {
		src: undefined,
		alt: undefined,
		timeout: 5000,
		fit: 'cover',
		loading: 'lazy',
		// Без пропа радиус берётся из темы (--rise-radius-md в стилях): inline-стиль пишется только при явном значении
		borderRadius: undefined,
		hasPlaceholder: true,
		convertToWebp: false,
		convertToAvif: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const emit = defineEmits<BaseImageEmits>()
defineSlots<BaseImageSlots>()

const {
	classes,
	sizeScaleStyle,
	customColorStyle,
	resolvedHasZoom,
	resolvedShowMinimap,
	zoomTriggerAttrs,
	zoomRef,
	imgRef,
	gallery,
	zoom,
	isLoaded,
	hasError,
	containerStyle,
	currentSrc,
	avifSrc,
	webpSrc,
	srcsetValue,
	sizesValue,
	handleLoad,
	handleError,
	radiusStyle,
	handleImageClick,
} = useBaseImage(props, emit)
</script>
