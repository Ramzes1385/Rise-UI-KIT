import type BaseAffix from '../ui/BaseAffix.vue'
import type { Meta } from '@storybook/vue3-vite'
import { ARG_GROUP, baseArgTypes, hiddenArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes(),
	...hiddenArgTypes('variant', 'color'),
	offsetTop: { control: { type: 'number', min: 0, step: 4 }, table: propGroup(ARG_GROUP.behavior) },
	offsetBottom: { control: { type: 'number', min: 0, step: 4 }, table: propGroup(ARG_GROUP.behavior) },
	target: { control: false, table: propGroup(ARG_GROUP.behavior) },
	hasShadow: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	ui: { control: false },
	default: { control: false },
} satisfies Meta<typeof BaseAffix>['argTypes']
