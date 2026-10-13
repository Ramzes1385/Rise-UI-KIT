import type BaseLink from '../ui/BaseLink.vue'
import type { Meta } from '@storybook/vue3-vite'
import { LINK_VARIANTS } from '../types/BaseLink.types'
import { baseArgTypes, hiddenArgTypes, propGroup, ARG_GROUP, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: LINK_VARIANTS }),
	...hiddenArgTypes('linkComponent'),
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	to: { control: 'text', table: propGroup(ARG_GROUP.content) },
	href: { control: 'text', table: propGroup(ARG_GROUP.content) },
	target: { control: 'inline-radio', options: ['_self', '_blank'], table: propGroup(ARG_GROUP.behavior) },
	rel: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	hasExternalIcon: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	default: slotArgType('Содержимое (заменяет label)'),
} satisfies Meta<typeof BaseLink>['argTypes']
