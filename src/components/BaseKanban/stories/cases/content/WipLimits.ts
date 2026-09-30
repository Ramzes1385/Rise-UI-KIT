import { ref } from 'vue'
import { CARDS } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseKanban.stories'
import BaseKanban from '../../../ui/BaseKanban.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import type { KanbanMove } from '../../../types/BaseKanban.types'

export const WipLimits: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'WIP-лимиты: «На проверке» — лимит 1, в колонке две карточки, счётчик подсвечен. `can-move` не пускает в «Готово» мимо проверки.',
			},
		},
	},
	args: { canMove: (move: KanbanMove) => move.to.columnId !== 'done' || move.from.columnId === 'review' },
	render: args => ({
		components: { BaseKanban },
		setup: () => ({ props: useArgsWithoutSlots(args), cards: ref([...CARDS]) }),
		template: '<BaseKanban v-bind="props" v-model:cards="cards" />',
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(canvas.getByRole('list', { name: 'На проверке, 2 карточки, Превышен лимит 1' })).toBeInTheDocument()
		await expect(canvasElement.querySelector('.base-kanban__column--over')).toHaveTextContent('2 / 1')
		canvas.getByRole('button', { name: 'Тёмная тема для таблиц' }).focus()
		await userEvent.keyboard(' {ArrowRight}{ArrowRight}{ArrowRight} ')
		await expect(canvas.getByRole('status')).toHaveTextContent('Карточку «Тёмная тема для таблиц» нельзя положить в «Готово»')
		await expect(canvas.getByRole('list', { name: /^К выполнению/ })).toHaveTextContent('Тёмная тема для таблиц')
	},
}
