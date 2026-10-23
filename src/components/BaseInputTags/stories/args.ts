import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseInputTags from '../ui/BaseInputTags.vue'

export const args = {
	modelValue: ['Vue', 'TypeScript'],
	label: 'Навыки',
	placeholder: 'Добавьте навык',
	isUnique: true,
	isAddOnBlur: true,
	isDisabled: false,
	isReadonly: false,
	isRequired: false,
	variant: 'default',
	sizeScale: 100,
	onAdd: fn(),
	onRemove: fn(),
} satisfies Meta<typeof BaseInputTags>['args']
