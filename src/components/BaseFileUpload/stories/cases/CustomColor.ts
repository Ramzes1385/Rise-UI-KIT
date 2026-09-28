import { expect } from 'storybook/test'
import type meta from '../BaseFileUpload.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { imageFile, UPLOAD_TIMEOUT } from '../shared'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет зоны через `color`: фон (с наведением) и цвет заголовка — например, под брендовую форму.',
					'Строки файлов и их кнопки цветом компонента не перекрашиваются.',
				].join('\n'),
			},
		},
	},
	args: {
		label: 'Логотип компании',
		accept: 'image/*',
		color: { bg: { base: '#f5f3ff', hover: '#ede9fe' }, text: { base: '#6d28d9' } },
	},
	play: async ({ canvas, userEvent }) => {
		const dropzone = canvas.getByRole('button', { name: /Выберите файлы/ })
		await expect(getComputedStyle(dropzone).backgroundColor).toBe('rgb(245, 243, 255)')
		await expect(getComputedStyle(canvas.getByText('Выберите файлы')).color).toBe('rgb(109, 40, 217)')
		await expect(getComputedStyle(canvas.getByText('Логотип компании')).color).not.toBe('rgb(109, 40, 217)')

		await userEvent.upload(canvas.getByLabelText('Логотип компании'), imageFile('Логотип.svg', 270))
		const remove = await canvas.findByRole('button', { name: 'Удалить Логотип.svg' })
		await expect(getComputedStyle(remove).color).not.toBe('rgb(109, 40, 217)')
		await expect(await canvas.findByText('Загружено', {}, { timeout: UPLOAD_TIMEOUT })).toBeVisible()
	},
}
