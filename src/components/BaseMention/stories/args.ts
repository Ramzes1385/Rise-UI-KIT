import { TEAM } from './shared'
import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseMention from '../ui/BaseMention.vue'

export const args = {
	modelValue: '',
	options: TEAM,
	trigger: '@',
	maxSuggestions: 8,
	label: 'Комментарий',
	placeholder: 'Напишите комментарий, @ — упомянуть коллегу',
	rows: 3,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
	onMention: fn(),
	onSearch: fn(),
} satisfies Meta<typeof BaseMention>['args']
