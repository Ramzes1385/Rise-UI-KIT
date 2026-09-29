import { expect } from 'storybook/test'
import type meta from '../../BaseMegaMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Dropdown: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`layout="dropdown"`: пункт с `children` открывает плавающую панель, вложенные уровни раскрываются каскадом вбок',
					'(панель переносится влево, если справа нет места).',
				].join('\n'),
			},
		},
	},
	args: { layout: 'dropdown' },
	play: async ({ canvas, userEvent }) => {
		const products = canvas.getByRole('button', { name: 'Продукты' })
		await userEvent.click(products)
		await expect(products).toHaveAttribute('aria-expanded', 'true')

		await userEvent.click(canvas.getByRole('button', { name: 'Аналитика' }))
		await expect(await canvas.findByRole('link', { name: 'Продажи' })).toBeVisible()
	},
}
