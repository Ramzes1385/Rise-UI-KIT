import { ORDERS } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type { BaseVirtualListProps } from '../types/BaseVirtualList.types'

export const args = {
	items: ORDERS,
	itemSize: 41,
	overscan: 5,
	height: 320,
	ariaLabel: 'Заказы',
	sizeScale: 100,
} satisfies Meta<BaseVirtualListProps<Record<string, unknown>>>['args']
