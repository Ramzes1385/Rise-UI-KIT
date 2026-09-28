import { fn } from 'storybook/test'
import type BaseForm from '../ui/BaseForm.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	isLoading: false,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
	onSubmit: fn(),
} satisfies Meta<typeof BaseForm>['args']
