import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BasePresentationPlayer.stories'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Три слайда-картинки, у каждого своя озвучка (`slides[].audio`): кончилась озвучка — следующий слайд.',
					'Режим `free` — листать можно как угодно: кнопками, шкалой и клавишами.',
					'Проверка: Tab до шкалы, → и ← меняют слайд, Tab до «Следующий слайд» и Enter — следующий слайд.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const slides = canvas.getByRole('slider', { name: 'Слайды' })
		await expect(slides).toHaveAttribute('aria-valuetext', 'Слайд 1 из 3: Кто мы')

		await tabTo(slides, userEvent)
		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(slides).toHaveAttribute('aria-valuetext', 'Слайд 2 из 3: Наши ценности'))
		await userEvent.keyboard('{ArrowLeft}')
		await waitFor(() => expect(slides).toHaveAttribute('aria-valuetext', 'Слайд 1 из 3: Кто мы'))

		const next = canvas.getByRole('button', { name: 'Следующий слайд' })
		await tabTo(next, userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(slides).toHaveAttribute('aria-valuetext', 'Слайд 2 из 3: Наши ценности'))
		await expect(await canvas.findByText('Слайд 2 из 3: Наши ценности')).toHaveAttribute('role', 'status')
	},
}
