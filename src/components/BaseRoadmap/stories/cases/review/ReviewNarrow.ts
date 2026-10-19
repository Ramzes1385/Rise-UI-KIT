import { visible } from '../edit/editShared'
import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { expect, waitFor, within } from 'storybook/test'
import { storySource, useStorySetup, STORY_WAIT_TIMEOUT } from '@/stories/helpers'
import { narrowReviewTemplate, proposalCard, reviewArgs, reviewControls, reviewImports, reviewModels, reviewTypes } from './reviewShared'

export const ReviewNarrow: StoryObj<typeof meta> = {
	parameters: {
		controls: reviewControls,
		docs: {
			description: {
				story: [
					'Телефон, 375 px (мокап RoadmapMobile): контейнер уже `narrowWidth`, путь идёт списком, а панель «Правок» встаёт',
					'под него на всю ширину в компактном виде (отступ 8 px). Вкладки, фильтр и кнопки не переносятся за край,',
					'«Принять» и «Отклонить» остаются кнопками на всю высоту касания. Принятие применяет правку к пути над панелью.',
				].join('\n'),
			},
			source: storySource({ template: narrowReviewTemplate, imports: reviewImports, models: reviewModels, types: reviewTypes }),
		},
	},
	args: reviewArgs,
	render: args => ({
		components: { BaseRoadmap },
		setup: useStorySetup(args, { models: reviewModels, slots: [] }),
		template: narrowReviewTemplate,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const panel = within(await canvas.findByRole('region', { name: 'Правки' }, { timeout: STORY_WAIT_TIMEOUT }))
		const root = canvasElement.querySelector('.base-roadmap') as HTMLElement
		await expect(root).toHaveClass('base-roadmap--narrow')
		await expect(canvasElement.querySelector('.base-roadmap__review')).toHaveClass('base-roadmap__review--compact')
		await expect(canvasElement.querySelector('.base-roadmap__list')).not.toBeNull()
		await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)

		await expect(panel.getByRole('tab', { name: /^Предложения/ })).toHaveTextContent('Предложения 4')
		await expect(panel.getByRole('button', { name: 'Принять все: 3' })).toBeVisible()

		await userEvent.click(within(proposalCard(canvasElement, 'Переименовать')).getByRole('button', { name: 'Принять' }))
		await waitFor(() => expect(proposalCard(canvasElement, 'Переименовать')).toHaveTextContent('Принято'), {
			timeout: STORY_WAIT_TIMEOUT,
		})
		await visible(() => canvas.getByRole('button', { name: /^Vue Router/ }))

		await userEvent.click(within(proposalCard(canvasElement, 'Поднять')).getByRole('button', { name: 'Отклонить' }))
		await waitFor(() => expect(proposalCard(canvasElement, 'Поднять')).toHaveTextContent('Отклонено'))

		await userEvent.click(panel.getByRole('tab', { name: /^Комментарии/ }))
		await expect(await panel.findByRole('button', { name: 'Реактивность' })).toBeVisible()
		await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
	},
}
