<template>
	<div
		:class="[
			ui('root'),
			{
				'base-slider--vertical': isVertical,
				'base-slider--dragging': isDragging,
				'base-slider--gapped': spaceBetween > 0,
				[`base-slider--${animation}`]: true,
				[`base-slider--arrows-${arrowsPosition}`]: hasArrows,
			},
			thumbsSideClass,
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

		<div :class="ui('body')">
			<div :class="ui('stage')">
				<BaseButton
					v-if="hasRotationControl"
					variant="ghost"
					:class="[ui('rotation'), classes.rotation]"
					:aria-label="rotationLabel"
					:size-scale="sizeScale"
					data-slider-rotation
					@click="toggleRotation">
					<BaseIcon :name="isAutoplayStopped ? 'play' : 'pause'" />
				</BaseButton>
				<div v-if="hasArrows && canNavigate" :class="[ui('arrows'), classes.arrows]">
					<BaseButton
						:variant="arrowVariant"
						:class="[ui('arrow'), 'base-slider__arrow--prev', classes.arrow]"
						:aria-label="UI_ARIA.SLIDER_PREV"
						:is-disabled="!isLoop && currentIndex === 0"
						is-focusable-when-disabled
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
						:class="[ui('arrow'), 'base-slider__arrow--next', classes.arrow]"
						:aria-label="UI_ARIA.SLIDER_NEXT"
						:is-disabled="!isLoop && currentIndex >= maxIndex"
						is-focusable-when-disabled
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
					:class="[ui('viewport'), classes.viewport]"
					@touchstart="onTouchStart"
					@touchmove="onTouchMove"
					@touchend="onTouchEnd"
					@touchcancel="onTouchCancel"
					@mousedown="onDragStart"
					@click.capture="onClickCapture"
					@dragstart.prevent>
					<div :class="[ui('track'), classes.track]" :style="trackStyle" :aria-live="liveMode">
						<div
							v-for="(item, index) in items"
							:key="index"
							:class="[ui('slide'), { 'base-slider__slide--active': index === currentIndex }, classes.slide]"
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
									:class="ui('video')"
									controls
									muted
									loop
									playsinline
									@play="onVideoPlay"></video>
								<BaseImage
									v-else
									:src="item.src"
									:alt="item.alt || ''"
									:class="ui('image')"
									:border-radius="0"
									loading="lazy"
									:zoom-config="{ hasZoom: isZoomable }" />
							</slot>
							<div v-if="hasCaption && (item.title || item.description)" :class="[ui('caption'), classes.caption]">
								<slot name="caption" :item="item" :index="index">
									<h3 v-if="item.title" :class="[ui('title'), classes.title]">{{ item.title }}</h3>
									<p v-if="item.description" :class="[ui('desc'), classes.desc]">{{ item.description }}</p>
								</slot>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div v-if="hasNavigation && canNavigate" :class="[ui('navigation'), classes.navigation]">
				<div v-if="navigation === 'dots' || navigation === 'both'" :class="[ui('dots'), classes.dots]">
					<button
						v-for="(_, page) in pageCount"
						:key="page"
						type="button"
						:class="[ui('dot'), { 'base-slider__dot--active': page === currentPage }, classes.dot]"
						:aria-label="slideLabel(page * perGroup)"
						:aria-current="page === currentPage ? 'true' : undefined"
						@click="goToPage(page)"></button>
				</div>

				<div v-if="navigation === 'thumbnails' || navigation === 'both'" ref="thumbsRef" :class="[ui('thumbs'), classes.thumbs]">
					<button
						v-for="(item, index) in items"
						:key="index"
						type="button"
						:class="[ui('thumb'), { 'base-slider__thumb--active': index === currentIndex }, classes.thumb]"
						:aria-label="slideLabel(index)"
						:aria-current="index === currentIndex ? 'true' : undefined"
						@click="goTo(index)"
						@keydown="onThumbKeydown($event, index)">
						<BaseImage
							:src="item.type === 'video' ? item.poster || '' : item.src"
							alt=""
							:class="ui('thumb-image')"
							:border-radius="0" />
						<span v-if="item.type === 'video'" :class="ui('thumb-play')">
							<BaseIcon name="play" :size-scale="calcIconScale('sm', sizeScale)" />
						</span>
					</button>
				</div>
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
		thumbnailsPosition: 'bottom',
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
	ui,
	sizeScaleStyle,
	classes,
	viewportRef,
	thumbsRef,
	thumbsSideClass,
	onThumbKeydown,
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
