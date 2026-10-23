import { tabTo } from '@/stories/helpers'
import { voicedSlides } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BasePresentationPlayer.stories'

export const Linear: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`navigation="linear"`: вперёд — только после прохождения слайда, назад — свободно. Слайд пройден, когда',
					'кончилась озвучка и прошло `minDuration` (здесь 6 с) — что позже; время идёт, только пока идёт показ и вкладка',
					'видна. До этого «Следующий слайд» недоступна (`aria-disabled`), вокруг неё — кольцо отсчёта, подсказка и',
					'скринридер — «Доступно через 6 с»; шкала и клавиши тоже не пускают дальше.',
					'Проверка: Tab до «Следующий слайд», Enter и → не меняют слайд, нажатие объявляет остаток времени.',
				].join('\n'),
			},
		},
	},
	args: {
		navigation: 'linear',
		slides: voicedSlides({ minDuration: 6 }),
	},
	play: async ({ canvas, userEvent, args }) => {
		const next = canvas.getByRole('button', { name: 'Следующий слайд' })
		await expect(next).toHaveAttribute('aria-disabled', 'true')
		await waitFor(() => expect(next).toHaveAccessibleDescription('Доступно через 6 с'))

		await tabTo(next, userEvent)
		await userEvent.keyboard('{Enter}')
		await userEvent.keyboard('{ArrowRight}')
		await expect(args['onUpdate:slide']).not.toHaveBeenCalled()
		await expect(canvas.getByRole('slider', { name: 'Слайды' })).toHaveAttribute('aria-valuetext', 'Слайд 1 из 3: Кто мы')
		await expect(await canvas.findByText('Доступно через 6 с', { selector: '[role="status"]' })).toBeInTheDocument()
	},
}
