import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseAudioPlayer from '../ui/BaseAudioPlayer.vue'
import { DEMO_VOICE, DEMO_VOICE_DURATION, DEMO_VOICE_PEAKS } from './shared'

export const args = {
	src: DEMO_VOICE,
	title: 'Голосовое сообщение',
	hasTitle: false,
	peaks: DEMO_VOICE_PEAKS,
	bars: 48,
	duration: DEMO_VOICE_DURATION,
	playbackRates: [1, 1.5, 2],
	isExclusive: true,
	isDisabled: false,
	isTranscriptOpen: false,
	variant: 'default',
	sizeScale: 100,
	onPlay: fn(),
	onPause: fn(),
	onEnded: fn(),
	onError: fn(),
	'onUpdate:currentTime': fn(),
	'onUpdate:isTranscriptOpen': fn(),
} satisfies Meta<typeof BaseAudioPlayer>['args']
