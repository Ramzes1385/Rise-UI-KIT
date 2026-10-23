import { fn } from 'storybook/test'
import { DEMO_CUES } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseSubtitleEditor from '../ui/BaseSubtitleEditor.vue'

export const args = {
	cues: DEMO_CUES,
	currentTime: 4,
	duration: 12,
	cueLength: 2,
	fileName: 'demo',
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
	'onUpdate:cues': fn(),
	'onUpdate:currentTime': fn(),
	onExport: fn(),
} satisfies Meta<typeof BaseSubtitleEditor>['args']
