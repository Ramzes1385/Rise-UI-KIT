import type { Meta } from '@storybook/vue3-vite'
import type BaseDescriptions from '../ui/BaseDescriptions.vue'
import { ARG_GROUP, baseArgTypes, propGroup, slotArgType } from '@/stories/helpers'
import { DESCRIPTIONS_LAYOUTS, DESCRIPTIONS_VARIANTS } from '../types/BaseDescriptions.types'

export const argTypes = {
	...baseArgTypes({ variants: DESCRIPTIONS_VARIANTS }),
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	title: { control: 'text', table: propGroup(ARG_GROUP.content) },
	emptyValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
	emptyText: { control: 'text', table: propGroup(ARG_GROUP.content) },
	columns: { control: { type: 'number', min: 1, max: 6 }, table: propGroup(ARG_GROUP.appearance) },
	minItemWidth: { control: { type: 'number', min: 0, max: 600, step: 20 }, table: propGroup(ARG_GROUP.appearance) },
	layout: { control: 'inline-radio', options: DESCRIPTIONS_LAYOUTS, table: propGroup(ARG_GROUP.appearance) },
	labelWidth: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	isCopyable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	extra: slotArgType('Действия справа от заголовка'),
	empty: slotArgType('Содержимое, когда полей нет'),
} satisfies Meta<typeof BaseDescriptions>['argTypes']
