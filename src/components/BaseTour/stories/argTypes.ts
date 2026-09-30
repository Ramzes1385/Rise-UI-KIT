import type BaseTour from '../ui/BaseTour.vue'
import type { Meta } from '@storybook/vue3-vite'
import { TOUR_PLACEMENTS } from '../types/BaseTour.types'
import { hiddenArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...hiddenArgTypes('variant', 'sizeScale', 'color'),
	steps: { control: 'object', table: propGroup(ARG_GROUP.content) },
	labels: { control: 'object', table: propGroup(ARG_GROUP.content) },
	placement: { control: 'inline-radio', options: TOUR_PLACEMENTS, table: propGroup(ARG_GROUP.appearance) },
	gap: { control: { type: 'number', min: 0, max: 40 }, table: propGroup(ARG_GROUP.appearance) },
	padding: { control: { type: 'number', min: 0, max: 40 }, table: propGroup(ARG_GROUP.appearance) },
	radius: { control: { type: 'number', min: 0, max: 40 }, table: propGroup(ARG_GROUP.appearance) },
	showProgress: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	showArrow: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	showSkip: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	customClass: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
	isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	step: { control: { type: 'number', min: 0 }, table: propGroup(ARG_GROUP.state) },
	behavior: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
	default: { control: false },
	title: { control: false },
	content: { control: false },
} satisfies Meta<typeof BaseTour>['argTypes']
