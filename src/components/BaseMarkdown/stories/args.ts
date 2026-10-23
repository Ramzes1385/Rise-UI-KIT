import { MARKDOWN_SAMPLE } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseMarkdown from '../ui/BaseMarkdown.vue'

export const args = {
	source: MARKDOWN_SAMPLE,
	isStreaming: false,
	hasLineBreaks: true,
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseMarkdown>['args']
