import type { Meta } from '@storybook/vue3-vite'
import type BaseSignaturePad from '../ui/BaseSignaturePad.vue'

export const args = {
	modelValue: [],
	label: 'Подпись клиента',
	width: 400,
	height: 160,
	lineWidth: 2.5,
	variant: 'default',
	isDisabled: false,
	sizeScale: 100,
} satisfies Meta<typeof BaseSignaturePad>['args']
