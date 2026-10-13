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

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Отключённый менеджер (`isDisabled`): ни навигации, ни поиска, ни операций — двойной клик по папке её не открывает, действий в панели нет, сама область приглушена.',
			},
			source,
		},
	},
	args: { isDisabled: true },
	render: managerRender(options),
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		await expect(canvasElement.querySelector('.base-file-manager')).toHaveClass('base-file-manager--disabled')
		await expect(canvas.getByRole('textbox', { name: 'Поиск по имени в этой папке' })).toBeDisabled()
		await expect(canvas.queryByRole('button', { name: 'Новая папка' })).not.toBeInTheDocument()

		await userEvent.dblClick(canvas.getByRole('option', { name: /^Документы/ }))
		await expect(canvas.getByRole('listbox', { name: 'Содержимое папки «Файлы»' })).toBeVisible()
		await expect(args.onOpen).not.toHaveBeenCalled()
	},
}
