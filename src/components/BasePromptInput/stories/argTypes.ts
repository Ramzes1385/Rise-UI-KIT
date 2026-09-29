import type { Meta } from '@storybook/vue3-vite'
import type BasePromptInput from '../ui/BasePromptInput.vue'
import { PROMPT_INPUT_VARIANTS } from '../types/BasePromptInput.types'
import { ARG_GROUP, baseArgTypes, propGroup, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: PROMPT_INPUT_VARIANTS }),
	modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	name: { control: 'text', table: propGroup(ARG_GROUP.content) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isGenerating: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	rows: { control: { type: 'number', min: 1 }, table: propGroup(ARG_GROUP.behavior) },
	maxRows: { control: { type: 'number', min: 1 }, table: propGroup(ARG_GROUP.behavior) },
	maxlength: { control: { type: 'number', min: 1 }, table: propGroup(ARG_GROUP.behavior) },
	start: slotArgType('Панель слева: вложения, выбор модели'),
	end: slotArgType('Панель справа перед кнопкой отправки'),
} satisfies Meta<typeof BasePromptInput>['argTypes']
