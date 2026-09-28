import type { Meta } from '@storybook/vue3-vite'
import { propGroup, ARG_GROUP } from '@/stories/helpers'
import type BaseColorPicker from '../ui/BaseColorPicker.vue'
import { COLOR_PICKER_POSITIONS } from '../types/BaseColorPicker.types'

export const argTypes = {
	modelValue: { control: 'color', table: propGroup(ARG_GROUP.content) },
	presets: { control: 'object', table: propGroup(ARG_GROUP.content) },
	resetLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	position: { control: 'inline-radio', options: COLOR_PICKER_POSITIONS, table: propGroup(ARG_GROUP.appearance) },
	sizeScale: { control: { type: 'range', min: 50, max: 200, step: 12.5 }, table: propGroup(ARG_GROUP.appearance) },
	isHexHidden: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isPresetsHidden: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	hasTransparentSwatch: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	customClass: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
	isResettable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	variant: { table: { disable: true } },
	color: { table: { disable: true } },
} satisfies Meta<typeof BaseColorPicker>['argTypes']
