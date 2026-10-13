import type { Meta } from '@storybook/vue3-vite'
import type BaseBanner from '../ui/BaseBanner.vue'
import { ARG_GROUP, baseArgTypes, propGroup, slotArgType } from '@/stories/helpers'
import { BANNER_POSITIONS, BANNER_TYPES, BANNER_VARIANTS } from '../types/BaseBanner.types'

export const argTypes = {
	...baseArgTypes({ variants: BANNER_VARIANTS }),
	type: { control: 'inline-radio', options: BANNER_TYPES, table: propGroup(ARG_GROUP.appearance) },
	position: { control: 'inline-radio', options: BANNER_POSITIONS, table: propGroup(ARG_GROUP.appearance) },
	text: { control: 'text', table: propGroup(ARG_GROUP.content) },
	icon: { control: 'text', table: propGroup(ARG_GROUP.content) },
	hasIcon: { control: 'boolean', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	isClosable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isLive: { control: 'boolean', table: propGroup(ARG_GROUP.a11y) },
	isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	storageKey: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	default: slotArgType('Текст объявления (заменяет text)'),
	action: { control: false },
} satisfies Meta<typeof BaseBanner>['argTypes']
