import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import { SAMPLE_FILTER, TASK_FIELDS } from './shared'
import type BaseFilterBuilder from '../ui/BaseFilterBuilder.vue'

export const args = {
	fields: TASK_FIELDS,
	modelValue: SAMPLE_FILTER,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
	'onUpdate:modelValue': fn(),
} satisfies Meta<typeof BaseFilterBuilder>['args']
