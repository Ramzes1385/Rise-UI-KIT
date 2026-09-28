import type { Meta } from '@storybook/vue3-vite'
import type BaseToolbar from '../ui/BaseToolbar.vue'
import { TOOLBAR_VARIANTS } from '../types/BaseToolbar.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: TOOLBAR_VARIANTS }),
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'], table: propGroup(ARG_GROUP.appearance) },
} satisfies Meta<typeof BaseToolbar>['argTypes']
