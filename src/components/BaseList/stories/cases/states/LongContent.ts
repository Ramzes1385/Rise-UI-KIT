import { expect } from 'storybook/test'
import type meta from '../../BaseList.stories'
import BaseList from '../../../ui/BaseList.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const items = [
	{
		id: 'report',
		title: 'Годовой отчёт по продажам региональных представительств за 2025 год с разбивкой по кварталам',
		description: 'Отдел аналитики подготовил сводные таблицы, графики выручки и комментарии руководителей направлений',
		icon: 'folder',
		meta: '24 МБ',
	},
	{ id: 'contract', title: 'Договор', description: 'Короткое описание', icon: 'folder' },
	{
		id: 'link',
		title: 'https://example.com/projects/rise-ui-kit/documents/specification-v2-final-final.pdf',
		icon: 'folder',
	},
]

const template = `<div class="story-narrow"><BaseList v-bind="args" /></div>`

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Длинные тексты в узком контейнере: заголовок и описание переносятся по словам, длинная ссылка — по символам; ширина не больше контейнера.',
			},
			source: storySource({ template, imports: ['BaseList'] }),
		},
	},
	args: { items, selectionMode: 'none', label: 'Документы' },
	render: args => ({
		components: { BaseList },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const list = canvas.getByRole('list', { name: 'Документы' })
		const frame = canvasElement.querySelector('.story-narrow') as HTMLElement
		await expect(list.scrollWidth).toBeLessThanOrEqual(frame.clientWidth)
	},
}
