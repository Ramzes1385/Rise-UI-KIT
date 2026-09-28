import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseSplitButton from '../ui/BaseSplitButton.vue'
import type { DropdownMenuItems } from '@components/BaseDropdownMenu'

const ITEMS: DropdownMenuItems = [
	[{ label: 'Сохранить как черновик', icon: 'file' }, { label: 'Сохранить и закрыть' }],
	[{ label: 'Удалить черновик', icon: 'trash', isDanger: true }],
]

export const args = {
	label: 'Сохранить',
	items: ITEMS,
	isDisabled: false,
	isLoading: false,
	variant: 'default',
	sizeScale: 100,
	onClick: fn(),
	onSelect: fn(),
} satisfies Meta<typeof BaseSplitButton>['args']
