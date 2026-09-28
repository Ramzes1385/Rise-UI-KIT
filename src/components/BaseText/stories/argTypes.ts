import type BaseText from '../ui/BaseText.vue'
import type { Meta } from '@storybook/vue3-vite'
import { TEXT_WEIGHT } from '../model/textWeight'
import { TEXT_TAGS } from '../types/BaseText.types'
import { baseArgTypes, hiddenArgTypes, propGroup, ARG_GROUP, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes(),
	...hiddenArgTypes('variant'),
	tag: { control: 'select', options: TEXT_TAGS, table: propGroup(ARG_GROUP.content) },
	weight: { control: 'inline-radio', options: Object.values(TEXT_WEIGHT), table: propGroup(ARG_GROUP.appearance) },
	nowrap: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	truncate: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	maxLines: { control: { type: 'number', min: 1, max: 10 }, table: propGroup(ARG_GROUP.behavior) },
	default: slotArgType('Текст'),
} satisfies Meta<typeof BaseText>['argTypes']
