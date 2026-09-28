import { expect } from 'storybook/test'
import type meta from '../BaseLink.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Отключённая ссылка: без адреса, вне порядка Tab, `aria-disabled`; клик ничего не делает.' } },
	},
	args: { isDisabled: true },
	play: async ({ canvas, userEvent, args }) => {
		const link = canvas.getByRole('link', { name: 'Настройки проекта' })
		await expect(link).toHaveAttribute('aria-disabled', 'true')
		await expect(link).not.toHaveAttribute('href')
		await userEvent.click(link)
		await expect(args.onClick).not.toHaveBeenCalled()
	},
}
