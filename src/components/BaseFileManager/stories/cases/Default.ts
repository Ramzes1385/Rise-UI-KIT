import { storySource } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseFileManager.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { type ManagerCaseOptions, managerRender, managerSource, managerTag } from '../shared'

const options: ManagerCaseOptions = {
	template: `
${managerTag({ isModel: true })}
`,
	isModel: true,
}

const source = storySource(managerSource(options))

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: рабочий файловый менеджер. Приложение (здесь — `setup` примера) само применяет события `create-folder`, `rename`, `delete`, `move` и `upload` к `items`.',
					'Путь, выбор, вид, сортировка и поиск связаны с Controls через `v-model`. Двойной клик или Enter открывает папку, Backspace поднимается выше. Меняйте props в Controls.',
				].join('\n'),
			},
			source,
		},
	},
	render: managerRender(options),
	play: async ({ canvas, userEvent }) => {
		const documents = canvas.getByRole('option', { name: /^Документы/ })
		await userEvent.click(documents)
		await expect(documents).toHaveAttribute('aria-selected', 'true')

		await userEvent.keyboard('{Enter}')
		await expect(await canvas.findByRole('listbox', { name: 'Содержимое папки «Документы»' })).toBeVisible()
		await waitFor(() => expect(canvas.getByRole('option', { name: /^Договоры/ })).toHaveFocus())

		await userEvent.keyboard('{Backspace}')
		await expect(await canvas.findByRole('listbox', { name: 'Содержимое папки «Файлы»' })).toBeVisible()
	},
}
