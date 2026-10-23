import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseImageMapEditor.stories'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Ошибка из проверки формы: текст под холстом, рамка редактора — цветом ошибки. Ошибки открытия файлов редактор показывает сам (`role="alert"`, событие `import-error`).',
			},
		},
	},
	args: { error: 'Добавьте хотя бы одну точку входа на первом этаже' },
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Добавьте хотя бы одну точку входа на первом этаже')).toBeVisible()
		await expect(canvas.getByRole('region', { name: 'Редактор карты' })).toHaveClass('base-image-map-editor--error')
	},
}
