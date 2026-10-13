import { storySource } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseFileManager.stories'
import { expect, screen, waitFor, within } from 'storybook/test'
import { type ManagerCaseOptions, managerRender, managerSource, managerTag } from '../../shared'

const options: ManagerCaseOptions = {
	template: `
${managerTag()}
`,
}

const source = storySource(managerSource(options))

export const Operations: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Операции: менеджер сообщает о них событиями, а приложение применяет их к `items`. «Новая папка» открывает поле имени (Enter подтверждает, Escape отменяет) и шлёт `create-folder`;',
					'F2 или «Переименовать» — `rename`; Delete или «Удалить» спрашивает подтверждение (`BaseConfirm`) и шлёт `delete`; «Переместить в…» и перетаскивание на папку или в дерево — `move`; «Загрузить» — `upload`.',
					'Имя проверяется: не пустое, без `/` и `\\`, не совпадает с соседней записью без учёта регистра.',
				].join('\n'),
			},
			source,
		},
	},
	render: managerRender(options),
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Новая папка' }))
		const creator = within(canvas.getByRole('group', { name: 'Имя новой папки' })).getByRole('textbox')
		await waitFor(() => expect(creator).toHaveFocus())
		await userEvent.clear(creator)
		await userEvent.type(creator, 'Резерв{Enter}')
		await expect(await canvas.findByRole('option', { name: /^Резерв/ })).toBeVisible()
		await expect(args['onCreate-folder']).toHaveBeenCalledWith(null, 'Резерв')

		await userEvent.click(canvas.getByRole('option', { name: /^Резерв/ }))
		await userEvent.keyboard('{F2}')
		const renamer = within(await canvas.findByRole('group', { name: 'Новое имя для «Резерв»' })).getByRole('textbox')
		await waitFor(() => expect(renamer).toHaveFocus())
		await userEvent.clear(renamer)
		await userEvent.type(renamer, 'Копии{Enter}')
		await expect(await canvas.findByRole('option', { name: /^Копии/ })).toBeVisible()
		await expect(canvas.queryByRole('option', { name: /^Резерв/ })).not.toBeInTheDocument()
		await expect(args.onRename).toHaveBeenCalledWith('folder-1', 'Копии')

		await userEvent.click(canvas.getByRole('option', { name: /^Копии/ }))
		await userEvent.click(canvas.getByRole('button', { name: 'Удалить' }))
		const dialog = await screen.findByRole('alertdialog', { name: 'Удалить «Копии»?' })
		await userEvent.click(within(dialog).getByRole('button', { name: 'Удалить' }))
		await waitFor(() => expect(canvas.queryByRole('option', { name: /^Копии/ })).not.toBeInTheDocument())
		await expect(args.onDelete).toHaveBeenCalledWith(['folder-1'])
	},
}
