import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseFileManager.stories'
import { tabTo, storySource } from '@/stories/helpers'
import { type ManagerCaseOptions, managerRender, managerSource, managerTag } from '../../shared'

const options: ManagerCaseOptions = {
	template: `
${managerTag({ isStatic: true, items: '[]' })}
`,
	isStatic: true,
}

const source = storySource(managerSource(options))

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Ошибка загрузки (`error`): вместо списка — сообщение (`role="alert"`) и кнопка «Повторить», которая шлёт событие `retry`.',
					'Приложение повторяет запрос и убирает `error`, когда данные получены.',
				].join('\n'),
			},
			source,
		},
	},
	args: { error: 'Нет связи с сервером. Проверьте подключение и повторите попытку.' },
	render: managerRender(options),
	play: async ({ canvas, userEvent, args }) => {
		const alert = canvas.getByRole('alert')
		await expect(alert).toHaveTextContent('Не удалось загрузить файлы')
		await expect(alert).toHaveTextContent('Нет связи с сервером')
		await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument()

		await tabTo(canvas.getByRole('button', { name: 'Повторить' }), userEvent, 40)
		await userEvent.keyboard('{Enter}')
		await expect(args.onRetry).toHaveBeenCalledTimes(1)
	},
}
