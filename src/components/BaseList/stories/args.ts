import { SECTIONS } from './shared'
import { fn } from 'storybook/test'
import type { ListStoryArgs } from './shared'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	items: SECTIONS,
	modelValue: null,
	selectionMode: 'single',
	isSortable: false,
	label: 'Разделы',
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
	onMove: fn(),
	onActivate: fn(),
} satisfies Meta<ListStoryArgs>['args']
