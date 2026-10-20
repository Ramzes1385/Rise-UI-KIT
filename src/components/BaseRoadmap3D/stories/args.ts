import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseRoadmap3D from '../ui/BaseRoadmap3D.vue'
import { frontendVue, frontendVueProgress } from '@components/BaseRoadmap/stories/demo/frontendVue'

export const args = {
	data: frontendVue,
	progress: frontendVueProgress,
	selected: null,
	view: '3d',
	camera: 'iso',
	focused: null,
	isTourPlaying: false,
	quality: 'auto',
	isDisabled: false,
	isLoading: false,
	onFallback: fn(),
	'onStatus-change': fn(),
	sizeScale: 100,
} satisfies Meta<typeof BaseRoadmap3D>['args']
