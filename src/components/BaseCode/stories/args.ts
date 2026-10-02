import { fn } from 'storybook/test'
import { TS_SAMPLE } from './shared'
import type BaseCode from '../ui/BaseCode.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	code: TS_SAMPLE,
	language: 'ts',
	hasLineNumbers: true,
	startLine: 1,
	hasCopyButton: true,
	hasHeader: true,
	isWrapped: false,
	variant: 'default',
	sizeScale: 100,
	onCopy: fn(),
} satisfies Meta<typeof BaseCode>['args']
