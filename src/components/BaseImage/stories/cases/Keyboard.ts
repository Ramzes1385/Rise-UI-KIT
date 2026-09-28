import { GALLERY_SRCS } from '../shared'
import { tabTo } from '@/stories/helpers'
import type meta from '../BaseImage.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab до изображения (кольцо фокуса), Enter открывает просмотр с фокусом на «Закрыть»,',
					'Tab не выходит за пределы просмотра, Esc закрывает его и возвращает фокус на изображение.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	args: { zoomConfig: { hasZoom: true }, gallery: GALLERY_SRCS },
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Горы на рассвете' })
		await tabTo(trigger, userEvent)
		await expect(getComputedStyle(trigger).outlineStyle).toBe('solid')

		await userEvent.keyboard('{Enter}')
		const dialog = await screen.findByRole('dialog')
		const close = screen.getByRole('button', { name: 'Закрыть' })
		await waitFor(() => expect(close).toHaveFocus())

		await userEvent.tab()
		await expect(dialog).toContainElement(document.activeElement as HTMLElement)
		await userEvent.tab({ shift: true })
		await expect(close).toHaveFocus()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}
