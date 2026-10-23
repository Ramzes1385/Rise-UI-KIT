import type { Meta } from '@storybook/vue3-vite'
import type BaseRequisiteInput from '../ui/BaseRequisiteInput.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { REQUISITE_INPUT_VARIANTS, REQUISITE_KINDS } from '../types/BaseRequisiteInput.types'

export const argTypes = {
	...baseArgTypes({ variants: REQUISITE_INPUT_VARIANTS }),
	kind: { control: 'select', options: REQUISITE_KINDS, table: propGroup(ARG_GROUP.content) },
	modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
	bik: { control: 'text', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseRequisiteInput>['argTypes']
