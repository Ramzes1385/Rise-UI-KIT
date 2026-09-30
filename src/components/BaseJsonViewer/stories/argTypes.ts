import type { Meta } from '@storybook/vue3-vite'
import type BaseJsonViewer from '../ui/BaseJsonViewer.vue'
import { JSON_VIEWER_VARIANTS } from '../types/BaseJsonViewer.types'
import { ARG_GROUP, baseArgTypes, propGroup, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: JSON_VIEWER_VARIANTS }),
	value: { control: 'object', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	expandDepth: { control: { type: 'number', min: 0, max: 5 }, table: propGroup(ARG_GROUP.behavior) },
	hasToolbar: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	actions: slotArgType('Свои кнопки в панели над деревом'),
} satisfies Meta<typeof BaseJsonViewer>['argTypes']
