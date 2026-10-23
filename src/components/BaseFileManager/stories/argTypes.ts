import type { Meta } from '@storybook/vue3-vite'
import type BaseFileManager from '../ui/BaseFileManager.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { FILE_MANAGER_VARIANTS, FILE_MANAGER_VIEWS } from '../types/BaseFileManager.types'

export const argTypes = {
	...baseArgTypes({ variants: FILE_MANAGER_VARIANTS }),
	items: { control: false, table: propGroup(ARG_GROUP.content) },
	path: { control: false, table: propGroup(ARG_GROUP.state) },
	selected: { control: false, table: propGroup(ARG_GROUP.state) },
	view: { control: 'inline-radio', options: FILE_MANAGER_VIEWS, table: propGroup(ARG_GROUP.behavior) },
	sort: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
	query: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isReadonly: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	hasTree: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	rootLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	accept: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	maxSize: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	height: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
	ui: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
} satisfies Meta<typeof BaseFileManager>['argTypes']
