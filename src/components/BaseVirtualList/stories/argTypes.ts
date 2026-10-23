import type { Meta } from '@storybook/vue3-vite'
import type { BaseVirtualListProps } from '../types/BaseVirtualList.types'
import { baseArgTypes, hiddenArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes(),
	...hiddenArgTypes('variant', 'color'),
	items: { control: false, table: propGroup(ARG_GROUP.content) },
	itemSize: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
	overscan: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	height: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
} satisfies Meta<BaseVirtualListProps<Record<string, unknown>>>['argTypes']
