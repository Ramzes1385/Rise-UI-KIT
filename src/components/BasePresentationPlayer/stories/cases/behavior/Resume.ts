import { tabTo } from '@/stories/helpers'
import { voicedSlides } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BasePresentationPlayer.stories'

const STORAGE_KEY = 'rise-presentation:story-course'

export const Resume: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'С `storageKey` место и пройденные слайды хранятся в браузере (`localStorage`, ключ `rise-presentation:<storageKey>`).',
					'При следующем открытии — «Продолжить со слайда N?»: пройденные слайды открыты и в режиме `linear`. Здесь',
					'сохранено: два слайда пройдены, остановились на третьем.',
					'Проверка: Tab до «Продолжить» и Enter — третий слайд.',
				].join('\n'),
			},
		},
	},
	args: {
		navigation: 'linear',
		storageKey: 'story-course',
		slides: voicedSlides({ minDuration: 6 }),
	},
	beforeEach: () => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ index: 2, completed: ['intro', 'values'] }))
		return () => localStorage.removeItem(STORAGE_KEY)
	},
	play: async ({ canvas, userEvent }) => {
		await expect(await canvas.findByText('Продолжить со слайда 3?')).toBeInTheDocument()
		const resume = canvas.getByRole('button', { name: 'Продолжить' })
		await tabTo(resume, userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() =>
			expect(canvas.getByRole('slider', { name: 'Слайды' })).toHaveAttribute('aria-valuetext', 'Слайд 3 из 3: Команда'),
		)
		await waitFor(() => expect(canvas.queryByText('Продолжить со слайда 3?')).not.toBeInTheDocument())
	},
}
