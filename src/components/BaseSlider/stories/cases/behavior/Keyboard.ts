import { sliderNav } from '../../shared'
import type meta from '../../BaseSlider.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { tabTo, STORY_WAIT_TIMEOUT } from '@/stories/helpers'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab до стрелок (кольцо фокуса), Enter и Space листают; дальше Tab — к точкам.',
					'Пока фокус внутри слайдера, автопрокрутка стоит.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, canvasElement, userEvent }) => {
		const next = canvas.getByRole('button', { name: 'Следующий слайд' })
		await tabTo(next, userEvent)
		await expect(getComputedStyle(next).outlineStyle).toBe('solid')

		await userEvent.keyboard('{Enter}')
		await userEvent.keyboard(' ')
		await expect(sliderNav(canvasElement, 3)).toHaveAttribute('aria-current', 'true')

		await userEvent.tab()
		const firstDot = sliderNav(canvasElement, 1)
		await expect(firstDot).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(firstDot).toHaveAttribute('aria-current', 'true'), { timeout: STORY_WAIT_TIMEOUT })
	},
}
