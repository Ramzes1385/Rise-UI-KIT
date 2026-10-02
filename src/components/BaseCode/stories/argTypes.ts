import type BaseCode from '../ui/BaseCode.vue'
import type { Meta } from '@storybook/vue3-vite'
import { CODE_VARIANTS } from '../types/BaseCode.types'
import { CODE_LANGUAGES } from '@utils/data/codeHighlightUtils'
import { ARG_GROUP, baseArgTypes, propGroup, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: CODE_VARIANTS }),
	code: { control: 'text', table: propGroup(ARG_GROUP.content) },
	language: { control: 'select', options: [...CODE_LANGUAGES, 'text'], table: propGroup(ARG_GROUP.content) },
	title: { control: 'text', table: propGroup(ARG_GROUP.content) },
	hasLineNumbers: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	startLine: { control: { type: 'number', min: 1 }, table: propGroup(ARG_GROUP.appearance) },
	highlightLines: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
	hasCopyButton: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	hasHeader: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isWrapped: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	maxHeight: { control: { type: 'number', min: 0, step: 20 }, table: propGroup(ARG_GROUP.appearance) },
	label: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	header: slotArgType('Название в заголовке вместо `title` и названия языка; кнопки остаются'),
	actions: slotArgType('Свои кнопки в заголовке перед «Копировать»'),
} satisfies Meta<typeof BaseCode>['argTypes']
