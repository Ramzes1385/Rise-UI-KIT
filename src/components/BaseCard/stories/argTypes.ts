import type BaseCard from '../ui/BaseCard.vue'
import type { Meta } from '@storybook/vue3-vite'
import { CARD_VARIANTS } from '../types/BaseCard.types'
import { baseArgTypes, propGroup, ARG_GROUP, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: CARD_VARIANTS }),
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	title: { control: 'text', table: propGroup(ARG_GROUP.content) },
	subtitle: { control: 'text', table: propGroup(ARG_GROUP.content) },
	padding: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
	height: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	scroll: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isHoverable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	default: slotArgType('Содержимое карточки'),
	header: { control: false },
	actions: { control: false },
	footer: { control: false },
} satisfies Meta<typeof BaseCard>['argTypes']
