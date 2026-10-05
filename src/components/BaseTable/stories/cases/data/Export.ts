import type meta from '../../BaseTable.stories'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import type { TableColumn } from '../../../types/BaseTable.types'
import { COLUMNS, ORDERS, tableScript, toRows } from '../../shared'
import { STORY_WAIT_TIMEOUT, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<BaseTable
			v-bind="args"
			:columns="exportColumns"
			@export="lastExport = \`\${$event.format.toUpperCase()}: строк \${$event.rows.length}, колонок \${$event.columns.length}\`" />
		<p role="status">{{ lastExport }}</p>
	</div>
`

const exportColumns: TableColumn[] = COLUMNS.map(column => {
	if (column.key === 'date') return { ...column, exportValue: (value: unknown) => new Date(`${value}T00:00`) }
	if (column.key === 'total') return { ...column, exportValue: (value: unknown) => value }
	return column
})

const EXPORT_SCRIPT = [
	'const exportColumns: TableColumn[] = columns.map(column => {',
	"\tif (column.key === 'date') return { ...column, exportValue: (value: unknown) => new Date(`${value}T00:00`) }",
	"\tif (column.key === 'total') return { ...column, exportValue: (value: unknown) => value }",
	'\treturn column',
	'})',
].join('\n')

export const Export: StoryObj<typeof meta> = {
	args: {
		rows: toRows(ORDERS.slice(0, 6)),
		features: { export: true, columnSettings: true },
		behavior: { selectable: true },
		exportOptions: { fileName: 'orders', sheetName: 'Заказы' },
	},
	parameters: {
		docs: {
			description: {
				story: [
					"Выгрузка в CSV и Excel (`features.export`; `['xlsx']` — только Excel): кнопка «Экспорт» открывает меню форматов.",
					'В файл попадают строки после поиска, фильтров и сортировки со всех страниц и видимые колонки по порядку;',
					'выбраны строки — только они, меню об этом пишет. Значение колонки — текст `formatter`, а `exportValue` отдаёт',
					'своё: здесь дата и сумма выгружаются датой и числом, и Excel считает их. CSV — UTF-8 с меткой для Excel, разделитель',
					'по языку (`;` для русского). Имя файла и листа — `exportOptions`. Событие `export` приходит до скачивания,',
					'`preventDefault()` отменяет его (выгрузка на сервере); метод `exportData(format, options)` — через `ref`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseTable', 'type TableColumn'],
				state: { lastExport: '' },
				script: `${tableScript({ columns: COLUMNS })}\n\n${EXPORT_SCRIPT}`,
				omit: ['columns'],
			}),
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: useStorySetup(args, { state: { lastExport: '' }, data: { exportColumns }, slots: ['default', 'columns'] }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const button = canvas.getByRole('button', { name: 'Экспорт' })
		await userEvent.click(canvas.getByRole('checkbox', { name: 'Выбрать строку 2' }))
		await userEvent.click(button)
		await expect(button).toHaveAttribute('aria-expanded', 'true')
		const hint = await screen.findByText('Только выбранные строки: 1', {}, { timeout: STORY_WAIT_TIMEOUT })
		await waitFor(() => expect(hint).toBeVisible(), { timeout: STORY_WAIT_TIMEOUT })
		await userEvent.keyboard('{Escape}')
		await expect(button).toHaveFocus()
		await userEvent.click(canvas.getByRole('checkbox', { name: 'Выбрать строку 2' }))
		await button.focus()
		await userEvent.keyboard('{Enter}')
		const csv = await screen.findByRole('menuitem', { name: 'CSV' }, { timeout: STORY_WAIT_TIMEOUT })
		await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Excel (XLSX)' })).toBeVisible(), { timeout: STORY_WAIT_TIMEOUT })
		await userEvent.click(csv)
		await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('CSV: строк 6, колонок 6'))
		await expect(args.onExport).toHaveBeenCalledWith(expect.objectContaining({ format: 'csv' }))
	},
}
