import { noProgress } from '../../demo/mini'
import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import { docsFrame, STORY_WAIT_TIMEOUT } from '@/stories/helpers'
import type { RoadmapData } from '../../../types/roadmapData.types'

const alternatives: RoadmapData = {
	version: 1,
	id: 'vue-alternatives',
	title: 'Экосистема Vue',
	goal: 'Своё приложение',
	stages: [
		{
			id: 'ecosystem',
			title: 'Экосистема',
			topics: [
				{
					id: 'router',
					title: 'Vue Router',
					description: 'Страницы и переходы: маршруты с параметрами, навигационные хуки.',
					hours: 4,
					choice: 'routing',
				},
				{
					id: 'nuxt',
					title: 'Nuxt',
					description: 'Фреймворк поверх Vue: маршруты из файлов, серверный рендеринг. Можно изучить вместо Vue Router.',
					hours: 8,
					choice: 'routing',
				},
				{
					id: 'pinia',
					title: 'Pinia',
					description: 'Официальное хранилище состояния для Vue 3.',
					hours: 6,
					choice: 'store',
					isRecommended: true,
				},
				{
					id: 'vuex',
					title: 'Vuex',
					description: 'Прежнее хранилище, поддерживается для существующих проектов.',
					hours: 6,
					choice: 'store',
				},
				{ id: 'devtools', title: 'Vue DevTools', description: 'Отладка компонентов в браузере.', hours: 2, kind: 'optional' },
			],
		},
	],
}

export const Alternatives: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			...docsFrame(700),
			description: {
				story: [
					'Развилка «или»: темы с одним `choice` образуют группу, этапу хватает любой одной из них. Вторая и следующие темы группы',
					'получают метку «или» и бейдж «Альтернатива» в панели. «Советуем» — `isRecommended`, «По желанию» — `kind: "optional"`',
					'(не мешает пройти этап и не входит в «осталось ≈ ч»).',
					'Здесь две группы: маршрутизация и хранилище. Отметьте «Vue Router» и «Pinia» — этап пройден, хотя Nuxt и Vuex не тронуты.',
				].join('\n'),
			},
		},
	},
	args: {
		data: alternatives,
		progress: noProgress,
		layout: 'list',
		expanded: ['ecosystem'],
		selected: null,
	},
	play: async ({ canvas, userEvent }) => {
		const nuxt = await canvas.findByRole('button', { name: /^Nuxt/ })
		await expect(nuxt).toHaveTextContent('или')
		await expect(nuxt).toHaveAccessibleName(/альтернатива/)
		await expect(canvas.getByRole('button', { name: /^Vue Router/ })).not.toHaveTextContent('или')
		await expect(canvas.getByRole('button', { name: /^Pinia/ })).toHaveAccessibleName(/советуем/)
		await expect(canvas.getByRole('button', { name: /^Vue DevTools/ })).toHaveAccessibleName(/по желанию/)

		await userEvent.click(nuxt)
		await waitFor(() => expect(screen.getByText('Альтернатива')).toBeVisible(), { timeout: STORY_WAIT_TIMEOUT })
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('button', { name: 'Отметить изученной' })).toBeNull())

		for (const title of ['Vue Router', 'Pinia']) {
			await userEvent.click(canvas.getByRole('button', { name: new RegExp(`^${title}`) }))
			await userEvent.click(await screen.findByRole('button', { name: 'Отметить изученной' }))
			await waitFor(() => expect(screen.getByRole('button', { name: 'Вернуть в работу' })).toBeVisible(), {
				timeout: STORY_WAIT_TIMEOUT,
			})
			await userEvent.keyboard('{Escape}')
			await waitFor(() => expect(screen.queryByRole('button', { name: 'Вернуть в работу' })).toBeNull())
		}
		await waitFor(() => expect(canvas.getByRole('button', { name: /Экосистема/ })).toHaveAccessibleName(/пройден/))
	},
}
