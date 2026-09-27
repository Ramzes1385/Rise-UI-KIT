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
		@mouseenter="onMouseEnter"
		@mouseleave="onMouseLeave"
		@focusin="onFocusIn"
		@focusout="onFocusOut">
		<!-- Слот header -->
		<slot name="header" />

		<!-- Сцена: область слайдов и стрелки, отцентрованные по ней (а не по всему слайдеру с навигацией) -->
		<div class="base-slider__stage">
			<!-- Листать нечего (слайдов не больше, чем видно) — стрелки и навигация не выводятся -->
			<div v-if="hasArrows && canNavigate" class="base-slider__arrows" :class="classes.arrows">
				<BaseButton
					:variant="arrowVariant"
					class="base-slider__arrow base-slider__arrow--prev"
					:class="classes.arrow"
					:aria-label="UI_ARIA.SLIDER_PREV"
					:is-disabled="!isLoop && currentIndex === 0"
					:size-scale="sizeScale"
					@click="goPrev"
					@mousedown="startHold('prev')"
					@mouseup="stopHold"
					@mouseleave="stopHold"
					@touchstart.prevent="startHold('prev')"
					@touchend="stopHold">
					<BaseIcon :name="isVertical ? 'chevron-up' : 'chevron-left'" />
				</BaseButton>
				<BaseButton
					:variant="arrowVariant"
					class="base-slider__arrow base-slider__arrow--next"
					:class="classes.arrow"
					:aria-label="UI_ARIA.SLIDER_NEXT"
					:is-disabled="!isLoop && currentIndex >= maxIndex"
					:size-scale="sizeScale"
					@click="goNext"
					@mousedown="startHold('next')"
					@mouseup="stopHold"
					@mouseleave="stopHold"
					@touchstart.prevent="startHold('next')"
					@touchend="stopHold">
					<BaseIcon :name="isVertical ? 'chevron-down' : 'chevron-right'" />
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
				@click.capture="onClickCapture"
				@dragstart.prevent>
				<div class="base-slider__track" :class="classes.track" :style="trackStyle">
					<!-- Невидимые слайды inert: их ссылки, видео и кнопки зума не попадают в Tab и не читаются скринридером -->
					<div
						v-for="(item, index) in items"
						:key="index"
						class="base-slider__slide"
						:class="[{ 'base-slider__slide--active': index === currentIndex }, classes.slide]"
						:style="slideStyle"
						:inert="isSlideVisible(index) ? undefined : true">
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
								:border-radius="0"
								loading="lazy"
								:zoom-config="{ hasZoom: isZoomable }" />
						</slot>
						<div
							v-if="hasCaption && (item.title || item.description)"
							class="base-slider__caption"
							:class="classes.caption">
							<slot name="caption" :item="item" :index="index">
								<h3 v-if="item.title" class="base-slider__title" :class="classes.title">{{ item.title }}</h3>
								<p v-if="item.description" class="base-slider__desc" :class="classes.desc">{{ item.description }}</p>
							</slot>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Навигация -->
		<div v-if="hasNavigation && canNavigate" class="base-slider__navigation" :class="classes.navigation">
			<div v-if="navigation === 'dots' || navigation === 'both'" class="base-slider__dots" :class="classes.dots">
				<button
					v-for="(_, page) in pageCount"
					:key="page"
					type="button"
					class="base-slider__dot"
					:class="[{ 'base-slider__dot--active': page === currentPage }, classes.dot]"
					:aria-label="slideLabel(page * perGroup)"
					:aria-current="page === currentPage ? 'true' : undefined"
					@click="goToPage(page)"></button>
			</div>

			<div
				v-if="navigation === 'thumbnails' || navigation === 'both'"
				class="base-slider__thumbs"
				:class="classes.thumbs">
				<button
					v-for="(item, index) in items"
					:key="index"
					type="button"
					class="base-slider__thumb"
					:class="[{ 'base-slider__thumb--active': index === currentIndex }, classes.thumb]"
					:aria-label="slideLabel(index)"
					:aria-current="index === currentIndex ? 'true' : undefined"
					@click="goTo(index)">
					<BaseImage
						:src="item.type === 'video' ? item.poster || '' : item.src"
						alt=""
						class="base-slider__thumb-image"
						:border-radius="0" />
					<span v-if="item.type === 'video'" class="base-slider__thumb-play">
						<BaseIcon name="play" :size-scale="calcIconScale('sm', sizeScale)" />
					</span>
				</button>
			</div>
		</div>

		<!-- Слот footer -->
		<slot name="footer" />
	</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import { formatMessage } from '@/locales'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseImage } from '@components/BaseImage'
import { useCustomClass } from '@composables/useCustomClass'
import { kitDefaults } from '@composables/useDefaults'
import { useSizeScale } from '@composables/useSizeScale'
import { useSlider } from '@composables/useSlider'
import { UI_ARIA, UI_SIZE, UI_TIMING, SIZE_SCALE_DEFAULT } from '@constants'
import { calcIconScale } from '@utils/iconUtils'
import '../styles/BaseSlider.style.scss'
import type { BaseSliderEmits, BaseSliderProps, BaseSliderSlots } from '../model/BaseSlider.types'

const props = withDefaults(defineProps<BaseSliderProps>(), kitDefaults('BaseSlider', {
	customClass: undefined,
	items: undefined,
	animation: 'slide',
	navigation: 'dots',
	isAutoplay: false,
	autoplayInterval: UI_TIMING.SLIDER_AUTOPLAY_INTERVAL,
	hasArrows: true,
	arrowsPosition: 'center',
	isLoop: true,
	isVertical: false,
	initialIndex: 0,
	height: UI_SIZE.SLIDER_DEFAULT_HEIGHT,
	sizeScale: SIZE_SCALE_DEFAULT,
	spaceBetween: 0,
	slidesPerView: 1,
	slidesPerGroup: 1,
	hasCaption: true,
	isZoomable: false,
}))

const emit = defineEmits<BaseSliderEmits>()
defineSlots<BaseSliderSlots>()
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
	onMouseEnter,
	onMouseLeave,
	onFocusIn,
	onFocusOut,
	onTouchStart,
	onTouchMove,
	onTouchEnd,
	onDragStart,
	onClickCapture,
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

/** Есть что листать: слайдов больше, чем помещается в область. Иначе стрелки и навигация не нужны. */
const canNavigate = computed(() => maxIndex.value > 0)

/** Стрелки поверх слайдов — приподнятые (shadow), снаружи в углах — контурные (outline). */
const arrowVariant = computed(() => (props.arrowsPosition === 'center' ? 'shadow' : 'outline'))

const perView = computed(() => Math.max(1, props.slidesPerView))
const perGroup = computed(() => Math.max(1, props.slidesPerGroup))

/** Слайд виден: в режиме slide — одно из perView окон начиная с текущего, в fade/scale/flip — только текущий. */
function isSlideVisible(index: number): boolean {
	if (props.animation !== 'slide') return index === currentIndex.value
	return index >= currentIndex.value && index < currentIndex.value + perView.value
}

/** «Слайд 2 из 6»: имя точки и миниатюры — номер слайда, к которому они ведут. */
function slideLabel(index: number): string {
	return formatMessage(UI_ARIA.SLIDE_POSITION, { current: index + 1, total: props.items.length })
}

let holdTimer: ReturnType<typeof setInterval> | null = null

/** Удержание стрелки — быстрое перелистывание */
function startHold(direction: 'prev' | 'next'): void {
	stopHold()
	const action = direction === 'next' ? goNext : goPrev
	holdTimer = setInterval(action, UI_TIMING.SLIDER_HOLD_INTERVAL)
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
