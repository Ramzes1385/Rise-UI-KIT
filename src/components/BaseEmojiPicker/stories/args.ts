import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseEmojiPicker from '../ui/BaseEmojiPicker.vue'

export const args = {
	maxRecent: 24,
	columns: 8,
	hasSearch: true,
	hasPreview: true,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
	onSelect: fn(),
	'onUpdate:recent': fn(),
} satisfies Meta<typeof BaseEmojiPicker>['args']
