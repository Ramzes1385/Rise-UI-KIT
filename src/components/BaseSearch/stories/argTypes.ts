import type { SearchArgs } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import { SEARCH_VARIANTS } from '../types/BaseSearch.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: SEARCH_VARIANTS }),
	modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
	results: { control: 'object', table: propGroup(ARG_GROUP.content) },
	placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	maxResults: { control: 'number', table: propGroup(ARG_GROUP.content) },
	hasIcon: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	hasClear: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	mode: { control: 'inline-radio', options: ['default', 'modal', 'sidebar'], table: propGroup(ARG_GROUP.behavior) },
	isInstant: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isRemote: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	debounceMs: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	isAutofocus: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<SearchArgs>['argTypes']
