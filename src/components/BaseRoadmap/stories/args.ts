import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseRoadmap from '../ui/BaseRoadmap.vue'
import { frontendVue, frontendVueProgress } from './demo/frontendVue'

export const args = {
	data: frontendVue,
	progress: frontendVueProgress,
	expanded: ['s4'],
	selected: null,
	filter: 'all',
	layout: 'path',
	isDisabled: false,
	isLoading: false,
	onSelect: fn(),
	'onStatus-change': fn(),
	'onTopic-complete': fn(),
	'onStage-complete': fn(),
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseRoadmap>['args']
