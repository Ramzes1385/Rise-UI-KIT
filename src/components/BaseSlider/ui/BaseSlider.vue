<template>
	<div
		class="base-slider"
		:class="[
			{
				'base-slider--vertical': isVertical,
				'base-slider--dragging': isDragging,
				'base-slider--gapped': spaceBetween > 0,
				[`base-slider--${animation}`]: true,
				[`base-slider--arrows-${arrowsPosition}`]: hasArrows,
			},
			classes.root,
		]"
		:style="[{ height: height }, sizeScaleStyle]"
		@mouseenter="pauseAutoplay"
		@mouseleave="resumeAutoplay">
		<!-- Слот header -->
		<slot name="header" />

		<!-- Стрелки -->
		<div v-if="hasArrows" class="base-slider__arrows" :class="classes.arrows">
			<BaseButton
				variant="ghost"
				class="base-slider__arrow base-slider__arrow--prev"
				:class="classes.arrow"
				:is-disabled="!isLoop && currentIndex === 0"
				:size-scale="sizeScale"
				@click="goPrev"
				@mousedown="startHold('prev')"
				@mouseup="stopHold"
				@mouseleave="stopHold"
				@touchstart.prevent="startHold('prev')"
				@touchend="stopHold">
				<BaseIcon :name="isVertical ? 'chevron-up' : 'chevron-left'" :size-scale="calcIconScale('sm', sizeScale)" />
			</BaseButton>
			<BaseButton
				variant="ghost"
				class="base-slider__arrow base-slider__arrow--next"
				:class="classes.arrow"
				:is-disabled="!isLoop && currentIndex >= maxIndex"
				:size-scale="sizeScale"
				@click="goNext"
				@mousedown="startHold('next')"
				@mouseup="stopHold"
				@mouseleave="stopHold"
				@touchstart.prevent="startHold('next')"
				@touchend="stopHold">
				<BaseIcon :name="isVertical ? 'chevron-down' : 'chevron-right'" :size-scale="calcIconScale('sm', sizeScale)" />
			</BaseButton>
		</div>

		<!-- Область слайдов -->
		<div
			ref="viewportRef"
			class="base-slider__viewport"
			:class="classes.viewport"
			@touchstart="onTouchStart"
			@touchmove="onTouchMove"
			@touchend="onTouchEnd"
			@mousedown.prevent="onDragStart"
			@dragstart.prevent>
			<div class="base-slider__track" :class="classes.track" :style="trackStyle">
				<div
					v-for="(item, index) in items"
					:key="index"
					class="base-slider__slide"
					:class="[{ 'base-slider__slide--active': index === currentIndex }, classes.slide]"
					:style="slideStyle">
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
						<BaseImage
							v-else
							:src="item.src"
							:alt="item.alt || ''"
							class="base-slider__image"
							loading="lazy"
							:has-zoom="isZoomable" />
					</slot>
					<div
						v-if="hasCaption && (item.title || item.description)"
						class="base-slider__caption"
						:class="classes.caption">
						<slot name="caption" :item="item" :index="index">
							<BaseText
								v-if="item.title"
								tag="h3"
								class="base-slider__title"
								:custom-class="classes.title"
								:size-scale="sizeScale"
								:weight="UI_FONT_WEIGHT_BOLD"
								>{{ item.title }}</BaseText
							>
							<BaseText
								v-if="item.description"
								class="base-slider__desc"
								:custom-class="classes.desc"
								:size-scale="sizeScale"
								>{{ item.description }}</BaseText
							>
						</slot>
					</div>
				</div>
			</div>
		</div>

		<!-- Навигация -->
		<div v-if="hasNavigation" class="base-slider__navigation" :class="classes.navigation">
			<div v-if="navigation === 'dots' || navigation === 'both'" class="base-slider__dots" :class="classes.dots">
				<BaseButton
					v-for="(_, page) in pageCount"
					:key="page"
					variant="ghost"
					class="base-slider__dot"
					:class="[{ 'base-slider__dot--active': page === currentPage }, classes.dot]"
					:padding="0"
					:size-scale="sizeScale"
					@click="goToPage(page)" />
			</div>

			<div
				v-if="navigation === 'thumbnails' || navigation === 'both'"
				class="base-slider__thumbs"
				:class="classes.thumbs">
				<BaseButton
					v-for="(item, index) in items"
					:key="index"
					variant="ghost"
					class="base-slider__thumb"
					:class="[{ 'base-slider__thumb--active': index === currentIndex }, classes.thumb]"
					:size-scale="sizeScale"
					@click="goTo(index)">
					<BaseImage v-if="item.type !== 'video'" :src="item.src" :alt="item.alt || ''" />
					<BaseImage v-else :src="item.poster || ''" :alt="item.alt || 'Video thumbnail'" />
					<div v-if="item.type === 'video'" class="base-slider__thumb-play">
						<BaseIcon name="play" :size-scale="calcIconScale('sm', sizeScale)" />
					</div>
				</BaseButton>
			</div>
		</div>

		<!-- Слот footer -->
		<slot name="footer" />
	</div>
</template>

<script setup lang="ts">
import { BaseButton } from '@components/BaseButton'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseImage } from '@components/BaseImage'
import { BaseText } from '@components/BaseText'
import { UI_FONT_WEIGHT_BOLD, UI_SLIDER_DEFAULT_HEIGHT, UI_SLIDER_HOLD_INTERVAL_MS, SIZE_SCALE_DEFAULT} from '@constants'
import { useCustomClass } from '@composables/useCustomClass'
import { useSizeScale } from '@composables/useSizeScale'
import { useSlider } from '@composables/useSlider'
import { computed, onBeforeUnmount } from 'vue'
import '../styles/BaseSlider.style.scss'
import type { BaseSliderEmits, BaseSliderProps } from '../model/BaseSlider.types'

const props = withDefaults(defineProps<BaseSliderProps>(), {
	customClass: undefined,
	items: undefined,
	animation: 'slide',
	navigation: 'dots',
	isAutoplay: false,
	autoplayInterval: 4000,
	hasArrows: true,
	arrowsPosition: 'center',
	isLoop: true,
	isVertical: false,
	initialIndex: 0,
	height: UI_SLIDER_DEFAULT_HEIGHT,
	sizeScale: SIZE_SCALE_DEFAULT,
	spaceBetween: 0,
	slidesPerView: 1,
	slidesPerGroup: 1,
	hasCaption: true,
	isZoomable: false,
})

const emit = defineEmits<BaseSliderEmits>()
const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })

const { classes } = useCustomClass({
	getClass: function () {
		return props.customClass
	},
	elementKeys: [
		'root',
		'arrows',
		'arrow',
		'viewport',
		'track',
		'slide',
		'caption',
		'title',
		'desc',
		'navigation',
		'dots',
		'dot',
		'thumbs',
		'thumb',
	],
})

const {
	viewportRef,
	currentIndex,
	isDragging,
	trackStyle,
	slideStyle,
	maxIndex,
	pageCount,
	currentPage,
	goTo,
	goNext,
	goPrev,
	goToPage,
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
	spaceBetween: () => props.spaceBetween,
	slidesPerView: () => props.slidesPerView,
	slidesPerGroup: () => props.slidesPerGroup,
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
	holdTimer = setInterval(action, UI_SLIDER_HOLD_INTERVAL_MS)
}

/** Остановка удержания */
function stopHold(): void {
	if (holdTimer) {
		clearInterval(holdTimer)
		holdTimer = null
	}
}

/** Остановка таймера удержания при размонтировании (если кнопка была зажата). */
onBeforeUnmount(stopHold)
</script>
