import { SECTIONS, shell } from './shared'
import BaseLayout from '../ui/BaseLayout.vue'
import { BaseLink } from '@components/BaseLink'
import type { Meta } from '@storybook/vue3-vite'
import { BaseFooter } from '@components/BaseFooter'
import { BaseHeader } from '@components/BaseHeader'
import { useArgsWithoutSlots } from '@/stories/helpers'

const ORDERS = Array.from({ length: 12 }, (_, index) => `Заказ № ${1040 + index} — ${index % 3 === 0 ? 'ждёт оплаты' : 'собран'}`)

export const render = (args => ({
	components: { BaseLayout, BaseHeader, BaseFooter, BaseLink },
	setup: () => ({ props: useArgsWithoutSlots(args), sections: SECTIONS, orders: ORDERS }),
	template: shell(`
			<h1 style="margin-top: 0">Заказы</h1>
			<p v-for="order in orders" :key="order">{{ order }}</p>
		`),
})) satisfies Meta<typeof BaseLayout>['render']
