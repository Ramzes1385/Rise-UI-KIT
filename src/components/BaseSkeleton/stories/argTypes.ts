import type { Meta } from '@storybook/vue3-vite'
import type BaseSkeleton from '../ui/BaseSkeleton.vue'
import { hiddenArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

const SKELETON_SHAPES = ['text', 'rect', 'circle'] as const

export const argTypes = {
	...hiddenArgTypes('variant', 'default'),
	shape: { control: 'inline-radio', options: SKELETON_SHAPES, table: propGroup(ARG_GROUP.appearance) },
	width: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	height: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	color: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	sizeScale: { control: { type: 'range', min: 50, max: 200, step: 12.5 }, table: propGroup(ARG_GROUP.appearance) },
	customClass: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
	isAnimated: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isPulse: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
} satisfies Meta<typeof BaseSkeleton>['argTypes']
