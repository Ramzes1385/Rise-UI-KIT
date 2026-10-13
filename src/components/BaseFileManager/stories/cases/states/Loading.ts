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

export const Loading: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Загрузка (`isLoading`): вместо списка — заготовки строк, корень получает `aria-busy`, скринридер слышит «Загрузка файлов…». Приложение включает `isLoading`, пока ждёт ответа сервера.',
			},
			source,
		},
	},
	args: { isLoading: true },
	render: managerRender(options),
	play: async ({ canvas, canvasElement }) => {
		await expect(canvasElement.querySelector('.base-file-manager')).toHaveAttribute('aria-busy', 'true')
		await expect(canvas.getByText('Загрузка файлов…')).toBeInTheDocument()
		await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument()
	},
}
