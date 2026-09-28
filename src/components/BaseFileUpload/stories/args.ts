import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseFileUpload from '../ui/BaseFileUpload.vue'

export const args = {
	label: 'Вложения',
	accept: '.pdf,.docx,image/*',
	maxSize: 10,
	variant: 'default',
	isMultiple: false,
	isDisabled: false,
	allowPreview: true,
	sizeScale: 100,
	onChange: fn(),
	onError: fn(),
	onRemove: fn(),
} satisfies Meta<typeof BaseFileUpload>['args']
