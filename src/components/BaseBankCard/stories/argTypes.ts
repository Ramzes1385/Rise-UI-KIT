import type { Meta } from '@storybook/vue3-vite'
import type BaseBankCard from '../ui/BaseBankCard.vue'
import { BANK_CARD_VARIANTS } from '../types/BaseBankCard.types'
import { ARG_GROUP, baseArgTypes, propGroup, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: BANK_CARD_VARIANTS }),
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	default: slotArgType('Содержимое (заменяет label)'),
} satisfies Meta<typeof BaseBankCard>['argTypes']
