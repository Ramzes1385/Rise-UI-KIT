import type { Meta } from '@storybook/vue3-vite'
import type BaseQrCode from '../ui/BaseQrCode.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { QR_CODE_VARIANTS, QR_ERROR_LEVELS } from '../types/BaseQrCode.types'

export const argTypes = {
	...baseArgTypes({ variants: QR_CODE_VARIANTS }),
	value: { control: 'text', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	errorCorrection: { control: 'inline-radio', options: QR_ERROR_LEVELS, table: propGroup(ARG_GROUP.behavior) },
	size: { control: { type: 'number', min: 64, max: 400, step: 8 }, table: propGroup(ARG_GROUP.appearance) },
	margin: { control: { type: 'number', min: 0, max: 8 }, table: propGroup(ARG_GROUP.appearance) },
	moduleColor: { control: 'color', table: propGroup(ARG_GROUP.appearance) },
	backgroundColor: { control: 'color', table: propGroup(ARG_GROUP.appearance) },
} satisfies Meta<typeof BaseQrCode>['argTypes']
