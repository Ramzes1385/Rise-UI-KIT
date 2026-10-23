import type { ListStoryArgs } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import { LIST_SELECTION_MODES, LIST_VARIANTS } from '../types/BaseList.types'
import { ARG_GROUP, baseArgTypes, propGroup, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: LIST_VARIANTS }),
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	modelValue: { control: 'object', table: propGroup(ARG_GROUP.state) },
	selectionMode: { control: 'inline-radio', options: LIST_SELECTION_MODES, table: propGroup(ARG_GROUP.behavior) },
	isSortable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	canMove: { control: false, table: propGroup(ARG_GROUP.behavior) },
	filter: { control: false, table: propGroup(ARG_GROUP.behavior) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	emptyText: { control: 'text', table: propGroup(ARG_GROUP.content) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isVirtual: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	itemSize: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	height: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	overscan: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	item: slotArgType('Всё содержимое строки: { item, index, isSelected, isDragging }'),
	prefix: slotArgType('Левая часть строки вместо значка или аватара: { item, index, isSelected, isDragging }'),
	actions: slotArgType('Кнопки справа, только в режиме none: { item, index, isSelected, isDragging }'),
	empty: slotArgType('Пустой список'),
} satisfies Meta<ListStoryArgs>['argTypes']
