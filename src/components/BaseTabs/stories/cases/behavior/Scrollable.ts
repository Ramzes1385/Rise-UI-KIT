import type meta from '../../BaseTabs.stories'
import BaseTabs from '../../../ui/BaseTabs.vue'
import { expect, waitFor } from 'storybook/test'
import { isRtl } from '@utils/dom/directionUtils'
import type { StoryObj } from '@storybook/vue3-vite'
import type { TabItem } from '../../../types/BaseTabs.types'
import { storySource, useStorySetup } from '@/stories/helpers'

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

const models = { tab: 'modelValue' }

const template = `
	<div style="max-width: 320px;"><BaseTabs v-bind="args" v-model="tab" /></div>
`

export const Scrollable: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`isScrollable`: при переполнении по краям появляются кнопки прокрутки, список можно тянуть мышью',
					'(перетаскивание не переключает вкладку).',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseTabs'], models }),
		},
	},
	args: { items: MANY_TABS, isScrollable: true },
	render: args => ({
		components: { BaseTabs },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas }) => {
		const [toHidden, toStart] = isRtl(document.documentElement) ? ['влево', 'вправо'] : ['вправо', 'влево']
		const hidden = await canvas.findByRole('button', { name: `Прокрутить вкладки ${toHidden}` })
		await waitFor(() => expect(hidden).toBeVisible())
		await expect(canvas.queryByRole('button', { name: `Прокрутить вкладки ${toStart}` })).toBeNull()
	},
}
