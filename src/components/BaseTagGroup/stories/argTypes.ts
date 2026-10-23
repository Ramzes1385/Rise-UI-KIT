import type { Meta } from '@storybook/vue3-vite'
import type BaseTagGroup from '../ui/BaseTagGroup.vue'
import { TAG_GROUP_SELECTION_MODES } from '../types/BaseTagGroup.types'
import { TAG_TONES, TAG_VARIANTS } from '@components/BaseTag/types/BaseTag.types'
import { ARG_GROUP, baseArgTypes, propGroup, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: TAG_VARIANTS }),
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	modelValue: { control: 'object', table: propGroup(ARG_GROUP.state) },
	label: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	selectionMode: { control: 'inline-radio', options: TAG_GROUP_SELECTION_MODES, table: propGroup(ARG_GROUP.behavior) },
	isRemovable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	tone: { control: 'select', options: TAG_TONES, table: propGroup(ARG_GROUP.appearance) },
	tag: slotArgType('Содержимое метки: `{ item, isSelected }`'),
} satisfies Meta<typeof BaseTagGroup>['argTypes']
