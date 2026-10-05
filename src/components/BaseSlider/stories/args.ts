import { SLIDES } from './shared'
import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseSlider from '../ui/BaseSlider.vue'

export const args = {
	items: SLIDES,
	animation: 'slide',
	navigation: 'dots',
	thumbnailsPosition: 'bottom',
	hasArrows: true,
	arrowsPosition: 'center',
	isLoop: true,
	isAutoplay: false,
	autoplayInterval: 4000,
	isVertical: false,
	initialIndex: 0,
	height: '400px',
	spaceBetween: 0,
	slidesPerView: 1,
	slidesPerGroup: 1,
	hasCaption: true,
	isZoomable: false,
	sizeScale: 100,
	onChange: fn(),
	onNext: fn(),
	onPrev: fn(),
} satisfies Meta<typeof BaseSlider>['args']
