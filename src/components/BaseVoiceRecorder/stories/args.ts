import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseVoiceRecorder from '../ui/BaseVoiceRecorder.vue'

export const args = {
	maxDuration: 300,
	bars: 48,
	hasPreview: true,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
	onRecord: fn(),
	onCancel: fn(),
	onError: fn(),
	'onState-change': fn(),
} satisfies Meta<typeof BaseVoiceRecorder>['args']
