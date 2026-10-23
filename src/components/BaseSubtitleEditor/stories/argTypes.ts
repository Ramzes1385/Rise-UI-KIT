import type { Meta } from '@storybook/vue3-vite'
import type BaseSubtitleEditor from '../ui/BaseSubtitleEditor.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { SUBTITLE_EDITOR_VARIANTS } from '../types/BaseSubtitleEditor.types'

export const argTypes = {
	...baseArgTypes({ variants: SUBTITLE_EDITOR_VARIANTS }),
	cues: { control: 'object', table: propGroup(ARG_GROUP.content) },
	currentTime: { control: { type: 'number', min: 0 }, table: propGroup(ARG_GROUP.state) },
	duration: { control: { type: 'number', min: 1 }, table: propGroup(ARG_GROUP.content) },
	cueLength: { control: { type: 'number', min: 0.5, step: 0.5 }, table: propGroup(ARG_GROUP.behavior) },
	fileName: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseSubtitleEditor>['argTypes']
