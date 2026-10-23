import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BasePagination from '../ui/BasePagination.vue'

export const args = {
	modelValue: 1,
	total: 120,
	pageSize: 10,
	maxVisible: 7,
	showLastPage: true,
	variant: 'default',
	sizeScale: 100,
	'onUpdate:modelValue': fn(),
	onChange: fn(),
} satisfies Meta<typeof BasePagination>['args']
