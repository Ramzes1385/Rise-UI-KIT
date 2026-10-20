import { visible } from '../edit/editShared'
import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { expect, waitFor, within } from 'storybook/test'
import { conflictProposals, reviewUser } from '../../demo/review'
import { storySource, useStorySetup, STORY_WAIT_TIMEOUT } from '@/stories/helpers'
import { proposalCard, reviewArgs, reviewControls, reviewImports, reviewModels, reviewTemplate, reviewTypes } from './reviewShared'

export const ReviewStale: StoryObj<typeof meta> = {
	parameters: {
		controls: reviewControls,
		docs: {
			description: {
				story: [
					'Предложение устаревает, когда путь ушёл от того, на что рассчитывал автор: тему удалили, поле изменили (`previous` не совпал)',
					'или место уже занято. Здесь две правки одного названия — «Vue Router» и «Навигация»: принятое первым делает',
					'второе устаревшим. У такой карточки бейдж «устарело», «Принять» неактивна (но достаётся с клавиатуры), причина читается',
					'через `aria-describedby`; «Принять все» считает и применяет только применимые. Отклонить устаревшее можно.',
					'Строка «поле → было → стало» — flex-ряд: в RTL порядок зеркалится вместе со стрелкой.',
				].join('\n'),
			},
			source: storySource({ template: reviewTemplate, imports: reviewImports, models: reviewModels, types: reviewTypes }),
		},
	},
	args: { ...reviewArgs, review: { proposals: conflictProposals, threads: [], currentUser: reviewUser } },
	render: args => ({
		components: { BaseRoadmap },
		setup: useStorySetup(args, { models: reviewModels, slots: [] }),
		template: reviewTemplate,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const panel = within(await canvas.findByRole('region', { name: 'Правки' }, { timeout: STORY_WAIT_TIMEOUT }))
		const area = within(canvasElement.querySelector('.base-roadmap__area') as HTMLElement)
		const first = proposalCard(canvasElement, 'Переименовать «Маршруты» в «Vue Router»')
		const second = proposalCard(canvasElement, 'Переименовать «Маршруты» в «Навигация»')
		await expect(panel.getByRole('button', { name: 'Принять все: 3' })).toBeVisible()
		await expect(within(first).getByText('Маршруты')).toBeVisible()
		await expect(within(first).getByText('Vue Router')).toBeVisible()
		await expect(within(second).queryByText('устарело')).toBeNull()

		await userEvent.click(within(first).getByRole('button', { name: 'Принять' }))
		await visible(() => area.getByRole('button', { name: /^Vue Router/ }))
		await waitFor(() => expect(within(second).getByText('устарело')).toBeVisible(), { timeout: STORY_WAIT_TIMEOUT })
		const accept = within(second).getByRole('button', { name: 'Принять' })
		await expect(accept).toHaveAttribute('aria-disabled', 'true')
		await expect(accept).toHaveAccessibleDescription(/принять нельзя/)
		await expect(panel.getByRole('button', { name: 'Принять все: 1' })).toBeVisible()

		await userEvent.click(accept)
		await expect(second).not.toHaveTextContent('Принято')
		await expect(area.queryByRole('button', { name: /^Навигация/ })).toBeNull()

		await userEvent.click(panel.getByRole('button', { name: 'Принять все: 1' }))
		await visible(() => area.getByRole('button', { name: /^Тестирование/ }))
		await waitFor(() => expect(panel.queryByRole('button', { name: /^Принять все/ })).toBeNull())
		await expect(within(second).getByText('устарело')).toBeVisible()

		await userEvent.click(within(second).getByRole('button', { name: 'Отклонить' }))
		await waitFor(() => expect(second).toHaveTextContent('Отклонено'))
		await expect(panel.getByRole('tab', { name: /^Предложения/ })).toHaveTextContent('Предложения 0')
	},
}
