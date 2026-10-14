import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseColorPicker from '../ui/BaseColorPicker.vue'

export const args = {
	modelValue: '#f97316',
	format: 'hex',
	hasAlpha: false,
	position: 'bottom',
	sizeScale: 100,
	isHexHidden: false,
	isPresetsHidden: false,
	isResettable: false,
	hasTransparentSwatch: false,
	triggerVariant: 'swatch',
	hasIndicator: false,
	isDisabled: false,
	'onUpdate:modelValue': fn(),
	onChange: fn(),
	onReset: fn(),
	'onUpdate:recentColors': fn(),
} satisfies Meta<typeof BaseColorPicker>['args']
