import type { Meta } from '@storybook/vue3-vite'
import type BaseImageMapEditor from '../ui/BaseImageMapEditor.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { IMAGE_MAP_EDITOR_VARIANTS } from '../types/BaseImageMapEditor.types'

export const argTypes = {
	...baseArgTypes({ variants: IMAGE_MAP_EDITOR_VARIANTS }),
	modelValue: { control: 'object', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseImageMapEditor>['argTypes']
