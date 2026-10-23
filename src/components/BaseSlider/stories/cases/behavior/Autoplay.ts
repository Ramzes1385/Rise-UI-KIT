import type meta from '../../BaseSlider.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { tabTo, STORY_WAIT_TIMEOUT } from '@/stories/helpers'

export const Autoplay: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Автопрокрутка каждые `autoplayInterval` мс по APG Carousel. Первой в порядке Tab — кнопка «Остановить автопрокрутку»:',
					'она останавливает и снова запускает прокрутку (WCAG 2.2.2). Указатель над слайдером — временная пауза;',
					'фокус на слайде или стрелке, запуск видео и системная настройка «уменьшить движение» останавливают прокрутку до кнопки.',
					'Пока слайды листаются сами, их live-регион выключен; после остановки смена слайда озвучивается.',
				].join('\n'),
			},
		},
	},
	args: { isAutoplay: true, autoplayInterval: 3000 },
	play: async ({ canvas, canvasElement, userEvent }) => {
		const track = canvasElement.querySelector('.base-slider__track')!
		const rotation = canvas.getByRole('button', { name: /автопрокрутку/ })
		await tabTo(rotation, userEvent)
		await expect(getComputedStyle(rotation).outlineStyle).toBe('solid')

		const initialName = rotation.getAttribute('aria-label')
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(rotation.getAttribute('aria-label')).not.toBe(initialName), { timeout: STORY_WAIT_TIMEOUT })
		await userEvent.keyboard(' ')
		await waitFor(() => expect(rotation.getAttribute('aria-label')).toBe(initialName), { timeout: STORY_WAIT_TIMEOUT })

		if (initialName !== 'Запустить автопрокрутку') await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(rotation).toHaveAccessibleName('Запустить автопрокрутку'), { timeout: STORY_WAIT_TIMEOUT })
		await expect(track).toHaveAttribute('aria-live', 'polite')
	},
}
