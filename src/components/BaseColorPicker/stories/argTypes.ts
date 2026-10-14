import type { Meta } from '@storybook/vue3-vite'
import { COLOR_FORMATS } from '@utils/data/colorUtils'
import { propGroup, ARG_GROUP } from '@/stories/helpers'
import type BaseColorPicker from '../ui/BaseColorPicker.vue'
import { COLOR_PICKER_POSITIONS, COLOR_PICKER_TRIGGER_VARIANTS } from '../types/BaseColorPicker.types'

export const argTypes = {
	modelValue: { control: 'color', table: propGroup(ARG_GROUP.content) },
	format: { control: 'inline-radio', options: COLOR_FORMATS, table: propGroup(ARG_GROUP.content) },
	formats: { control: 'check', options: COLOR_FORMATS, table: propGroup(ARG_GROUP.content) },
	palettes: { control: 'object', table: propGroup(ARG_GROUP.content) },
	recentColors: { control: 'object', table: propGroup(ARG_GROUP.content) },
	maxRecentColors: { control: { type: 'number', min: 0, max: 24 }, table: propGroup(ARG_GROUP.behavior) },
	hasAlpha: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isRecentHidden: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isEyeDropperHidden: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	presets: { control: 'object', table: propGroup(ARG_GROUP.content) },
	resetLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	position: { control: 'inline-radio', options: COLOR_PICKER_POSITIONS, table: propGroup(ARG_GROUP.appearance) },
	sizeScale: { control: { type: 'range', min: 50, max: 200, step: 12.5 }, table: propGroup(ARG_GROUP.appearance) },
	isHexHidden: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isPresetsHidden: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	hasTransparentSwatch: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	triggerVariant: { control: 'inline-radio', options: COLOR_PICKER_TRIGGER_VARIANTS, table: propGroup(ARG_GROUP.appearance) },
	hasIndicator: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	customClass: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
	isResettable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	variant: { table: { disable: true } },
	color: { table: { disable: true } },
} satisfies Meta<typeof BaseColorPicker>['argTypes']
