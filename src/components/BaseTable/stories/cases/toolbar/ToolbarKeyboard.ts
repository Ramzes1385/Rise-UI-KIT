import { expect } from 'storybook/test'
import type meta from '../../BaseTable.stories'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { COLUMNS, ORDERS, toRows, tableScript } from '../../shared'
import { storySource, useStorySetup, inlineKey } from '@/stories/helpers'

const template = `
	<BaseTable v-bind="args" :columns="columns" />
`

export const ToolbarKeyboard: StoryObj<typeof meta> = {
	args: { rows: toRows(ORDERS.slice(0, 5)), features: { search: true, filters: true, columnSettings: true }, searchDebounce: 0 },
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'features'] },
		docs: {
			description: {
				story: [
					'Тулбар — панель инструментов по APG Toolbar (`role="toolbar"`, имя «Инструменты таблицы»): в него ведёт одна',
					'остановка Tab, остальные поля и кнопки (поиск, колонка и условие фильтра, значение, «Добавить», «Колонки», кнопки',
					'удаления фильтров) получают `tabindex="-1"`. ← и → переходят к соседнему элементу по кругу, Home и End — к первому и',
					'последнему (в списках выбора Home и End остаются за списком); в текстовом поле стрелки двигают каретку и уводят фокус, только когда она у края текста. Tab выходит',
					'из панели и возвращается на тот элемент, где фокус был. После удаления фильтра фокус остаётся на соседнем фильтре.',
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
	play: async ({ canvas, userEvent }) => {
		const toolbar = canvas.getByRole('toolbar', { name: 'Инструменты таблицы' })
		const search = canvas.getByRole('textbox', { name: 'Поиск по таблице' })
		const column = canvas.getByRole('combobox', { name: 'Колонка фильтра' })
		const columnsButton = canvas.getByRole('button', { name: 'Колонки' })

		await userEvent.tab()
		await expect(search).toHaveFocus()
		await expect(toolbar.querySelectorAll('[tabindex="0"]')).toHaveLength(1)

		await userEvent.keyboard(inlineKey('{ArrowRight}'))
		await expect(column).toHaveFocus()
		await userEvent.keyboard(inlineKey('{ArrowRight}'))
		await expect(canvas.getByRole('combobox', { name: 'Условие фильтра' })).toHaveFocus()
		await userEvent.keyboard(inlineKey('{ArrowRight}'))
		await expect(canvas.getByRole('textbox', { name: 'Значение фильтра' })).toHaveFocus()
		await userEvent.keyboard(inlineKey('{ArrowRight}'))
		await expect(canvas.getByRole('button', { name: 'Добавить' })).toHaveFocus()
		await userEvent.keyboard('{End}')
		await expect(columnsButton).toHaveFocus()
		await userEvent.keyboard('{Home}')
		await expect(search).toHaveFocus()
		await userEvent.keyboard(inlineKey('{ArrowLeft}'))
		await expect(columnsButton).toHaveFocus()
		await userEvent.keyboard(inlineKey('{ArrowRight}'))
		await expect(search).toHaveFocus()

		await userEvent.keyboard('Москва' + inlineKey('{ArrowLeft}'))
		await expect(search).toHaveFocus()
		await expect(search).toHaveValue('Москва')

		await userEvent.tab()
		await expect(toolbar.contains(document.activeElement)).toBe(false)
		await userEvent.tab({ shift: true })
		await expect(search).toHaveFocus()
		await expect(toolbar.querySelectorAll('[tabindex="0"]')).toHaveLength(1)
	},
}
