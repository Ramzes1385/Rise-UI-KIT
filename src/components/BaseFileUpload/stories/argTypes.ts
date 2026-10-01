import type { Meta } from '@storybook/vue3-vite'
import type BaseFileUpload from '../ui/BaseFileUpload.vue'
import { FILE_UPLOAD_VARIANTS } from '../types/BaseFileUpload.types'
import { baseArgTypes, hiddenArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: FILE_UPLOAD_VARIANTS }),
	...hiddenArgTypes('emptyText'),
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	buttonText: { control: 'text', table: propGroup(ARG_GROUP.content) },
	previewSize: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	accept: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	isMultiple: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	maxSize: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	maxCount: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	allowPreview: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	trigger: { control: false },
} satisfies Meta<typeof BaseFileUpload>['argTypes']
