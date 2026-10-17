import type { Meta } from '@storybook/vue3-vite'
import type BaseFlowMap from '../ui/BaseFlowMap.vue'
import { FLOW_MAP_VARIANTS } from '../types/BaseFlowMap.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: FLOW_MAP_VARIANTS }),
	mode: { control: 'inline-radio', options: ['view', 'edit', 'review'], table: propGroup(ARG_GROUP.state) },
	height: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseFlowMap>['argTypes']
