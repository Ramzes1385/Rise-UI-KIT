import { ref } from 'vue'
import { CARDS } from '../../shared'
import type meta from '../../BaseKanban.stories'
import BaseKanban from '../../../ui/BaseKanban.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { expect, screen, waitFor } from 'storybook/test'
import type { KanbanCard } from '../../../types/BaseKanban.types'

export const ContextMenu: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Меню карточки: правый клик, Shift+F10 или клавиша меню. «Открыть», «Переименовать», «Переместить в» другую колонку, «В начало / в конец колонки», пункты приложения из `card-actions` — здесь «Копировать номер» — и «Удалить» при `is-editable`.',
			},
		},
	},
	render: args => ({
		components: { BaseKanban },
		setup() {
			const cards = ref([...CARDS])
			const cardActions = (card: KanbanCard) => [
				{
					label: 'Копировать номер',
					isDisabled: !card.key,
					onSelect: () => navigator.clipboard?.writeText(card.key ?? '').catch(() => undefined),
				},
			]
			return { props: useArgsWithoutSlots(args), cards, cardActions }
		},
		template: '<BaseKanban v-bind="props" v-model:cards="cards" :card-actions="cardActions" is-editable />',
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
