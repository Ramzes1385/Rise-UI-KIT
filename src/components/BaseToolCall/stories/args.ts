import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import { TOOL_ARGS, TOOL_RESULT } from './shared'
import type BaseToolCall from '../ui/BaseToolCall.vue'

export const args = {
	name: 'search_docs',
	title: 'Поиск по документации',
	status: 'success',
	args: TOOL_ARGS,
	result: TOOL_RESULT,
	isOpen: false,
	variant: 'default',
	sizeScale: 100,
	'onUpdate:isOpen': fn(),
} satisfies Meta<typeof BaseToolCall>['args']
