import type { Meta } from '@storybook/vue3-vite'
import type BaseBankCard from '../ui/BaseBankCard.vue'
import { CARD_BRAND_IDS } from '@utils/form/cardUtils'
import { BANK_CARD_VARIANTS } from '../types/BaseBankCard.types'
import { ARG_GROUP, baseArgTypes, propGroup, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: BANK_CARD_VARIANTS }),
	brand: { control: 'select', options: CARD_BRAND_IDS, table: propGroup(ARG_GROUP.content) },
	last4: { control: 'text', table: propGroup(ARG_GROUP.content) },
	expiry: { control: 'text', table: propGroup(ARG_GROUP.content) },
	holder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	brandIcons: { control: false, table: propGroup(ARG_GROUP.content) },
	isCompact: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	background: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	isExpired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	default: slotArgType('Содержимое (заменяет label)'),
} satisfies Meta<typeof BaseBankCard>['argTypes']
