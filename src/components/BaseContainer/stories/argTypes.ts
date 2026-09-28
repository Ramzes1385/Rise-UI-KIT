import type { Meta } from '@storybook/vue3-vite'
import type BaseContainer from '../ui/BaseContainer.vue'
import { CONTAINER_SIZES } from '../types/BaseContainer.types'
import { baseArgTypes, hiddenArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes(),
	...hiddenArgTypes('variant', 'color'),
	size: { control: 'inline-radio', options: CONTAINER_SIZES, table: propGroup(ARG_GROUP.appearance) },
	tag: { control: 'text', table: propGroup(ARG_GROUP.content) },
} satisfies Meta<typeof BaseContainer>['argTypes']
