import { TABS } from './shared'
import { fn } from 'storybook/test'
import type BaseTabs from '../ui/BaseTabs.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	modelValue: 'overview',
	items: TABS,
	variant: 'underline',
	isFullWidth: false,
	isScrollable: false,
	sizeScale: 100,
	'onUpdate:modelValue': fn(),
	onChange: fn(),
} satisfies Meta<typeof BaseTabs>['args']
