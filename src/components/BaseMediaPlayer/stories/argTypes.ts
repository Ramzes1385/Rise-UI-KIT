import type { Meta } from '@storybook/vue3-vite'
import type BaseMediaPlayer from '../ui/BaseMediaPlayer.vue'
import { MEDIA_PRELOAD_MODES } from '../types/BaseMediaPlayer.types'
import { ARG_GROUP, baseArgTypes, hiddenArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes(),
	...hiddenArgTypes('variant', 'color'),
	sources: { control: 'object', table: propGroup(ARG_GROUP.content) },
	title: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	poster: { control: 'text', table: propGroup(ARG_GROUP.content) },
	aspectRatio: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	preload: { control: 'inline-radio', options: [...MEDIA_PRELOAD_MODES], table: propGroup(ARG_GROUP.behavior) },
	crossorigin: { control: 'inline-radio', options: ['anonymous', 'use-credentials'], table: propGroup(ARG_GROUP.behavior) },
	isAutoplay: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isLoop: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	idleTimeout: { control: { type: 'number', min: 500, step: 500 }, table: propGroup(ARG_GROUP.behavior) },
	allowedProtocols: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
	hasKeyboardShortcuts: { control: 'boolean', table: propGroup(ARG_GROUP.a11y) },
	seekStep: { control: { type: 'number', min: 1 }, table: propGroup(ARG_GROUP.a11y) },
	seekStepLarge: { control: { type: 'number', min: 1 }, table: propGroup(ARG_GROUP.a11y) },
	volumeStep: { control: { type: 'number', min: 0.01, max: 0.5, step: 0.01 }, table: propGroup(ARG_GROUP.a11y) },
	playbackRates: { control: 'object', table: propGroup(ARG_GROUP.a11y) },
	error: { control: false },
} satisfies Meta<typeof BaseMediaPlayer>['argTypes']
