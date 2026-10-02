import type { Meta } from '@storybook/vue3-vite'
import type BaseAnchor from '../ui/BaseAnchor.vue'
import { ANCHOR_VARIANTS } from '../types/BaseAnchor.types'
import { ARG_GROUP, baseArgTypes, propGroup, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: ANCHOR_VARIANTS }),
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	item: slotArgType('Содержимое ссылки пункта'),
} satisfies Meta<typeof BaseAnchor>['argTypes']
