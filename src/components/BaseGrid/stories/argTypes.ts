import type BaseGrid from '../ui/BaseGrid.vue'
import type { Meta } from '@storybook/vue3-vite'
import { STACK_GAPS } from '@components/BaseStack'
import { ARG_GROUP, baseArgTypes, hiddenArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes(),
	...hiddenArgTypes('variant', 'color'),
	cols: { control: { type: 'number', min: 1, max: 12, step: 1 }, table: propGroup(ARG_GROUP.appearance) },
	gap: { control: 'inline-radio', options: STACK_GAPS, table: propGroup(ARG_GROUP.appearance) },
	rowGap: { control: 'inline-radio', options: [undefined, ...STACK_GAPS], table: propGroup(ARG_GROUP.appearance) },
	tag: { control: 'text', table: propGroup(ARG_GROUP.content) },
	ui: { control: false },
	default: { control: false },
} satisfies Meta<typeof BaseGrid>['argTypes']
