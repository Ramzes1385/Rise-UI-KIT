import type { Meta } from '@storybook/vue3-vite'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import type BasePresentationPlayer from '../ui/BasePresentationPlayer.vue'
import { PRESENTATION_NAVIGATION_MODES, PRESENTATION_PLAYER_VARIANTS } from '../types/BasePresentationPlayer.types'

export const argTypes = {
	...baseArgTypes({ variants: PRESENTATION_PLAYER_VARIANTS }),
	title: { control: 'text', table: propGroup(ARG_GROUP.content) },
	slides: { control: 'object', table: propGroup(ARG_GROUP.content) },
	audio: { control: false, table: propGroup(ARG_GROUP.content) },
	slide: { control: { type: 'number', min: 0, step: 1 }, table: propGroup(ARG_GROUP.state) },
	navigation: { control: 'inline-radio', options: PRESENTATION_NAVIGATION_MODES, table: propGroup(ARG_GROUP.behavior) },
	maxRate: { control: { type: 'number', min: 0.25, step: 0.25 }, table: propGroup(ARG_GROUP.behavior) },
	storageKey: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	hasTitle: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	hasKeyboardShortcuts: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	playbackRates: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
	aspectRatio: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	idleTimeout: { control: { type: 'number', min: 0, step: 500 }, table: propGroup(ARG_GROUP.behavior) },
} satisfies Meta<typeof BasePresentationPlayer>['argTypes']
