import { fn } from 'storybook/test'
import { MAIN_MAP } from './fixtures/services'
import type { Meta } from '@storybook/vue3-vite'
import type BaseFlowMap from '../ui/BaseFlowMap.vue'

export const args = {
	data: MAIN_MAP,
	mode: 'view',
	height: '560px',
	isDisabled: false,
	isLoading: false,
	onReady: fn(),
	onChange: fn(),
	onReject: fn(),
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseFlowMap>['args']
