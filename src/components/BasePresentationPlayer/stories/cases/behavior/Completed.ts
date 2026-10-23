import { tabTo } from '@/stories/helpers'
import { timedSlides } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BasePresentationPlayer.stories'

const COMPLETE_TIMEOUT = 10_000

export const Completed: StoryObj<typeof meta> = {
	name: 'Пройдено',
	parameters: {
		docs: {
			description: {
				story: [
					'Конец показа, когда пройдены все слайды: экран «Пройдено» со значком-кубком и числом пройденных слайдов,',
					'события `slide-complete` по слайдам и один `complete`. Здесь три слайда по 1 с (`duration`).',
					'Кнопка «Смотреть сначала» возвращает на первый слайд и сразу запускает показ.',
					'Проверка: Воспроизвести, дождаться экрана «Пройдено»; Tab до «Смотреть сначала» и Enter — экран закрылся.',
				].join('\n'),
			},
		},
	},
	args: { slides: timedSlides(1) },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Воспроизвести' }))
		await waitFor(() => expect(canvas.getByText('Пройдено слайдов: 3 из 3')).toBeInTheDocument(), { timeout: COMPLETE_TIMEOUT })
		await expect(canvas.getByText('Пройдено')).toBeInTheDocument()
		await waitFor(() => expect(args['onSlide-complete']).toHaveBeenCalledTimes(3), { timeout: COMPLETE_TIMEOUT })
		await waitFor(() => expect(args.onComplete).toHaveBeenCalledTimes(1), { timeout: COMPLETE_TIMEOUT })

		const replay = canvas.getByRole('button', { name: 'Смотреть сначала' })
		await tabTo(replay, userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.queryByText('Пройдено слайдов: 3 из 3')).not.toBeInTheDocument())
		await expect(canvas.getByRole('slider', { name: 'Слайды' })).toHaveAttribute('aria-valuetext', 'Слайд 1 из 3: Кто мы')
	},
}
