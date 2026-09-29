import type { Meta } from '@storybook/vue3-vite'
import type BaseVoiceRecorder from '../ui/BaseVoiceRecorder.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { VOICE_RECORDER_VARIANTS } from '../types/BaseVoiceRecorder.types'

export const argTypes = {
	...baseArgTypes({ variants: VOICE_RECORDER_VARIANTS }),
	maxDuration: { control: { type: 'number', min: 1 }, table: propGroup(ARG_GROUP.behavior) },
	mimeType: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	bars: { control: { type: 'number', min: 8, max: 128 }, table: propGroup(ARG_GROUP.appearance) },
	hasPreview: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseVoiceRecorder>['argTypes']
