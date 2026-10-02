import { fn } from 'storybook/test'
import type { MarqueeStoryArgs } from './shared'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	direction: 'left',
	speed: 50,
	gap: 32,
	hasFade: false,
	hasPauseButton: true,
	isPaused: false,
	variant: 'default',
	sizeScale: 100,
	'onUpdate:isPaused': fn(),
} satisfies Meta<MarqueeStoryArgs>['args']
