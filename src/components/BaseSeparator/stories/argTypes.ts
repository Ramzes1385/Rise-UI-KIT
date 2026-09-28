import type { Meta } from '@storybook/vue3-vite'
import type BaseSeparator from '../ui/BaseSeparator.vue'
import { baseArgTypes, hiddenArgTypes, propGroup, ARG_GROUP, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes(),
	...hiddenArgTypes('variant'),
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'], table: propGroup(ARG_GROUP.appearance) },
	isDashed: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	thickness: { control: { type: 'range', min: 1, max: 8, step: 1 }, table: propGroup(ARG_GROUP.appearance) },
	spacing: { control: { type: 'range', min: 0, max: 24, step: 2 }, table: propGroup(ARG_GROUP.appearance) },
	default: slotArgType('Содержимое между линиями вместо label'),
} satisfies Meta<typeof BaseSeparator>['argTypes']
