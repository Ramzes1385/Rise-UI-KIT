import { expect } from 'storybook/test'
import type meta from '../BaseMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import type { BaseMenuItem } from '../../types/BaseMenu.types'

const DISABLED_ITEMS: BaseMenuItem[][] = [
	[
		{ label: 'Открыть', icon: 'eye-open-icon' },
		{ label: 'Опубликовать', icon: 'send', isDisabled: true },
		{ label: 'Скачать', icon: 'download' },
	],
]

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Отключённый пункт приглушён и помечен `aria-disabled`: клик, Enter и Space не вызывают `select`.' },
		},
	},
	args: { items: DISABLED_ITEMS },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Опубликовать' })).toHaveAttribute('aria-disabled', 'true')
		await expect(canvas.getByRole('button', { name: 'Скачать' })).not.toHaveAttribute('aria-disabled')
	},
}
