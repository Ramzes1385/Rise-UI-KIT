import type BaseCode from '../ui/BaseCode.vue'
import type { Meta } from '@storybook/vue3-vite'
import { CODE_VARIANTS } from '../types/BaseCode.types'
import { ARG_GROUP, baseArgTypes, propGroup, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: CODE_VARIANTS }),
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	default: slotArgType('Содержимое (заменяет label)'),
} satisfies Meta<typeof BaseCode>['argTypes']
