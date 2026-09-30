import { expect } from 'storybook/test'
import type meta from '../../BaseKanban.stories'
import BaseKanban from '../../../ui/BaseKanban.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import type { KanbanMove } from '../../../types/BaseKanban.types'

const models = { cards: 'cards' }

const canMove = (move: KanbanMove): boolean => move.to.columnId !== 'done' || move.from.columnId === 'review'

const template = `
	<BaseKanban v-bind="args" v-model:cards="cards" :can-move="canMove" />
`

export const WipLimits: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'WIP-лимиты: «На проверке» — лимит 1, в колонке две карточки, счётчик подсвечен. `can-move` не пускает в «Готово» мимо проверки.',
			},
			source: storySource({
				template,
				imports: ['BaseKanban', 'type KanbanMove'],
				models,
				script: "const canMove = (move: KanbanMove): boolean => move.to.columnId !== 'done' || move.from.columnId === 'review'",
			}),
		},
	},
	render: args => ({
		components: { BaseKanban },
		setup: useStorySetup(args, { models, data: { canMove } }),
		template,
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
