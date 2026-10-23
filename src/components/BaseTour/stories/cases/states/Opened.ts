import { docsFrame } from '@/stories/helpers'
import type meta from '../../BaseTour.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, within, waitFor, expect } from 'storybook/test'

export const Opened: StoryObj<typeof meta> = {
	args: { isOpen: true },
	parameters: {
		docs: {
			...docsFrame(320),
			description: {
				story: [
					'Первый шаг: цель подсвечена кольцом, карточка — рядом (сторона `auto` — где больше места). Точки показывают прогресс,',
					'фокус стоит на «Далее».',
				].join('\n'),
			},
		},
	},
	play: async () => {
		const dialog = await screen.findByRole('dialog', { name: 'Новый проект' })
		const next = await within(dialog).findByRole('button', { name: 'Далее' })
		await waitFor(() => expect(next).toHaveFocus())
		await expect(within(dialog).getByText('1 / 3')).toBeInTheDocument()
	},
}
