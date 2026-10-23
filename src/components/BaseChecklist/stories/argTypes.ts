import type { Meta } from '@storybook/vue3-vite'
import type BaseChecklist from '../ui/BaseChecklist.vue'
import { CHECKLIST_VARIANTS } from '../types/BaseChecklist.types'
import { ARG_GROUP, baseArgTypes, propGroup, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: CHECKLIST_VARIANTS }),
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	completed: { control: 'object', table: propGroup(ARG_GROUP.state) },
	title: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	done: slotArgType('Все шаги выполнены: вместо «Всё готово»'),
} satisfies Meta<typeof BaseChecklist>['argTypes']
