<template>
	<div
		class="base-slider"
		:class="{
			'base-slider--vertical': isVertical,
			'base-slider--dragging': isDragging,
			[`base-slider--${animation}`]: true,
			[`base-slider--arrows-${arrowsPosition}`]: hasArrows,
		}"
		:style="[{ height: height }, sizeScaleStyle]"
		@mouseenter="pauseAutoplay"
		@mouseleave="resumeAutoplay">
		<!-- Слот header -->
		<slot name="header" />

		<!-- Стрелки -->
		<div v-if="hasArrows" class="base-slider__arrows">
			<BaseButton
				variant="ghost"
				class="base-slider__arrow base-slider__arrow--prev"
				:is-disabled="!isLoop && currentIndex === 0"
				:size-scale="sizeScale"
				@click="goPrev"
				@mousedown="startHold('prev')"
				@mouseup="stopHold"
				@mouseleave="stopHold"
				@touchstart.prevent="startHold('prev')"
				@touchend="stopHold">
				<BaseIcon :name="isVertical ? 'chevron-up' : 'chevron-left'" size="sm" :size-scale="sizeScale" />
			</BaseButton>
			<BaseButton
				variant="ghost"
				class="base-slider__arrow base-slider__arrow--next"
				:is-disabled="!isLoop && currentIndex === items.length - 1"
				:size-scale="sizeScale"
				@click="goNext"
				@mousedown="startHold('next')"
				@mouseup="stopHold"
				@mouseleave="stopHold"
				@touchstart.prevent="startHold('next')"
				@touchend="stopHold">
				<BaseIcon :name="isVertical ? 'chevron-down' : 'chevron-right'" size="sm" :size-scale="sizeScale" />
			</BaseButton>
		</div>

		<!-- Область слайдов -->
		<div
			ref="viewportRef"
			class="base-slider__viewport"
			@touchstart="onTouchStart"
			@touchmove="onTouchMove"
			@touchend="onTouchEnd"
			@mousedown.prevent="onDragStart">
			<div class="base-slider__track" :style="trackStyle">
				<div
					v-for="(item, index) in items"
					:key="index"
					class="base-slider__slide"
					:class="{ 'base-slider__slide--active': index === currentIndex }">
					<slot :item="item" :index="index">
						<video
							v-if="item.type === 'video'"
							:src="item.src"
							:poster="item.poster"
							class="base-slider__video"
							controls
							muted
							loop
							playsinline></video>
						<BaseImage v-else :src="item.src" :alt="item.alt || ''" class="base-slider__image" loading="lazy" />
					</slot>
					<div v-if="item.title || item.description" class="base-slider__caption">
						<slot name="caption" :item="item" :index="index">
							<BaseText v-if="item.title" tag="h3" class="base-slider__title" :size-scale="sizeScale" :weight="700">{{
								item.title
							}}</BaseText>
							<BaseText v-if="item.description" class="base-slider__desc" :size-scale="sizeScale">{{
								item.description
							}}</BaseText>
						</slot>
					</div>
				</div>
			</div>
		</div>

		<!-- Навигация -->
		<div v-if="hasNavigation" class="base-slider__navigation">
			<div v-if="navigation === 'dots' || navigation === 'both'" class="base-slider__dots">
				<BaseButton
					v-for="(_, index) in items"
					:key="index"
					variant="ghost"
					class="base-slider__dot"
					:class="{ 'base-slider__dot--active': index === currentIndex }"
					:padding="0"
					:size-scale="sizeScale"
					@click="goTo(index)" />
			</div>

			<div v-if="navigation === 'thumbnails' || navigation === 'both'" class="base-slider__thumbs">
				<BaseButton
					v-for="(item, index) in items"
					:key="index"
					variant="ghost"
					class="base-slider__thumb"
					:class="{ 'base-slider__thumb--active': index === currentIndex }"
					:size-scale="sizeScale"
					@click="goTo(index)">
					<BaseImage v-if="item.type !== 'video'" :src="item.src" :alt="item.alt || ''" />
					<BaseImage v-else :src="item.poster || ''" :alt="item.alt || 'Video thumbnail'" />
					<div v-if="item.type === 'video'" class="base-slider__thumb-play">
						<BaseIcon name="play" size="sm" :size-scale="sizeScale" />
					</div>
				</BaseButton>
			</div>
		</div>

		<!-- Слот footer -->
		<slot name="footer" />
	</div>
</template>

<script setup lang="ts">
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useSlider } from '@/shared/composables/useSlider'
import { BaseButton } from '@/shared/ui/BaseButton'
import BaseIcon from '@/shared/ui/BaseIcon/BaseIcon.vue'
import { BaseImage } from '@/shared/ui/BaseImage'
import { BaseText } from '@/shared/ui/BaseText'
import { computed } from 'vue'
import './BaseSlider.style.scss'
import type { BaseSliderEmits, BaseSliderProps } from './BaseSlider.types'

const props = withDefaults(defineProps<BaseSliderProps>(), {
	animation: 'slide',
	navigation: 'dots',
	isAutoplay: false,
	autoplayInterval: 4000,
	hasArrows: true,
	arrowsPosition: 'center',
	isLoop: true,
	isVertical: false,
	initialIndex: 0,
	height: '400px',
	sizeScale: 100,
})

const emit = defineEmits<BaseSliderEmits>()
const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })

const {
	currentIndex,
	isDragging,
	trackStyle,
	goTo,
	goNext,
	goPrev,
	pauseAutoplay,
	resumeAutoplay,
	onTouchStart,
	onTouchMove,
	onTouchEnd,
	onDragStart,
} = useSlider({
	itemCount: () => props.items.length,
	animation: () => props.animation,
	isAutoplay: () => props.isAutoplay,
	autoplayInterval: () => props.autoplayInterval,
	isLoop: () => props.isLoop,
	isVertical: () => props.isVertical,
	initialIndex: () => props.initialIndex,
	onChange: index => emit('change', index),
	onNext: () => emit('next'),
	onPrev: () => emit('prev'),
})

const hasNavigation = computed(() => props.navigation !== 'none')

let holdTimer: ReturnType<typeof setInterval> | null = null

/** Удержание стрелки — быстрое перелистывание */
function startHold(direction: 'prev' | 'next'): void {
	stopHold()
	const action = direction === 'next' ? goNext : goPrev
	holdTimer = setInterval(action, 150)
}

/** Остановка удержания */
function stopHold(): void {
	if (holdTimer) {
		clearInterval(holdTimer)
		holdTimer = null
	}
}
</script>
