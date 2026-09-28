import type { Meta } from '@storybook/vue3-vite'
import type BaseButtonGroup from '../ui/BaseButtonGroup.vue'
import { BUTTON_GROUP_VARIANTS } from '../types/BaseButtonGroup.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: BUTTON_GROUP_VARIANTS }),
	orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'], table: propGroup(ARG_GROUP.appearance) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
} satisfies Meta<typeof BaseButtonGroup>['argTypes']
