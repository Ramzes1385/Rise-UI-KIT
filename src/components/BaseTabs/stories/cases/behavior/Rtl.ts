import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseTabs.stories'
import BaseTabs from '../../../ui/BaseTabs.vue'
import { expect, waitFor } from 'storybook/test'
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
	<div dir="rtl" style="max-width: 320px; display: flex; flex-direction: column; gap: 24px;">
		<BaseTabs v-bind="args" v-model="tab" />
		<BaseTabs v-bind="args" v-model="tab" is-scrollable />
	</div>
`

export const Rtl: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				story: [
					'Справа налево (`dir="rtl"`): список начинается с правого края, затухание — на краю, за которым скрыты вкладки',
					'(в начале списка — слева), выбранная вкладка прокручивается в видимую часть, кнопки прокрутки остаются на своих сторонах,',
					'← выбирает следующую вкладку, → — предыдущую.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseTabs'], models }),
		},
	},
	args: { items: MANY_TABS },
	render: args => ({
		components: { BaseTabs },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const roots = canvasElement.querySelectorAll<HTMLElement>('.base-tabs')
		await waitFor(() => expect(roots[0]).toHaveClass('base-tabs--fade-end'))
		await expect(roots[0]).not.toHaveClass('base-tabs--fade-start')
		await expect(getComputedStyle(roots[0].querySelector('.base-tabs__list')!).maskImage).toContain('to left')
		await expect(canvas.getAllByRole('button', { name: 'Прокрутить вкладки влево' })).toHaveLength(1)
		await expect(canvas.queryByRole('button', { name: 'Прокрутить вкладки вправо' })).toBeNull()

		const overview = canvas.getAllByRole('tab', { name: 'Обзор' })[0]
		await tabTo(overview, userEvent)
		await userEvent.keyboard('{ArrowLeft}')
		await expect(canvas.getAllByRole('tab', { name: 'Характеристики' })[0]).toHaveFocus()
		await userEvent.keyboard('{ArrowRight}')
		await expect(overview).toHaveFocus()

		await userEvent.keyboard('{End}')
		const last = canvas.getAllByRole('tab', { name: 'Вопросы и ответы' })[0]
		await expect(last).toHaveFocus()
		await waitFor(() => expect(roots[0]).toHaveClass('base-tabs--fade-start'))
		await waitFor(() => expect(roots[0]).not.toHaveClass('base-tabs--fade-end'))
	},
}
