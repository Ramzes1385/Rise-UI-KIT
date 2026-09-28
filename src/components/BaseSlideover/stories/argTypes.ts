import type { Meta } from '@storybook/vue3-vite'
import type BaseSlideover from '../ui/BaseSlideover.vue'
import { baseArgTypes, hiddenArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes(),
	...hiddenArgTypes('variant'),
	title: { control: 'text', table: propGroup(ARG_GROUP.content) },
	side: { control: 'inline-radio', options: ['left', 'right'], table: propGroup(ARG_GROUP.appearance) },
	width: { control: { type: 'range', min: 50, max: 200, step: 10 }, table: propGroup(ARG_GROUP.appearance) },
	isFullWidth: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	hasOverlay: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	padding: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
	isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	closeOnOverlay: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	closeOnEscape: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isContained: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	container: { control: false, table: propGroup(ARG_GROUP.behavior) },
	default: { control: false },
	header: { control: false },
	footer: { control: false },
} satisfies Meta<typeof BaseSlideover>['argTypes']
