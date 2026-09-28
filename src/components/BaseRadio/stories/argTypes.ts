import { DELIVERY_OPTIONS } from './shared'
import type BaseRadio from '../ui/BaseRadio.vue'
import type { Meta } from '@storybook/vue3-vite'
import { RADIO_VARIANTS } from '../types/BaseRadio.types'
import { baseArgTypes, propGroup, ARG_GROUP, hiddenArgTypes } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: RADIO_VARIANTS }),
	modelValue: { control: 'inline-radio', options: DELIVERY_OPTIONS.map(option => option.value), table: propGroup(ARG_GROUP.content) },
	options: { control: 'object', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isVertical: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	name: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	option: { control: false },
	...hiddenArgTypes('default'),
} satisfies Meta<typeof BaseRadio>['argTypes']
