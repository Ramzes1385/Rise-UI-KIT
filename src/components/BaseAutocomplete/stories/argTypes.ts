import type { Meta } from '@storybook/vue3-vite'
import type BaseAutocomplete from '../ui/BaseAutocomplete.vue'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'
import { AUTOCOMPLETE_VARIANTS } from '../types/BaseAutocomplete.types'

export const argTypes = {
	...baseArgTypes({ variants: AUTOCOMPLETE_VARIANTS }),
	modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
	options: { control: 'object', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isCustomAllowed: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isRemote: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	maxResults: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isReadonly: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseAutocomplete>['argTypes']
