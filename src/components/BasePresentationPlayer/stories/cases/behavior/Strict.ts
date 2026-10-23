import { tabTo } from '@/stories/helpers'
import { voicedSlides } from '../../shared'
import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BasePresentationPlayer.stories'

export const Strict: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`navigation="strict"` — для обязательных инструктажей: всё как в `linear`, плюс скорость не выше `maxRate`',
					'(по умолчанию 1×, в меню только 0,75× и 1×), озвучку нельзя перемотать вперёд внутри слайда, а скрытая вкладка',
					'ставит показ на паузу. Строгий учёт всё равно делает сервер — по времени событий `slide-complete`.',
					'Проверка: Tab до шкалы, Space запускает и останавливает показ, → не пускает дальше; меню скорости — до 1×.',
				].join('\n'),
			},
		},
	},
	args: {
		navigation: 'strict',
		maxRate: 1,
		slides: voicedSlides({ minDuration: 4 }),
	},
	play: async ({ canvas, userEvent, args }) => {
		const slides = canvas.getByRole('slider', { name: 'Слайды' })
		await tabTo(slides, userEvent)
		await userEvent.keyboard('{ArrowRight}')
		await expect(slides).toHaveAttribute('aria-valuetext', 'Слайд 1 из 3: Кто мы')
		await expect(args['onUpdate:slide']).not.toHaveBeenCalled()

		await userEvent.keyboard(' ')
		await expect(await canvas.findByRole('button', { name: 'Пауза' })).toBeInTheDocument()
		await expect(args.onPlay).toHaveBeenCalled()
		await userEvent.keyboard(' ')
		await expect(await canvas.findByRole('button', { name: 'Воспроизвести' })).toBeInTheDocument()

		const speed = canvas.getByRole('button', { name: 'Скорость воспроизведения' })
		await tabTo(speed, userEvent)
		await userEvent.keyboard('{Enter}')
		const menu = await canvas.findByRole('menu')
		const rates = within(menu).getAllByRole('menuitemradio')
		await expect(rates.map(item => item.textContent?.trim())).toEqual(['0,75×', '1×'])
		await userEvent.keyboard('{Escape}')
	},
}
