import { TECH_TAGS } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseTagGroup from '../ui/BaseTagGroup.vue'

export const args = {
	items: TECH_TAGS,
	modelValue: ['vue'],
	selectionMode: 'multiple',
	label: 'Технологии',
	isRemovable: false,
	isDisabled: false,
	tone: 'neutral',
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseTagGroup>['args']
