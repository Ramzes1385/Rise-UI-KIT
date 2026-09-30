import type { Meta } from '@storybook/vue3-vite'
import type BaseFooter from '../ui/BaseFooter.vue'
import { FOOTER_VARIANTS } from '../types/BaseFooter.types'
import { CONTAINER_SIZES } from '@components/BaseContainer'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: FOOTER_VARIANTS }),
	containerSize: { control: 'inline-radio', options: CONTAINER_SIZES, table: propGroup(ARG_GROUP.appearance) },
	isCompact: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	columns: { control: 'object', table: propGroup(ARG_GROUP.content) },
} satisfies Meta<typeof BaseFooter>['argTypes']
