import { expect } from 'storybook/test'
import type meta from '../BaseTabs.stories'
import BaseTabs from '../../ui/BaseTabs.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import type { TabItem } from '../../types/BaseTabs.types'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

const MANY_TABS: TabItem[] = [
	{ id: 'overview', label: 'Обзор' },
	{ id: 'specs', label: 'Характеристики' },
	{ id: 'reviews', label: 'Отзывы' },
	{ id: 'delivery', label: 'Доставка' },
	{ id: 'payment', label: 'Оплата' },
	{ id: 'warranty', label: 'Гарантия' },
	{ id: 'similar', label: 'Похожие товары' },
	{ id: 'questions', label: 'Вопросы и ответы' },
]

export const Scrollable: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`isScrollable`: при переполнении по краям появляются кнопки прокрутки, список можно тянуть мышью',
					'(перетаскивание не переключает вкладку).',
				].join('\n'),
			},
		},
	},
	args: { items: MANY_TABS, isScrollable: true },
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseTabs },
			setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
			template: '<div style="max-width: 320px;"><BaseTabs v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
	play: async ({ canvas }) => {
		await expect(await canvas.findByRole('button', { name: 'Прокрутить вкладки вправо' })).toBeVisible()
		await expect(canvas.queryByRole('button', { name: 'Прокрутить вкладки влево' })).toBeNull()
	},
}
