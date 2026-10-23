import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import { DEMO_DURATION, DEMO_PEAKS } from './shared'
import type BaseWaveform from '../ui/BaseWaveform.vue'

export const args = {
	peaks: DEMO_PEAKS,
	duration: DEMO_DURATION,
	label: 'Перемотка',
	currentTime: 20,
	selection: null,
	isSelectable: false,
	step: 5,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
	'onUpdate:currentTime': fn(),
	'onUpdate:selection': fn(),
} satisfies Meta<typeof BaseWaveform>['args']
