import { expect } from 'storybook/test'
import { SLOT_KEYS } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseBreadcrumbs.stories'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseBreadcrumbs from '../../../ui/BaseBreadcrumbs.vue'
import type { BreadcrumbItem } from '../../../types/BaseBreadcrumbs.types'

const LONG_ITEMS: BreadcrumbItem[] = [
	{ label: 'Главная', to: '/' },
	{ label: 'Отдел закупок и логистики центрального офиса', to: '/purchasing' },
	{ label: 'Договоры с поставщиками комплектующих на 2025 год', to: '/purchasing/contracts' },
	{ label: 'Дополнительное соглашение № 14 об изменении сроков поставки' },
]

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Длинные названия переносятся по словам, крошки не выходят за ширину контейнера (здесь — 360px).' } },
	},
	args: { items: LONG_ITEMS },
	render: args => ({
		components: { BaseBreadcrumbs },
		setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS) }),
		template: '<div class="story-narrow"><BaseBreadcrumbs v-bind="props" /></div>',
	}),
	play: async ({ canvas }) => {
		const nav = canvas.getByRole('navigation')
		await expect(nav.scrollWidth).toBeLessThanOrEqual(nav.clientWidth)
	},
}
