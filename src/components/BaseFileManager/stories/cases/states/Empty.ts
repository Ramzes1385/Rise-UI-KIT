import { expect } from 'storybook/test'
import { storySource } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseFileManager.stories'
import { type ManagerCaseOptions, managerRender, managerSource, managerTag } from '../../shared'

const options: ManagerCaseOptions = {
	template: `
${managerTag({ isStatic: true, items: '[]' })}
`,
	isStatic: true,
}

const source = storySource(managerSource(options))

export const Empty: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Пустая папка: «Папка пуста» и подсказка создать папку или загрузить файлы (в режиме `isReadonly` подсказки нет).',
					'Своё содержимое — слот `empty` со свойствами `isSearch` и `query`.',
				].join('\n'),
			},
			source,
		},
	},
	render: managerRender(options),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByText('Папка пуста')).toBeVisible()
		await expect(canvas.getByText('Создайте папку или загрузите файлы.')).toBeVisible()
		await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument()

		await userEvent.click(canvas.getByRole('button', { name: 'Новая папка' }))
		await expect(canvas.getByRole('group', { name: 'Имя новой папки' })).toBeVisible()
		await userEvent.keyboard('{Escape}')
		await expect(canvas.queryByRole('group', { name: 'Имя новой папки' })).not.toBeInTheDocument()
	},
}
