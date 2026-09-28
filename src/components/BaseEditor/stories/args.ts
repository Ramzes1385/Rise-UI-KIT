import { fn } from 'storybook/test'
import { NOTE_HTML } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseEditor from '../ui/BaseEditor.vue'

export const args = {
	modelValue: NOTE_HTML,
	placeholder: 'Начните писать…',
	variant: 'default',
	sizeScale: 100,
	hasToolbar: true,
	isReadonly: false,
	isAutofocus: false,
	'onUpdate:modelValue': fn(),
	onFocus: fn(),
	onBlur: fn(),
} satisfies Meta<typeof BaseEditor>['args']
