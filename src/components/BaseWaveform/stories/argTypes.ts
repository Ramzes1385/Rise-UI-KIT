import type { Meta } from '@storybook/vue3-vite'
import type BaseWaveform from '../ui/BaseWaveform.vue'
import { WAVEFORM_VARIANTS } from '../types/BaseWaveform.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: WAVEFORM_VARIANTS }),
	peaks: { control: 'object', table: propGroup(ARG_GROUP.content) },
	duration: { control: { type: 'number', min: 1 }, table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	currentTime: { control: { type: 'number', min: 0 }, table: propGroup(ARG_GROUP.state) },
	selection: { control: 'object', table: propGroup(ARG_GROUP.state) },
	isSelectable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	step: { control: { type: 'number', min: 1 }, table: propGroup(ARG_GROUP.a11y) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseWaveform>['argTypes']
