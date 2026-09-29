<template>
	<div
		ref="rootRef"
		class="base-media-player__slider"
		:class="{
			'base-media-player__slider--dragging': isDragging,
			'base-media-player__slider--disabled': isDisabled,
			'base-media-player__slider--vertical': props.isVertical,
		}"
		@pointerdown="onPointerDown"
		@pointermove="onPointerMove"
		@pointerup="onPointerEnd"
		@pointercancel="onPointerEnd"
		@pointerleave="onHoverEnd">
		<div class="base-media-player__slider-track" :class="{ 'base-media-player__slider-track--segmented': segments.length }">
			<div v-for="(style, index) in bufferedStyles" :key="index" class="base-media-player__slider-buffered" :style="style"></div>
			<div v-if="segments.length" class="base-media-player__slider-segments">
				<div
					v-for="(segment, index) in segments"
					:key="`segment-${index}`"
					class="base-media-player__slider-segment"
					:class="{ 'base-media-player__slider-segment--hovered': segment.isHovered }"
					:style="segment.style">
					<div class="base-media-player__slider-segment-fill" :style="segment.fillStyle"></div>
				</div>
			</div>
			<div v-else class="base-media-player__slider-fill" :style="fillStyle"></div>
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
			:aria-orientation="props.isVertical ? 'vertical' : undefined"
			:style="thumbStyle"
			@keydown="onKeydown"></div>
		<div v-if="isTooltipVisible" ref="tooltipRef" class="base-media-player__slider-tooltip" :style="hoverStyle" aria-hidden="true">
			<slot name="tooltip" :value="hoverValue as number">{{ hoverLabel }}</slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useMediaSlider } from '../model/useMediaSlider'
import type { MediaSliderEmits, MediaSliderProps, MediaSliderSlots } from '../types/MediaSlider.types'

const props = defineProps<MediaSliderProps>()
const emit = defineEmits<MediaSliderEmits>()
const slots = defineSlots<MediaSliderSlots>()

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
	segments,
	hoverValue,
	tooltipRef,
	isTooltipVisible,
	hoverLabel,
	hoverStyle,
	onHoverEnd,
	markerStyles,
	highlightStyles,
} = useMediaSlider(props, emit, slots)
</script>
