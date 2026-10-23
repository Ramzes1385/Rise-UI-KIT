import { SEPARATORS } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseBreadcrumbs from '../ui/BaseBreadcrumbs.vue'
import { BREADCRUMBS_VARIANTS } from '../types/BaseBreadcrumbs.types'
import { baseArgTypes, propGroup, ARG_GROUP, hiddenArgTypes } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: BREADCRUMBS_VARIANTS }),
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	homeIcon: { control: 'text', table: propGroup(ARG_GROUP.content) },
	separator: { control: 'inline-radio', options: SEPARATORS, table: propGroup(ARG_GROUP.appearance) },
	showHome: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	maxItems: { control: { type: 'number', min: 0, max: 10 }, table: propGroup(ARG_GROUP.behavior) },
	...hiddenArgTypes('linkComponent'),
	item: { control: false },
	home: { control: false },
} satisfies Meta<typeof BaseBreadcrumbs>['argTypes']
