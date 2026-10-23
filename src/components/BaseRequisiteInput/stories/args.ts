import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseRequisiteInput from '../ui/BaseRequisiteInput.vue'

export const args = {
	kind: 'inn',
	modelValue: '',
	bik: '',
	isRequired: false,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
	onValidate: fn(),
} satisfies Meta<typeof BaseRequisiteInput>['args']
