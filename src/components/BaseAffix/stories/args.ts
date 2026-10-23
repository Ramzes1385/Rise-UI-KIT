import { fn } from 'storybook/test'
import type BaseAffix from '../ui/BaseAffix.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	hasShadow: false,
	sizeScale: 100,
	onChange: fn(),
} satisfies Meta<typeof BaseAffix>['args']
