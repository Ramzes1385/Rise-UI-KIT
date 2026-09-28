import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseColorModeButton from '../ui/BaseColorModeButton.vue'

export const args = {
	label: 'Тёмная тема',
	isDisabled: false,
	variant: 'ghost',
	sizeScale: 100,
	onChange: fn(),
} satisfies Meta<typeof BaseColorModeButton>['args']
