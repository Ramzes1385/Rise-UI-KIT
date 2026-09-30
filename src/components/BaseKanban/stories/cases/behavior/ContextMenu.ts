import type meta from '../../BaseKanban.stories'
import BaseKanban from '../../../ui/BaseKanban.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'
import type { KanbanCard } from '../../../types/BaseKanban.types'

const models = { cards: 'cards' }

const cardActions = (card: KanbanCard) => [
	{
		label: 'Копировать номер',
		isDisabled: !card.key,
		onSelect: () => navigator.clipboard?.writeText(card.key ?? '').catch(() => undefined),
	},
]

const template = `
	<BaseKanban v-bind="args" v-model:cards="cards" :card-actions="cardActions" is-editable />
`

const script = [
	'const cardActions = (card: KanbanCard) => [',
	'\t{',
	"\t\tlabel: 'Копировать номер',",
	'\t\tisDisabled: !card.key,',
	"\t\tonSelect: () => navigator.clipboard?.writeText(card.key ?? '').catch(() => undefined),",
	'\t},',
	']',
].join('\n')

export const ContextMenu: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Меню карточки: правый клик, Shift+F10 или клавиша меню. «Открыть», «Переименовать», «Переместить в» другую колонку, «В начало / в конец колонки», пункты приложения из `card-actions` — здесь «Копировать номер» — и «Удалить» при `is-editable`.',
			},
			source: storySource({ template, imports: ['BaseKanban', 'type KanbanCard'], models, script }),
		},
	},
	render: args => ({
		components: { BaseKanban },
		setup: useStorySetup(args, { models, data: { cardActions } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.pointer({ keys: '[MouseRight]', target: canvas.getByRole('button', { name: 'Экспорт таблицы в CSV' }) })
		await userEvent.click(await screen.findByRole('menuitem', { name: /Переместить в/ }))
		await userEvent.click(await screen.findByRole('menuitem', { name: 'Готово' }))
		await waitFor(() => expect(canvas.getByRole('list', { name: /^Готово/ })).toHaveTextContent('Экспорт таблицы в CSV'))
		canvas.getByRole('button', { name: 'Упоминания через @' }).focus()
		await userEvent.keyboard('{Shift>}{F10}{/Shift}')
		await userEvent.click(await screen.findByRole('menuitem', { name: 'Удалить' }))
		await waitFor(() => expect(canvas.queryByRole('button', { name: 'Упоминания через @' })).toBeNull())
		await expect(canvas.getByRole('status')).toHaveTextContent('Карточка «Упоминания через @» удалена')
	},
}
