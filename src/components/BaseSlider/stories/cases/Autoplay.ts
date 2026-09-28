import type meta from '../BaseSlider.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Autoplay: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Автопрокрутка каждые `autoplayInterval` мс. Останавливается, пока указатель над слайдером или фокус внутри,',
					'и отключена при системной настройке «уменьшить движение».',
				].join('\n'),
			},
		},
	},
	args: { isAutoplay: true, autoplayInterval: 3000 },
}
