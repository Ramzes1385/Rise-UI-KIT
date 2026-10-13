import { expect } from 'storybook/test'
import { storySource } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseFileManager.stories'
import { type ManagerCaseOptions, managerRender, managerSource, managerTag } from '../../shared'

const options: ManagerCaseOptions = {
	template: `
${managerTag({ isModel: true })}
`,
	isModel: true,
}

const source = storySource(managerSource(options))

export const Search: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Поиск и сортировка. Поиск (`v-model:query`) ищет по имени в текущей папке; ничего не найдено — сообщение с запросом (слот `empty` получает `isSearch` и `query`).',
					'Кнопки сортировки (`v-model:sort`) — имя, размер, дата изменения; повторное нажатие меняет порядок, папки всегда идут перед файлами.',
					'При переходе в другую папку поиск сбрасывается.',
				].join('\n'),
			},
			source,
		},
	},
	render: managerRender(options),
	play: async ({ canvas, userEvent }) => {
		const search = canvas.getByRole('textbox', { name: 'Поиск по имени в этой папке' })

		await userEvent.type(search, 'про')
		await expect(await canvas.findByRole('option', { name: /^Проекты/ })).toBeVisible()
		await expect(canvas.queryByRole('option', { name: /^Документы/ })).not.toBeInTheDocument()

		await userEvent.clear(search)
		await userEvent.type(search, 'такого нет')
		await expect(await canvas.findByText('Ничего не найдено')).toBeVisible()
		await expect(canvas.getByText(/такого нет/)).toBeVisible()

		await userEvent.clear(search)
		await expect(await canvas.findByRole('option', { name: /^Документы/ })).toBeVisible()

		await userEvent.click(canvas.getByRole('button', { name: /Сортировать: Имя, по возрастанию/ }))
		await expect(canvas.getByRole('button', { name: /Сортировать: Имя, по убыванию/ })).toHaveAttribute('aria-pressed', 'true')
		await expect(canvas.getAllByRole('option')[0]).toHaveAccessibleName(/^Фото/)
	},
}
