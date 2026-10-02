import type { Meta } from '@storybook/vue3-vite'
import type BaseBankCard from '../ui/BaseBankCard.vue'

export const args = {
	brand: 'visa',
	last4: '4242',
	expiry: '12/30',
	holder: 'IVAN IVANOV',
	label: 'Основная',
	isCompact: false,
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseBankCard>['args']
