import type { Meta } from '@storybook/vue3-vite'
import type BaseSignaturePad from '../ui/BaseSignaturePad.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { SIGNATURE_PAD_VARIANTS } from '../types/BaseSignaturePad.types'

export const argTypes = {
	...baseArgTypes({ variants: SIGNATURE_PAD_VARIANTS }),
	modelValue: { control: 'object', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	width: { control: { type: 'number', min: 200, max: 800, step: 20 }, table: propGroup(ARG_GROUP.appearance) },
	height: { control: { type: 'number', min: 80, max: 400, step: 10 }, table: propGroup(ARG_GROUP.appearance) },
	penColor: { control: 'color', table: propGroup(ARG_GROUP.appearance) },
	lineWidth: { control: { type: 'number', min: 1, max: 8, step: 0.5 }, table: propGroup(ARG_GROUP.appearance) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseSignaturePad>['argTypes']
