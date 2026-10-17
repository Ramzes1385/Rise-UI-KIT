import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseRoadmap from '../ui/BaseRoadmap.vue'

export const args = {
	data: { version: 1, title: 'Пример', stages: [] },
	isDisabled: false,
	onSelect: fn(),
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseRoadmap>['args']
