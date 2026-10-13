import { expect } from 'storybook/test'
import { storySource } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseFileManager.stories'
import { type ManagerCaseOptions, managerRender, managerSource, managerTag } from '../../shared'

const options: ManagerCaseOptions = {
	template: `
${managerTag()}
`,
}

const source = storySource(managerSource(options))

export const Readonly: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Только просмотр (`isReadonly`): навигация, поиск, сортировка и выбор работают, а создание, загрузка, переименование, удаление и перемещение недоступны — кнопок в панели нет, перетаскивание и F2 не действуют.',
			},
			source,
		},
	},
	args: { isReadonly: true },
	render: managerRender(options),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.queryByRole('button', { name: 'Новая папка' })).not.toBeInTheDocument()
		await expect(canvas.queryByRole('button', { name: 'Загрузить' })).not.toBeInTheDocument()

		const documents = canvas.getByRole('option', { name: /^Документы/ })
		await userEvent.click(documents)
		await expect(documents).toHaveAttribute('aria-selected', 'true')
		await userEvent.keyboard('{F2}')
		await expect(canvas.queryByRole('group', { name: /Новое имя/ })).not.toBeInTheDocument()

		await userEvent.keyboard('{Enter}')
		await expect(await canvas.findByRole('listbox', { name: 'Содержимое папки «Документы»' })).toBeVisible()
	},
}
