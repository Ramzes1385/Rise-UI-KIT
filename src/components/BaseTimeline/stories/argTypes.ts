import { ORDER } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseTimeline from '../ui/BaseTimeline.vue'
import { TIMELINE_VARIANTS } from '../types/BaseTimeline.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: TIMELINE_VARIANTS }),
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	currentId: { control: 'inline-radio', options: ORDER.map(item => item.id), table: propGroup(ARG_GROUP.state) },
	orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'], table: propGroup(ARG_GROUP.appearance) },
} satisfies Meta<typeof BaseTimeline>['argTypes']
