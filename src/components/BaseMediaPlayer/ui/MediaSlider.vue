<template>
	<div
		ref="rootRef"
		class="base-media-player__slider"
		:class="{ 'base-media-player__slider--dragging': isDragging, 'base-media-player__slider--disabled': isDisabled }"
		@pointerdown="onPointerDown"
		@pointermove="onPointerMove"
		@pointerup="onPointerEnd"
		@pointercancel="onPointerEnd"
		@pointerleave="onHoverEnd">
		<div class="base-media-player__slider-track" :style="trackStyle">
			<div v-for="(style, index) in bufferedStyles" :key="index" class="base-media-player__slider-buffered" :style="style"></div>
			<div class="base-media-player__slider-fill" :style="fillStyle"></div>
			<div
				v-for="(style, index) in highlightStyles"
				:key="`highlight-${index}`"
				class="base-media-player__slider-highlight"
				:style="style"></div>
		</div>
		<div v-for="(style, index) in markerStyles" :key="`marker-${index}`" class="base-media-player__slider-marker" :style="style"></div>
		<div
			ref="thumbRef"
			class="base-media-player__slider-thumb"
			role="slider"
			tabindex="0"
			aria-valuemin="0"
			:aria-valuemax="valueMax"
			:aria-valuenow="valueNow"
			:aria-valuetext="valueText"
			:aria-label="label"
			:aria-disabled="isDisabled || undefined"
			:style="thumbStyle"
			@keydown="onKeydown"></div>
		<div v-if="hoverLabel" class="base-media-player__slider-tooltip" :style="hoverStyle" aria-hidden="true">{{ hoverLabel }}</div>
	</div>
</template>

<script setup lang="ts">
import { useMediaSlider } from '../model/useMediaSlider'
import type { MediaSliderEmits, MediaSliderProps } from '../types/MediaSlider.types'

const props = defineProps<MediaSliderProps>()
const emit = defineEmits<MediaSliderEmits>()

const {
	rootRef,
	thumbRef,
	isDisabled,
	isDragging,
	valueNow,
	valueMax,
	fillStyle,
	thumbStyle,
	bufferedStyles,
	onPointerDown,
	onPointerMove,
	onPointerEnd,
	onKeydown,
	trackStyle,
	hoverLabel,
	hoverStyle,
	onHoverEnd,
	markerStyles,
	highlightStyles,
} = useMediaSlider(props, emit)
</script>
