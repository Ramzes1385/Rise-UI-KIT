import { fn } from 'storybook/test'
import { AI_ANSWER } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseAiMessage from '../ui/BaseAiMessage.vue'

export const args = {
	content: AI_ANSWER,
	isStreaming: false,
	name: 'Ассистент',
	time: '12:04',
	hasCopy: true,
	variant: 'default',
	sizeScale: 100,
	onRetry: fn(),
	onCopy: fn(),
} satisfies Meta<typeof BaseAiMessage>['args']
