import { ITEMS } from './shared'
import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseAccordion from '../ui/BaseAccordion.vue'

export const args = {
	items: ITEMS,
	isMultiple: false,
	variant: 'default',
	sizeScale: 100,
	onToggle: fn(),
} satisfies Meta<typeof BaseAccordion>['args']
