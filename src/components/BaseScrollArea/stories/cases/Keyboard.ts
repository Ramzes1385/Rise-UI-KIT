import { tabTo } from '@/stories/helpers'
import { waitFor, expect } from 'storybook/test'
import type meta from '../BaseScrollArea.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab ставит фокус на область, дальше её прокручивают стрелки, PageDown и End (это делает браузер —',
					'синтетические нажатия play его не вызывают, поэтому прокрутка ниже задана из кода), и полоса следует за прокруткой.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, canvasElement, userEvent }) => {
		const region = canvas.getByRole('region', { name: 'Журнал склада' })
		await waitFor(() => expect(region).toHaveAttribute('tabindex', '0'))
		await tabTo(region, userEvent)
		await userEvent.keyboard('{ArrowDown}')
		await expect(region).toHaveFocus()
		region.scrollTop = region.scrollHeight
		const thumb = canvasElement.querySelector('.base-scroll-area__thumb') as HTMLElement
		await waitFor(() => expect(parseFloat(thumb.style.top)).toBeGreaterThan(0))
		await expect(canvasElement.querySelector('.base-scroll-area')).toHaveClass('base-scroll-area--active')
	},
}
