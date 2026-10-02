import type meta from '../../BaseTable.stories'
import { BaseIcon } from '@components/BaseIcon'
import BaseTable from '../../../ui/BaseTable.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { waitFor, expect, screen } from 'storybook/test'
import { COLUMNS, toRows, ORDERS, bodyRows, tableScript } from '../../shared'
import { STORY_WAIT_TIMEOUT, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseTable v-bind="args" :columns="columns">
		<template #toolbar-append>
			<BaseButton variant="outline">
				<template #left><BaseIcon name="download" :size-scale="80" /></template>
				Экспорт
			</BaseButton>
		</template>
	</BaseTable>
`

export const Toolbar: StoryObj<typeof meta> = {
	args: {
		rows: toRows(ORDERS.slice(0, 6)),
		features: { search: true, filters: true, columnSettings: true },
		searchDebounce: 0,
	},
	parameters: {
		docs: {
			description: {
				story: [
					'Тулбар: поиск по всем полям (`features.search`), фильтр «колонка — условие — значение» (`features.filters`),',
					'видимость колонок (`features.columnSettings`) и свои элементы в слотах `toolbar-prepend` / `toolbar-append`.',
					'Поля и кнопки — 32px в один ряд. «Колонки» — меню с флажками (APG Menu Button): клик или Space отмечает колонку,',
					'Enter отмечает и закрывает меню, Escape закрывает его и возвращает фокус на кнопку.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseButton', 'BaseIcon', 'BaseTable', 'type TableColumn'],
				script: tableScript({ columns: COLUMNS }),
				omit: ['columns'],
			}),
		},
	},
	render: args => ({
		components: { BaseTable, BaseButton, BaseIcon },
		setup: useStorySetup(args, { data: { columns: args.columns }, slots: ['default', 'columns'] }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.type(canvas.getByLabelText('Поиск по таблице'), 'Москва')
		await waitFor(() => expect(bodyRows(canvas.getByRole('table'))).toHaveLength(2))
		await waitFor(() => expect(args.onSearch).toHaveBeenLastCalledWith('Москва'))

		const columnsButton = canvas.getByRole('button', { name: 'Колонки' })
		await userEvent.click(columnsButton)
		await expect(columnsButton).toHaveAttribute('aria-expanded', 'true')
		const cityOption = await screen.findByRole('menuitemcheckbox', { name: 'Город' }, { timeout: STORY_WAIT_TIMEOUT })
		await userEvent.click(cityOption)
		await expect(canvas.queryByRole('columnheader', { name: 'Город' })).not.toBeInTheDocument()
		await expect(screen.getByRole('menuitemcheckbox', { name: 'Город' })).toHaveAttribute('aria-checked', 'false')
		await userEvent.keyboard('{Escape}')
		await expect(columnsButton).toHaveFocus()
		await expect(columnsButton).toHaveAttribute('aria-expanded', 'false')
	},
}
