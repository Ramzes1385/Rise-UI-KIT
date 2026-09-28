import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import { DEMO_POSTER, DEMO_SOURCES } from './shared'
import type BaseMediaPlayer from '../ui/BaseMediaPlayer.vue'

export const args = {
	sources: DEMO_SOURCES,
	title: 'Демо-ролик Rise UI Kit',
	poster: DEMO_POSTER,
	preload: 'metadata',
	aspectRatio: '16 / 9',
	isAutoplay: false,
	isLoop: false,
	hasKeyboardShortcuts: true,
	seekStep: 5,
	seekStepLarge: 10,
	volumeStep: 0.05,
	idleTimeout: 3000,
	sizeScale: 100,
	onPlay: fn(),
	onPause: fn(),
	onEnded: fn(),
	onError: fn(),
} satisfies Meta<typeof BaseMediaPlayer>['args']
