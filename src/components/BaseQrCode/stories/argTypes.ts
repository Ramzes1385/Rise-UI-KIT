import type { Meta } from '@storybook/vue3-vite'
import type BaseQrCode from '../ui/BaseQrCode.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { QR_CODE_VARIANTS, QR_ERROR_LEVELS, QR_FINDER_SHAPES, QR_MODULE_SHAPES } from '../types/BaseQrCode.types'

export const argTypes = {
	...baseArgTypes({ variants: QR_CODE_VARIANTS }),
	value: { control: 'text', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	errorCorrection: { control: 'inline-radio', options: QR_ERROR_LEVELS, table: propGroup(ARG_GROUP.behavior) },
	size: { control: { type: 'number', min: 64, max: 400, step: 8 }, table: propGroup(ARG_GROUP.appearance) },
	margin: { control: { type: 'number', min: 0, max: 8 }, table: propGroup(ARG_GROUP.appearance) },
	moduleColor: { control: 'color', table: propGroup(ARG_GROUP.appearance) },
	backgroundColor: { control: 'color', table: propGroup(ARG_GROUP.appearance) },
	moduleShape: { control: 'inline-radio', options: QR_MODULE_SHAPES, table: propGroup(ARG_GROUP.appearance) },
	finderShape: { control: 'inline-radio', options: QR_FINDER_SHAPES, table: propGroup(ARG_GROUP.appearance) },
	finderColor: { control: 'color', table: propGroup(ARG_GROUP.appearance) },
	logo: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isConcealed: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	revealTimeout: { control: { type: 'number', min: 0, step: 1000 }, table: propGroup(ARG_GROUP.behavior) },
	showValue: { control: 'select', options: [false, true, 'host'], table: propGroup(ARG_GROUP.content) },
	logoSize: { control: { type: 'range', min: 0.1, max: 0.3, step: 0.02 }, table: propGroup(ARG_GROUP.appearance) },
} satisfies Meta<typeof BaseQrCode>['argTypes']
