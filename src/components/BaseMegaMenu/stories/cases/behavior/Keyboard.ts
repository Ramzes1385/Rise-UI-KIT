import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseMegaMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab — на первый раздел, стрелки влево и вправо — между разделами, стрелка вниз открывает панель',
					'и ставит фокус на первую ссылку, стрелки вниз и вверх — по ссылкам, влево и вправо — по колонкам,',
					'Escape закрывает панель и возвращает фокус на раздел.',
				].join('\n'),
			},
		},
	},
	args: { trigger: 'click', openKey: undefined },
	play: async ({ canvas, userEvent }) => {
		const products = canvas.getByRole('button', { name: 'Продукты' })
		await userEvent.tab()
		await expect(products).toHaveFocus()
		await userEvent.keyboard('{ArrowRight}')
		await expect(canvas.getByRole('button', { name: 'Ресурсы' })).toHaveFocus()
		await userEvent.keyboard('{ArrowLeft}{ArrowDown}')
		await waitFor(() => expect(canvas.getByRole('link', { name: /Аналитика/ })).toHaveFocus())
		await userEvent.keyboard('{ArrowDown}')
		await expect(canvas.getByRole('link', { name: /Документы/ })).toHaveFocus()
		await userEvent.keyboard('{ArrowRight}')
		await expect(canvas.getByRole('link', { name: /Почта/ })).toHaveFocus()
		await userEvent.keyboard('{Escape}')
		await expect(products).toHaveFocus()
		await expect(products).toHaveAttribute('aria-expanded', 'false')
	},
}
