import { fn } from 'storybook/test'
import { STORY_REGIONS } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseTreeSelect from '../ui/BaseTreeSelect.vue'

export const args = {
	modelValue: '',
	items: STORY_REGIONS,
	label: 'Город доставки',
	placeholder: 'Выберите город',
	variant: 'default',
	sizeScale: 100,
	isMultiple: false,
	checkedStrategy: 'child',
	isSearchable: false,
	isDefaultExpandAll: false,
	isLoading: false,
	isRequired: false,
	isDisabled: false,
	'onUpdate:modelValue': fn(),
	onChange: fn(),
	onToggle: fn(),
} satisfies Meta<typeof BaseTreeSelect>['args']
