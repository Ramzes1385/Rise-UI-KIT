import type { Meta } from '@storybook/vue3-vite'
import type BaseImageMapEditor from '../ui/BaseImageMapEditor.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { IMAGE_MAP_EDITOR_TOOLS, IMAGE_MAP_EDITOR_VARIANTS } from '../types/BaseImageMapEditor.types'

export const argTypes = {
	...baseArgTypes({ variants: IMAGE_MAP_EDITOR_VARIANTS }),
	modelValue: { control: 'object', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	layer: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	selected: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	tool: { control: 'inline-radio', options: IMAGE_MAP_EDITOR_TOOLS, table: propGroup(ARG_GROUP.behavior) },
	historyLimit: { control: { type: 'number', min: 1 }, table: propGroup(ARG_GROUP.behavior) },
	nudgeStep: { control: { type: 'number', min: 0.001, max: 0.1, step: 0.001 }, table: propGroup(ARG_GROUP.behavior) },
	hasPreview: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	fileName: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	has3dFields: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	height: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseImageMapEditor>['argTypes']
