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
		role="region"
		:aria-roledescription="UI_CAROUSEL.ROLE"
		:aria-label="carouselLabel"
		@mouseenter="onMouseEnter"
		@mouseleave="onMouseLeave"
		@focusin="onFocusIn"
		@focusout="onFocusOut">
		<slot name="header" />

		<div class="base-slider__stage">
			<BaseButton
				v-if="hasRotationControl"
				variant="ghost"
				class="base-slider__rotation"
				:class="classes.rotation"
				:aria-label="rotationLabel"
				:size-scale="sizeScale"
				data-slider-rotation
				@click="toggleRotation">
				<BaseIcon :name="isAutoplayStopped ? 'play' : 'pause'" />
			</BaseButton>
			<div v-if="hasArrows && canNavigate" class="base-slider__arrows" :class="classes.arrows">
				<BaseButton
					:variant="arrowVariant"
					class="base-slider__arrow base-slider__arrow--prev"
					:class="classes.arrow"
					:aria-label="UI_ARIA.SLIDER_PREV"
					:is-disabled="!isLoop && currentIndex === 0"
					:size-scale="sizeScale"
					@click="onArrowClick('prev', $event)"
					@pointerdown="startHold('prev', $event)"
					@pointerup="stopHold"
					@pointerleave="stopHold"
					@pointercancel="stopHold">
					<BaseIcon :name="isVertical ? 'chevron-up' : 'chevron-left'" />
				</BaseButton>
				<BaseButton
					:variant="arrowVariant"
					class="base-slider__arrow base-slider__arrow--next"
					:class="classes.arrow"
					:aria-label="UI_ARIA.SLIDER_NEXT"
					:is-disabled="!isLoop && currentIndex >= maxIndex"
					:size-scale="sizeScale"
					@click="onArrowClick('next', $event)"
					@pointerdown="startHold('next', $event)"
					@pointerup="stopHold"
					@pointerleave="stopHold"
					@pointercancel="stopHold">
					<BaseIcon :name="isVertical ? 'chevron-down' : 'chevron-right'" />
				</BaseButton>
			</div>

			<div
				ref="viewportRef"
				class="base-slider__viewport"
				:class="classes.viewport"
				@touchstart="onTouchStart"
				@touchmove="onTouchMove"
				@touchend="onTouchEnd"
				@touchcancel="onTouchCancel"
				@mousedown="onDragStart"
				@click.capture="onClickCapture"
				@dragstart.prevent>
				<div class="base-slider__track" :class="classes.track" :style="trackStyle" :aria-live="liveMode">
					<div
						v-for="(item, index) in items"
						:key="index"
						class="base-slider__slide"
						:class="[{ 'base-slider__slide--active': index === currentIndex }, classes.slide]"
						:style="[slideStyle, slideEffectStyle(index)]"
						role="group"
						:aria-roledescription="UI_CAROUSEL.SLIDE_ROLE"
						:aria-label="slideGroupLabel(index)"
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
								playsinline
								@play="onVideoPlay"></video>
							<BaseImage
								v-else
								:src="item.src"
								:alt="item.alt || ''"
								class="base-slider__image"
								:border-radius="0"
								loading="lazy"
								:zoom-config="{ hasZoom: isZoomable }" />
						</slot>
						<div v-if="hasCaption && (item.title || item.description)" class="base-slider__caption" :class="classes.caption">
							<slot name="caption" :item="item" :index="index">
								<h3 v-if="item.title" class="base-slider__title" :class="classes.title">{{ item.title }}</h3>
								<p v-if="item.description" class="base-slider__desc" :class="classes.desc">{{ item.description }}</p>
							</slot>
						</div>
					</div>
				</div>
			</div>
		</div>

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

			<div v-if="navigation === 'thumbnails' || navigation === 'both'" class="base-slider__thumbs" :class="classes.thumbs">
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

		<slot name="footer" />
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseSlider.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseImage } from '@components/BaseImage'
import { BaseButton } from '@components/BaseButton'
import { useBaseSlider } from '../model/useBaseSlider'
import { calcIconScale } from '@utils/media/iconUtils'
import { UI_ARIA, UI_CAROUSEL } from '@/locales/messages'
import { kitDefaults } from '@composables/base/useDefaults'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseSliderEmits, BaseSliderExpose, BaseSliderProps, BaseSliderSlots } from '../types/BaseSlider.types'

const props = withDefaults(
	defineProps<BaseSliderProps>(),
	kitDefaults('BaseSlider', {
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
		height: '400px',
		sizeScale: SIZE_SCALE_DEFAULT,
		spaceBetween: 0,
		slidesPerView: 1,
		slidesPerGroup: 1,
		hasCaption: true,
		isZoomable: false,
		label: undefined,
	}),
)
const emit = defineEmits<BaseSliderEmits>()
defineSlots<BaseSliderSlots>()

const {
	sizeScaleStyle,
	classes,
	viewportRef,
	currentIndex,
	isDragging,
	trackStyle,
	slideStyle,
	maxIndex,
	pageCount,
	currentPage,
	goTo,
	goToPage,
	onMouseEnter,
	onMouseLeave,
	onFocusIn,
	onFocusOut,
	onTouchStart,
	onTouchMove,
	onTouchEnd,
	onTouchCancel,
	onDragStart,
	onClickCapture,
	hasNavigation,
	canNavigate,
	arrowVariant,
	perGroup,
	isSlideVisible,
	slideEffectStyle,
	slideLabel,
	slideGroupLabel,
	carouselLabel,
	liveMode,
	hasRotationControl,
	rotationLabel,
	toggleRotation,
	isAutoplayStopped,
	onVideoPlay,
	startHold,
	stopHold,
	onArrowClick,
	exposed,
} = useBaseSlider(props, emit)

defineExpose<BaseSliderExpose>(exposed)
</script>
