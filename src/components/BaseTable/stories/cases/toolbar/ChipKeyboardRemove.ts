import type meta from '../../BaseTable.stories'
import { expect, waitFor } from 'storybook/test'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import { ALL_ROWS, COLUMNS, bodyRows, tableScript } from '../../shared'

const template = `
	<BaseTable v-bind="args" :columns="columns" />
`

export const ChipKeyboardRemove: StoryObj<typeof meta> = {
	args: { rows: ALL_ROWS, features: { filters: true }, behavior: {} },
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'features'] },
		docs: {
			description: {
				story: [
					'Метки активных фильтров удаляются с клавиатуры: Tab (или стрелки панели) до кнопки удаления метки, затем Enter или',
					'пробел — как у любой кнопки, а также Delete и Backspace на метке. После удаления фокус остаётся на соседней метке,',
					'а с последней уходит на панель инструментов.',
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
		const value = canvas.getByRole('textbox', { name: 'Значение фильтра' })
		await userEvent.type(value, 'З-10{Enter}')
		await userEvent.type(value, '4{Enter}')
		const table = canvas.getByRole('table')
		await waitFor(() => expect(bodyRows(table)).toHaveLength(2))
		const chips = (): HTMLElement[] => canvas.queryAllByRole('button', { name: /^Удалить фильтр/ })
		await expect(chips()).toHaveLength(2)

		chips()[0].focus()
		await userEvent.keyboard('{Delete}')
		await waitFor(() => expect(chips()).toHaveLength(1))
		await expect(chips()[0]).toHaveFocus()

		await userEvent.keyboard('{Backspace}')
		await waitFor(() => expect(chips()).toHaveLength(0))
		await expect(bodyRows(table)).toHaveLength(12)
	},
}
