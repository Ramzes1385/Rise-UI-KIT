import type meta from '../../BaseTable.stories'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor, within } from 'storybook/test'
import { COLUMNS, ORDERS, toRows, tableScript } from '../../shared'
import { STORY_WAIT_TIMEOUT, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseTable v-bind="args" :columns="columns" />
`

export const ColumnsPanel: StoryObj<typeof meta> = {
	args: { rows: toRows(ORDERS.slice(0, 4)), features: { columnSettings: true } },
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'features'] },
		docs: {
			description: {
				story: [
					'Панель «Колонки» — меню с флажками (APG Menu Button, `role="menu"` с пунктами `menuitemcheckbox`), название',
					'«Видимость колонок». Enter или Space на кнопке открывают меню, ↑ и ↓ ходят по колонкам, Space отмечает колонку и',
					'оставляет меню открытым, Enter отмечает и закрывает, Escape закрывает и возвращает фокус на кнопку. Каждое изменение',
					'приходит событием `columns-change` с копией колонок.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseTable', 'type TableColumn'],
				script: tableScript({ columns: COLUMNS }),
				omit: ['columns'],
			}),
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: useStorySetup(args, { data: { columns: COLUMNS } }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const button = canvas.getByRole('button', { name: 'Колонки' })
		await userEvent.tab()
		await expect(button).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		const menu = await screen.findByRole('menu', { name: 'Видимость колонок' }, { timeout: STORY_WAIT_TIMEOUT })
		await expect(button).toHaveAttribute('aria-expanded', 'true')
		await expect(within(menu).getAllByRole('menuitemcheckbox')).toHaveLength(COLUMNS.length)
		await expect(within(menu).getByRole('menuitemcheckbox', { name: 'Город' })).toHaveAttribute('aria-checked', 'true')

		await expect(within(menu).getByRole('menuitemcheckbox', { name: 'Заказ' })).toHaveFocus()
		await userEvent.keyboard('{ArrowDown}')
		await expect(within(menu).getByRole('menuitemcheckbox', { name: 'Покупатель' })).toHaveFocus()
		await userEvent.keyboard(' ')
		await waitFor(() => expect(canvas.queryByRole('columnheader', { name: 'Покупатель' })).not.toBeInTheDocument())
		await expect(within(menu).getByRole('menuitemcheckbox', { name: 'Покупатель' })).toHaveAttribute('aria-checked', 'false')
		await expect(args['onColumns-change']).toHaveBeenCalledOnce()

		await userEvent.keyboard('{Escape}')
		await expect(button).toHaveFocus()
		await expect(button).toHaveAttribute('aria-expanded', 'false')
	},
}
