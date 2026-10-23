import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseFileManager from '../ui/BaseFileManager.vue'

export const args = {
	items: [],
	isLoading: false,
	isDisabled: false,
	isReadonly: false,
	hasTree: true,
	variant: 'default',
	sizeScale: 100,
	onOpen: fn(),
	'onCreate-folder': fn(),
	onRename: fn(),
	onDelete: fn(),
	onMove: fn(),
	onUpload: fn(),
	onRetry: fn(),
} satisfies Meta<typeof BaseFileManager>['args']
