import { fn } from 'storybook/test'
import { voicedSlides } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BasePresentationPlayer from '../ui/BasePresentationPlayer.vue'

export const args = {
	title: 'Знакомство с компанией',
	slides: voicedSlides(),
	slide: 0,
	navigation: 'free',
	hasTitle: true,
	hasKeyboardShortcuts: true,
	'onUpdate:slide': fn(),
	onPlay: fn(),
	onPause: fn(),
	'onSlide-complete': fn(),
	onProgress: fn(),
	onComplete: fn(),
	'onSpeech-error': fn(),
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BasePresentationPlayer>['args']
