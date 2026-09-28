<template>
	<div
		ref="rootRef"
		class="base-media-player__slider"
		:class="{ 'base-media-player__slider--dragging': isDragging, 'base-media-player__slider--disabled': isDisabled }"
		@pointerdown="onPointerDown"
		@pointermove="onPointerMove"
		@pointerup="onPointerEnd"
		@pointercancel="onPointerEnd">
		<div class="base-media-player__slider-track">
			<div v-for="(style, index) in bufferedStyles" :key="index" class="base-media-player__slider-buffered" :style="style"></div>
			<div class="base-media-player__slider-fill" :style="fillStyle"></div>
		</div>
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
} = useMediaSlider(props, emit)
</script>
