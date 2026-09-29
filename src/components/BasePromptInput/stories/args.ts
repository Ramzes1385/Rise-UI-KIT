import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BasePromptInput from '../ui/BasePromptInput.vue'

export const args = {
	modelValue: '',
	isDisabled: false,
	isGenerating: false,
	rows: 1,
	maxRows: 8,
	variant: 'default',
	sizeScale: 100,
	onSubmit: fn(),
	onStop: fn(),
} satisfies Meta<typeof BasePromptInput>['args']
