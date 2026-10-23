import { expect } from 'storybook/test'
import { DISABLED_ITEMS } from '../../shared'
import type meta from '../../BaseMegaMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Отключённые: раздел с панелью «Для бизнеса» (кнопка `disabled`), раздел-ссылка «Партнёрам» (`aria-disabled`, без',
					'адреса) и ссылка «Вебинары» в открытой панели «Ресурсы». Они приглушены и не получают фокус.',
				].join('\n'),
			},
		},
	},
	args: { items: DISABLED_ITEMS, openKey: 'resources' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Для бизнеса' })).toBeDisabled()
		await expect(canvas.getByRole('link', { name: 'Партнёрам' })).toHaveAttribute('aria-disabled', 'true')
		await expect(canvas.getByRole('link', { name: /Вебинары/ })).toHaveAttribute('aria-disabled', 'true')
	},
}
