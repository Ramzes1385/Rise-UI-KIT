import type BaseAlert from '../ui/BaseAlert.vue'
import type { Meta } from '@storybook/vue3-vite'
import { ALERT_VARIANTS, ALERT_TYPES } from '../types/BaseAlert.types'
import { baseArgTypes, propGroup, ARG_GROUP, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: ALERT_VARIANTS }),
	type: { control: 'inline-radio', options: ALERT_TYPES, table: propGroup(ARG_GROUP.appearance) },
	title: { control: 'text', table: propGroup(ARG_GROUP.content) },
	description: { control: 'text', table: propGroup(ARG_GROUP.content) },
	icon: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isClosable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	default: slotArgType('Описание (заменяет description)'),
	actions: { control: false },
} satisfies Meta<typeof BaseAlert>['argTypes']
