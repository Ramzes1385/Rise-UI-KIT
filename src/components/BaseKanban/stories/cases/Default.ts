import { ref } from 'vue'
import { CARDS } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseKanban.stories'
import BaseKanban from '../../ui/BaseKanban.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Space берёт карточку, стрелки переносят её между колонками, Space кладёт. Мышью — перетаскиванием.',
			},
		},
	},
	render: args => ({
		components: { BaseKanban },
		setup: () => ({ props: useArgsWithoutSlots(args), cards: ref([...CARDS]) }),
		template: '<BaseKanban v-bind="props" v-model:cards="cards" />',
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
		await userEvent.keyboard('{ArrowRight}')
		await expect(canvas.getByRole('status')).toHaveTextContent('«В работе», позиция 2 из 3')
		await userEvent.keyboard(' ')
		await expect(canvas.getByRole('list', { name: /^В работе, 3 карточки/ })).toHaveTextContent('Поиск по эмодзи')
		await expect(args.onMove).toHaveBeenCalledWith(
			expect.objectContaining({ from: { columnId: 'todo', index: 1 }, to: { columnId: 'progress', index: 1 } }),
		)
		await expect(canvas.getByRole('button', { name: 'Поиск по эмодзи' })).toHaveFocus()
	},
}
