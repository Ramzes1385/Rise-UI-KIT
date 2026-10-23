import { COMPANY } from './shared'
import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseDescriptions from '../ui/BaseDescriptions.vue'

export const args = {
	items: COMPANY,
	title: 'Реквизиты',
	columns: 3,
	minItemWidth: 240,
	layout: 'horizontal',
	isCopyable: false,
	onCopy: fn(),
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseDescriptions>['args']
