import type meta from '../BaseKanban.stories'
import BaseKanban from '../../ui/BaseKanban.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import { storySource, useStorySetup, inlineKey } from '@/stories/helpers'

const models = { cards: 'cards' }

const template = `
	<BaseKanban v-bind="args" v-model:cards="cards" />
`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Space берёт карточку, стрелки переносят её между колонками, Space кладёт. Мышью — перетаскиванием. Значок приоритета подписан подсказкой (BaseTooltip) при наведении.',
			},
			source: storySource({ template, imports: ['BaseKanban'], models }),
		},
	},
	render: args => ({
		components: { BaseKanban },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Тёмная тема для таблиц' })).toHaveFocus()
		await userEvent.keyboard('{ArrowDown}')
		const card = canvas.getByRole('button', { name: 'Поиск по эмодзи' })
		await expect(card).toHaveFocus()
		await userEvent.keyboard(' ')
		await expect(card).toHaveAttribute('aria-pressed', 'true')
		await expect(canvas.getByRole('status')).toHaveTextContent('Карточка «Поиск по эмодзи» взята')
		await userEvent.keyboard(inlineKey('{ArrowRight}'))
		await expect(canvas.getByRole('status')).toHaveTextContent('«В работе», позиция 2 из 3')
		await userEvent.keyboard(' ')
		await expect(canvas.getByRole('list', { name: /^В работе, 3 карточки/ })).toHaveTextContent('Поиск по эмодзи')
		await expect(args.onMove).toHaveBeenCalledWith(
			expect.objectContaining({ from: { columnId: 'todo', index: 1 }, to: { columnId: 'progress', index: 1 } }),
		)
		await expect(canvas.getByRole('button', { name: 'Поиск по эмодзи' })).toHaveFocus()

		const priority = canvas
			.getByRole('button', { name: 'Тёмная тема для таблиц' })
			.querySelector('.base-kanban__priority') as HTMLElement
		await userEvent.hover(priority)
		await expect(await screen.findByRole('tooltip')).toHaveTextContent('средний')
		await userEvent.unhover(priority)
		await waitFor(() => expect(document.querySelector('[role="tooltip"]')).toBeNull(), { timeout: 2000 })
	},
}
