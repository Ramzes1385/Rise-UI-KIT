import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseButton from '../ui/BaseButton.vue'

export const args = {
	default: 'Сохранить',
	variant: 'default',
	type: 'button',
	isLoading: false,
	isDisabled: false,
	isFocusableWhenDisabled: false,
	sizeScale: 100,
	onClick: fn(),
} satisfies Meta<typeof BaseButton>['args']
