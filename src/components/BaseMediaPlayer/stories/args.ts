import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import { DEMO_POSTER, DEMO_SOURCES } from './shared'
import type BaseMediaPlayer from '../ui/BaseMediaPlayer.vue'

export const args = {
	sources: DEMO_SOURCES,
	title: 'Демо-ролик Rise UI Kit',
	hasTitle: true,
	logoPosition: 'top-right',
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
	hasCaptionUpload: true,
	nextCountdown: 5,
	sizeScale: 100,
	onPlay: fn(),
	onPause: fn(),
	onEnded: fn(),
	onError: fn(),
	'onFullscreen-change': fn(),
	'onUpdate:isTheater': fn(),
	'onUpdate:textTrack': fn(),
	'onUpdate:audioTrack': fn(),
	'onUpdate:episode': fn(),
	'onUpdate:isAutoNext': fn(),
	onReport: fn(),
} satisfies Meta<typeof BaseMediaPlayer>['args']
