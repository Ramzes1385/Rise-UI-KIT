import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseColorPicker from '../ui/BaseColorPicker.vue'

export const args = {
	modelValue: '#f97316',
	position: 'bottom',
	sizeScale: 100,
	isHexHidden: false,
	isPresetsHidden: false,
	isResettable: false,
	hasTransparentSwatch: false,
	isDisabled: false,
	'onUpdate:modelValue': fn(),
	onChange: fn(),
	onReset: fn(),
} satisfies Meta<typeof BaseColorPicker>['args']
