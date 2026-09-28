import type { Meta } from '@storybook/vue3-vite'
import type BaseAccordion from '../ui/BaseAccordion.vue'
import { ACCORDION_VARIANTS } from '../types/BaseAccordion.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: ACCORDION_VARIANTS }),
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	isMultiple: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	default: { control: false },
} satisfies Meta<typeof BaseAccordion>['argTypes']
