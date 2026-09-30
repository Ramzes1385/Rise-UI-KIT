import { ORDER } from './shared'
import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseJsonViewer from '../ui/BaseJsonViewer.vue'

export const args = {
	value: ORDER,
	label: 'Заказ З-1052',
	expandDepth: 1,
	hasToolbar: true,
	onCopy: fn(),
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseJsonViewer>['args']
