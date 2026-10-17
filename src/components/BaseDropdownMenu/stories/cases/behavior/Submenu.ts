import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDropdownMenu.stories'
import { docsFrame, inlineKey } from '@/stories/helpers'
import { screen, within, expect, waitFor } from 'storybook/test'

export const Submenu: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			...docsFrame(320),
			description: {
				story: [
					'Подменю: стрелка вправо, Enter или Space на пункте со стрелкой открывают подменю на первом пункте, стрелка влево',
					'и Escape закрывают его и возвращают фокус на пункт. Мышью подменю открывается наведением или кликом.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Действия' }))
		const menu = await screen.findByRole('menu', { name: 'Действия' })
		const download = within(menu).getByRole('menuitem', { name: /Скачать/ })
		await expect(download).toHaveAttribute('aria-haspopup', 'menu')

		download.focus()
		await userEvent.keyboard(inlineKey('{ArrowRight}'))
		const submenu = await screen.findByRole('menu', { name: /Скачать/ })
		await waitFor(() => expect(within(submenu).getByRole('menuitem', { name: 'Видео MP4' })).toHaveFocus())
		await expect(download).toHaveAttribute('aria-expanded', 'true')

		await userEvent.keyboard(inlineKey('{ArrowLeft}'))
		await waitFor(() => expect(screen.queryByRole('menu', { name: /Скачать/ })).not.toBeInTheDocument())
		await expect(download).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		const reopened = await screen.findByRole('menu', { name: /Скачать/ })
		await userEvent.click(within(reopened).getByRole('menuitem', { name: 'Субтитры SRT' }))
		await expect(args.onSelect).toHaveBeenCalledWith(expect.objectContaining({ label: 'Субтитры SRT' }), expect.anything())
		await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
	},
}
