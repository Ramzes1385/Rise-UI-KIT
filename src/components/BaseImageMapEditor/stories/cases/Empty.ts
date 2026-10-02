import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseImageMapEditor.stories'

export const Empty: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Пустой редактор без `modelValue`: первая картинка или SVG станет первым этажом. Инструменты и просмотр включатся, когда появится слой.',
			},
		},
	},
	args: { modelValue: undefined },
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Откройте картинку или SVG — это будет первый этаж карты')).toBeVisible()
		await expect(canvas.getAllByRole('button', { name: 'Открыть картинку или SVG' })).toHaveLength(2)
		await expect(canvas.getByRole('radio', { name: 'Точка' })).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Просмотр' })).toBeDisabled()
	},
}
