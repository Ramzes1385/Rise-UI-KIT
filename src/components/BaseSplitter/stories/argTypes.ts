import type { Meta } from '@storybook/vue3-vite'
import type BaseSplitter from '../ui/BaseSplitter.vue'
import { SPLITTER_VARIANTS } from '../types/BaseSplitter.types'
import { baseArgTypes, hiddenArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: SPLITTER_VARIANTS }),
	...hiddenArgTypes('color'),
	modelValue: { control: { type: 'range', min: 0, max: 100 }, table: propGroup(ARG_GROUP.state) },
	orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'], table: propGroup(ARG_GROUP.appearance) },
	min: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	max: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	step: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	sizes: { control: false, table: propGroup(ARG_GROUP.state) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	paneLabels: { control: false, table: propGroup(ARG_GROUP.content) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	ui: { control: false },
} satisfies Meta<typeof BaseSplitter>['argTypes']
