import { fn } from 'storybook/test'
import { CHECKOUT_FLOW } from './demo/checkout'
import type { Meta } from '@storybook/vue3-vite'
import type BaseFlowMap3D from '../ui/BaseFlowMap3D.vue'

export const args = {
	data: CHECKOUT_FLOW,
	view: '3d',
	height: '560px',
	isDisabled: false,
	isLoading: false,
	onReady: fn(),
	onFallback: fn(),
	onChange: fn(),
	onError: fn(),
	sizeScale: 100,
} satisfies Meta<typeof BaseFlowMap3D>['args']
