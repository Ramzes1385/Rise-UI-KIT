import type { Meta } from '@storybook/vue3-vite'
import type BaseToolCall from '../ui/BaseToolCall.vue'
import { ARG_GROUP, baseArgTypes, propGroup, slotArgType } from '@/stories/helpers'
import { TOOL_CALL_STATUSES, TOOL_CALL_VARIANTS } from '../types/BaseToolCall.types'

export const argTypes = {
	...baseArgTypes({ variants: TOOL_CALL_VARIANTS }),
	name: { control: 'text', table: propGroup(ARG_GROUP.content) },
	title: { control: 'text', table: propGroup(ARG_GROUP.content) },
	args: { control: 'object', table: propGroup(ARG_GROUP.content) },
	result: { control: 'object', table: propGroup(ARG_GROUP.content) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	status: { control: 'inline-radio', options: TOOL_CALL_STATUSES, table: propGroup(ARG_GROUP.state) },
	isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	output: slotArgType('Своя разметка результата: { result }'),
	default: slotArgType('Содержимое под результатом: кнопки подтверждения для pending'),
} satisfies Meta<typeof BaseToolCall>['argTypes']
