import type { Meta } from '@storybook/vue3-vite'
import type BaseScrollArea from '../ui/BaseScrollArea.vue'
import { baseArgTypes, hiddenArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes(),
	...hiddenArgTypes('variant', 'color'),
	orientation: { control: 'inline-radio', options: ['vertical', 'horizontal', 'both'], table: propGroup(ARG_GROUP.appearance) },
	maxHeight: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
	scrollbar: { control: 'inline-radio', options: ['hover', 'always'], table: propGroup(ARG_GROUP.appearance) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	ui: { control: false },
} satisfies Meta<typeof BaseScrollArea>['argTypes']
