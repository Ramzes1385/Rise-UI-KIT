import { STORY_REGIONS } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseTreeSelect from '../ui/BaseTreeSelect.vue'

export const args = {
	modelValue: '',
	items: STORY_REGIONS,
	label: 'Город',
	placeholder: 'Выберите город',
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseTreeSelect>['args']
