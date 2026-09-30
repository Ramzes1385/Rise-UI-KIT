import type { Meta } from '@storybook/vue3-vite'
import type BaseImageCompare from '../ui/BaseImageCompare.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { IMAGE_COMPARE_VARIANTS } from '../types/BaseImageCompare.types'

export const argTypes = {
	...baseArgTypes({ variants: IMAGE_COMPARE_VARIANTS }),
	before: { control: 'text', table: propGroup(ARG_GROUP.content) },
	after: { control: 'text', table: propGroup(ARG_GROUP.content) },
	beforeAlt: { control: 'text', table: propGroup(ARG_GROUP.content) },
	afterAlt: { control: 'text', table: propGroup(ARG_GROUP.content) },
	beforeLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	afterLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	position: { control: { type: 'range', min: 0, max: 100 }, table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseImageCompare>['argTypes']
