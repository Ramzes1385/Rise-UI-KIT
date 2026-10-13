import type { Meta } from '@storybook/vue3-vite'
import type BaseEditor from '../ui/BaseEditor.vue'
import { EDITOR_VARIANTS } from '../types/BaseEditor.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: EDITOR_VARIANTS }),
	modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
	placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	hasToolbar: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isReadonly: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isAutofocus: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	toolbar: { control: false },
} satisfies Meta<typeof BaseEditor>['argTypes']
