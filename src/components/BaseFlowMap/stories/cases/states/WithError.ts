import { expect } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Ошибка загрузки: вместо холста — BaseResult с текстом из `error`, панели и узлы не показываются.' },
		},
	},
	args: { error: 'Сервис схем недоступен. Повторите попытку через минуту.' },
	play: async ({ canvas }) => {
		const alert = await canvas.findByRole('alert')
		await expect(alert).toHaveTextContent('Не удалось показать карту')
		await expect(alert).toHaveTextContent('Сервис схем недоступен. Повторите попытку через минуту.')
		await expect(canvas.queryByRole('graphics-document')).toBeNull()
		await expect(canvas.queryByRole('toolbar')).toBeNull()
	},
}
