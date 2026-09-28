import type { Meta } from '@storybook/vue3-vite'
import type BaseSlider from '../ui/BaseSlider.vue'
import { baseArgTypes, hiddenArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes(),
	...hiddenArgTypes('variant', 'color'),
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	hasCaption: { control: 'boolean', table: propGroup(ARG_GROUP.content) },
	height: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	navigation: { control: 'inline-radio', options: ['dots', 'thumbnails', 'both', 'none'], table: propGroup(ARG_GROUP.appearance) },
	hasArrows: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	arrowsPosition: {
		control: 'inline-radio',
		options: ['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right'],
		table: propGroup(ARG_GROUP.appearance),
	},
	isVertical: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	spaceBetween: { control: { type: 'number', min: 0, max: 48, step: 4 }, table: propGroup(ARG_GROUP.appearance) },
	slidesPerView: { control: { type: 'number', min: 1, max: 4 }, table: propGroup(ARG_GROUP.appearance) },
	animation: { control: 'inline-radio', options: ['slide', 'fade', 'scale', 'flip'], table: propGroup(ARG_GROUP.behavior) },
	slidesPerGroup: { control: { type: 'number', min: 1, max: 4 }, table: propGroup(ARG_GROUP.behavior) },
	isLoop: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isAutoplay: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	autoplayInterval: { control: { type: 'number', min: 1000, step: 500 }, table: propGroup(ARG_GROUP.behavior) },
	initialIndex: { control: { type: 'number', min: 0 }, table: propGroup(ARG_GROUP.behavior) },
	isZoomable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	default: { control: false },
	caption: { control: false },
	header: { control: false },
	footer: { control: false },
} satisfies Meta<typeof BaseSlider>['argTypes']
