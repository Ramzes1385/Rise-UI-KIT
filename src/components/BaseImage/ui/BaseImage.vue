<template>
	<div
		:class="[
			ui('root'),
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
		<component :is="'script'" v-if="structuredData" type="application/ld+json" v-html="structuredData" />

		<Transition name="base-image-placeholder">
			<div v-if="hasPlaceholder && !isLoaded && !hasError" :class="[ui('placeholder'), classes.placeholder]">
				<slot name="placeholder">
					<BaseSkeleton :class="ui('shimmer')" />
				</slot>
			</div>
		</Transition>

		<div v-if="hasError" :class="[ui('error'), classes.error]">
			<slot name="error">
				<BaseIcon name="image" :class="ui('error-icon')" :aria-label="alt" />
				<span :class="ui('error-text')">{{ UI_TEXT.IMAGE_ERROR }}</span>
			</slot>
		</div>

		<component
			:is="resolvedHasZoom ? 'button' : 'div'"
			v-if="!hasError && currentSrc"
			:class="ui('frame')"
			v-bind="zoomTriggerAttrs"
			@click="handleImageClick">
			<picture>
				<source v-if="avifSrc" :srcset="avifSrc" type="image/avif" />
				<source v-if="webpSrc" :srcset="webpSrc" type="image/webp" />
				<img
					ref="imgRef"
					v-bind="imgAttrs"
					:src="currentSrc"
					:srcset="srcsetValue"
					:sizes="sizesValue"
					:alt="alt"
					:width="width"
					:height="height"
					:loading="loading"
					decoding="async"
					:class="[ui('img'), classes.img]"
					@load="handleLoad"
					@error="handleError" />
			</picture>
		</component>

		<BaseImageZoom
			v-if="isZoomRendered"
			ref="zoomRef"
			:zoom="zoom"
			:gallery="gallery"
			:alt="alt"
			:classes="classes"
			:ui="ui"
			:show-minimap="resolvedShowMinimap"
			:current-scale="zoom.currentScale.value"
			@after-leave="handleZoomAfterLeave" />
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseImage.style.scss'
import { UI_TEXT } from '@/locales/messages'
import BaseImageZoom from './BaseImageZoom.vue'
import { BaseIcon } from '@components/BaseIcon'
import { useBaseImage } from '../model/useBaseImage'
import { BaseSkeleton } from '@components/BaseSkeleton'
import { kitDefaults } from '@composables/base/useDefaults'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseImageEmits, BaseImageExpose, BaseImageProps, BaseImageSlots } from '../types/BaseImage.types'

const props = withDefaults(
	defineProps<BaseImageProps>(),
	kitDefaults('BaseImage', {
		src: undefined,
		alt: undefined,
		timeout: 5000,
		fit: 'cover',
		loading: 'lazy',
		borderRadius: undefined,
		hasPlaceholder: true,
		convertToWebp: false,
		convertToAvif: false,
		seo: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const emit = defineEmits<BaseImageEmits>()
defineSlots<BaseImageSlots>()

const {
	ui,
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
	isZoomRendered,
	handleZoomAfterLeave,
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
	structuredData,
	exposed,
} = useBaseImage(props, emit)

defineExpose<BaseImageExpose>(exposed)
</script>
