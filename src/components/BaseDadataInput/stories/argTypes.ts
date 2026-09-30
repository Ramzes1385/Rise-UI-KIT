import type { Meta } from '@storybook/vue3-vite'
import { DADATA_KINDS } from '@utils/data/dadataUtils'
import type BaseDadataInput from '../ui/BaseDadataInput.vue'
import { DADATA_INPUT_VARIANTS } from '../types/BaseDadataInput.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: DADATA_INPUT_VARIANTS }),
	modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
	kind: { control: 'select', options: DADATA_KINDS, table: propGroup(ARG_GROUP.behavior) },
	token: { control: false, table: propGroup(ARG_GROUP.behavior) },
	baseUrl: { control: false, table: propGroup(ARG_GROUP.behavior) },
	count: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	params: { control: false, table: propGroup(ARG_GROUP.behavior) },
	source: { control: false, table: propGroup(ARG_GROUP.behavior) },
	minChars: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	debounce: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseDadataInput>['argTypes']
