import { timedSlides } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { STORY_WAIT_TIMEOUT } from '@/stories/helpers'
import type meta from '../../BasePresentationPlayer.stories'

export const Skipped: StoryObj<typeof meta> = {
	name: 'Показ окончен',
	parameters: {
		docs: {
			description: {
				story: [
					'Конец показа, когда часть слайдов пропущена: в режиме `free` слайд, пролистанный кнопкой «Следующий слайд»,',
					'не считается пройденным. Экран называется «Показ окончен», а событие `complete` не приходит.',
					'Проверка: «Следующий слайд» дважды, Воспроизвести — после последнего слайда экран «Показ окончен»',
					'и «Пройдено слайдов: 1 из 3».',
				].join('\n'),
			},
		},
	},
	args: { slides: timedSlides(1) },
	play: async ({ canvas, userEvent, args }) => {
		const next = canvas.getByRole('button', { name: 'Следующий слайд' })
		await userEvent.click(next)
		await userEvent.click(next)
		await waitFor(() =>
			expect(canvas.getByRole('slider', { name: 'Слайды' })).toHaveAttribute('aria-valuetext', 'Слайд 3 из 3: Команда'),
		)

		await userEvent.click(canvas.getByRole('button', { name: 'Воспроизвести' }))
		await waitFor(() => expect(canvas.getByText('Пройдено слайдов: 1 из 3')).toBeInTheDocument(), { timeout: STORY_WAIT_TIMEOUT })
		await expect(canvas.getByText('Показ окончен')).toBeInTheDocument()
		await expect(args['onSlide-complete']).toHaveBeenCalledTimes(1)
		await expect(args.onComplete).not.toHaveBeenCalled()
	},
}
