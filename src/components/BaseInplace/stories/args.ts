import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseInplace from '../ui/BaseInplace.vue'

export const args = {
	modelValue: 'Редизайн личного кабинета',
	label: 'Название проекта',
	placeholder: 'Без названия',
	isSaveOnBlur: true,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
	onSave: fn(),
	onCancel: fn(),
} satisfies Meta<typeof BaseInplace>['args']
