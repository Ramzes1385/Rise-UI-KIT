import type { Meta } from '@storybook/vue3-vite'
import type BaseMarquee from '../ui/BaseMarquee.vue'
import { MARQUEE_VARIANTS } from '../types/BaseMarquee.types'
import { ARG_GROUP, baseArgTypes, propGroup, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: MARQUEE_VARIANTS }),
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	default: slotArgType('Содержимое (заменяет label)'),
} satisfies Meta<typeof BaseMarquee>['argTypes']
