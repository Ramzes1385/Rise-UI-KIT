import type { Meta } from '@storybook/vue3-vite'
import type BaseWatermark from '../ui/BaseWatermark.vue'
import { ARG_GROUP, hiddenArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	content: { control: 'object', table: propGroup(ARG_GROUP.content) },
	image: { control: 'text', table: propGroup(ARG_GROUP.content) },
	width: { control: { type: 'number', min: 20, max: 400 }, table: propGroup(ARG_GROUP.appearance) },
	height: { control: { type: 'number', min: 20, max: 400 }, table: propGroup(ARG_GROUP.appearance) },
	rotate: { control: { type: 'range', min: -90, max: 90, step: 1 }, table: propGroup(ARG_GROUP.appearance) },
	gap: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
	opacity: { control: { type: 'range', min: 0, max: 1, step: 0.05 }, table: propGroup(ARG_GROUP.appearance) },
	zIndex: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
	fontSize: { control: { type: 'number', min: 8, max: 64 }, table: propGroup(ARG_GROUP.appearance) },
	textColor: { control: 'color', table: propGroup(ARG_GROUP.appearance) },
	isProtected: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	customClass: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
	ui: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
	...hiddenArgTypes('default'),
} satisfies Meta<typeof BaseWatermark>['argTypes']
