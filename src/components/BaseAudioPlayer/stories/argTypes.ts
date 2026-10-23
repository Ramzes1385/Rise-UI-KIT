import type { Meta } from '@storybook/vue3-vite'
import type BaseAudioPlayer from '../ui/BaseAudioPlayer.vue'
import { AUDIO_PLAYER_VARIANTS } from '../types/BaseAudioPlayer.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: AUDIO_PLAYER_VARIANTS }),
	src: { control: 'text', table: propGroup(ARG_GROUP.content) },
	title: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	hasTitle: { control: 'boolean', table: propGroup(ARG_GROUP.content) },
	peaks: { control: 'object', table: propGroup(ARG_GROUP.content) },
	bars: { control: { type: 'number', min: 8, max: 128 }, table: propGroup(ARG_GROUP.appearance) },
	duration: { control: { type: 'number', min: 0 }, table: propGroup(ARG_GROUP.content) },
	currentTime: { control: { type: 'number', min: 0 }, table: propGroup(ARG_GROUP.state) },
	playbackRates: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
	isExclusive: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	transcript: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isTranscriptOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseAudioPlayer>['argTypes']
