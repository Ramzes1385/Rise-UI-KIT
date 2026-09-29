import type { Meta } from '@storybook/vue3-vite'
import type BaseAiMessage from '../ui/BaseAiMessage.vue'
import { AI_MESSAGE_VARIANTS } from '../types/BaseAiMessage.types'
import { ARG_GROUP, baseArgTypes, propGroup, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: AI_MESSAGE_VARIANTS }),
	content: { control: 'text', table: propGroup(ARG_GROUP.content) },
	name: { control: 'text', table: propGroup(ARG_GROUP.content) },
	avatar: { control: 'text', table: propGroup(ARG_GROUP.content) },
	time: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isStreaming: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	hasCopy: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	default: slotArgType('Блоки перед ответом: рассуждение, вызовы инструментов'),
	actions: slotArgType('Свои действия под ответом'),
} satisfies Meta<typeof BaseAiMessage>['argTypes']
