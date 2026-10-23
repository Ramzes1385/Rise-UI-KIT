import type { Meta } from '@storybook/vue3-vite'
import type BaseFormField from '../ui/BaseFormField.vue'

export const args = {
	label: 'Код из СМС',
	description: 'Отправили на +7 916 ***-45-67',
	error: '',
	isRequired: false,
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseFormField>['args']
