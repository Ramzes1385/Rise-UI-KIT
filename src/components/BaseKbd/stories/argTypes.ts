import type BaseKbd from '../ui/BaseKbd.vue'
import type { Meta } from '@storybook/vue3-vite'
import { KBD_VARIANTS } from '../types/BaseKbd.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: KBD_VARIANTS }),
	value: { control: 'text', table: propGroup(ARG_GROUP.content) },
	platform: { control: 'inline-radio', options: ['mac', 'other'], table: propGroup(ARG_GROUP.behavior) },
} satisfies Meta<typeof BaseKbd>['argTypes']
