import type BaseMenu from '../ui/BaseMenu.vue'
import type { Meta } from '@storybook/vue3-vite'
import { MENU_VARIANTS } from '../types/BaseMenu.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: MENU_VARIANTS }),
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
} satisfies Meta<typeof BaseMenu>['argTypes']
