import type { Meta } from '@storybook/vue3-vite'
import type BaseEmojiPicker from '../ui/BaseEmojiPicker.vue'
import { EMOJI_PICKER_VARIANTS } from '../types/BaseEmojiPicker.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: EMOJI_PICKER_VARIANTS }),
	recent: { control: 'object', table: propGroup(ARG_GROUP.content) },
	emojis: { control: 'object', table: propGroup(ARG_GROUP.content) },
	maxRecent: { control: { type: 'number', min: 1 }, table: propGroup(ARG_GROUP.behavior) },
	columns: { control: { type: 'number', min: 4, max: 12 }, table: propGroup(ARG_GROUP.appearance) },
	hasSearch: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	hasPreview: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseEmojiPicker>['argTypes']
