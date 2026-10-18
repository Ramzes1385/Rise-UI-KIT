import { noProgress } from '../../demo/mini'
import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import { docsFrame, STORY_WAIT_TIMEOUT } from '@/stories/helpers'
import type { RoadmapData } from '../../../types/roadmapData.types'

const withMaterials: RoadmapData = {
	version: 1,
	id: 'vue-materials',
	title: 'Pinia: материалы',
	stages: [
		{
			id: 'state',
			title: 'Состояние приложения',
			topics: [
				{
					id: 'pinia',
					title: 'Pinia',
					description: 'Общее состояние приложения: сторы, геттеры и действия. Официальное хранилище для Vue 3.',
					hours: 9,
					subtopics: [
						{ id: 'pinia-1', title: 'Сторы и состояние' },
						{ id: 'pinia-2', title: 'Геттеры и действия' },
					],
					materials: [
						{ id: 'guide', kind: 'doc', title: 'Руководство по Pinia', minutes: 40, url: 'https://pinia.vuejs.org' },
						{ id: 'cart', kind: 'article', title: 'Стор корзины на примерах', minutes: 15, url: '/articles/pinia-cart' },
						{ id: 'talk', kind: 'video', title: 'Pinia за 40 минут', minutes: 40, url: 'https://example.org/video/pinia' },
						{ id: 'course', kind: 'course', title: 'Курс «Состояние во Vue»', minutes: 360 },
						{ id: 'book', kind: 'book', title: 'Книга «Архитектура фронтенда»' },
						{ id: 'task', kind: 'practice', title: 'Задание: стор каталога', minutes: 60 },
						{ id: 'repo', kind: 'link', title: 'Пример проекта', url: 'https://example.org/pinia-demo' },
					],
				},
			],
		},
	],
}

export const Materials: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			...docsFrame(760),
			description: {
				story: [
					'Материалы темы в панели: значок и подпись вида («Документация», «Статья», «Видео», «Курс», «Книга», «Практика», «Ссылка»),',
					'длительность из `minutes` («40 мин», «6 ч»). Ссылка на другой origin открывается в новой вкладке с `rel="noopener noreferrer"`',
					'и подписью «откроется в новой вкладке» для скринридера; внутренняя — в той же. Материал без `url` — просто строка.',
					'Свою ссылку, например `RouterLink`, задаёт слот `material`.',
				].join('\n'),
			},
		},
	},
	args: { data: withMaterials, progress: noProgress, layout: 'list', expanded: ['state'], selected: null },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(await canvas.findByRole('button', { name: /^Pinia/ }))
		const external = await screen.findByRole('link', { name: /Руководство по Pinia/ })
		await expect(external).toHaveAttribute('target', '_blank')
		await expect(external).toHaveAttribute('rel', 'noopener noreferrer')
		await expect(external).toHaveTextContent('Документация · 40 мин')
		const internal = screen.getByRole('link', { name: /Стор корзины на примерах/ })
		await expect(internal).not.toHaveAttribute('target')
		await waitFor(() => expect(screen.getByText('Курс · 6 ч')).toBeVisible(), { timeout: STORY_WAIT_TIMEOUT })
		await expect(screen.queryByRole('link', { name: /Книга/ })).toBeNull()
		await waitFor(() => expect(screen.getByText(/Книга «Архитектура фронтенда»/)).toBeVisible(), { timeout: STORY_WAIT_TIMEOUT })
	},
}
