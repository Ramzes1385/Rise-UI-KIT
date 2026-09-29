import type { Meta } from '@storybook/vue3-vite'
import type BaseKanban from '../ui/BaseKanban.vue'
import { KANBAN_VARIANTS } from '../types/BaseKanban.types'
import { ARG_GROUP, baseArgTypes, propGroup, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: KANBAN_VARIANTS }),
	columns: { control: 'object', table: propGroup(ARG_GROUP.content) },
	cards: { control: 'object', table: propGroup(ARG_GROUP.content) },
	canMove: { control: false, table: propGroup(ARG_GROUP.behavior) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	card: slotArgType('Содержимое карточки: { card, isDragging }'),
	'column-footer': slotArgType('Низ колонки: { column, cards }'),
} satisfies Meta<typeof BaseKanban>['argTypes']
