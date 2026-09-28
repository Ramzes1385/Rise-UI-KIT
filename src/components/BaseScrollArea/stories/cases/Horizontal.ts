import { waitFor, expect } from 'storybook/test'
import type meta from '../BaseScrollArea.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseScrollArea from '../../ui/BaseScrollArea.vue'

const CARDS = ['Москва', 'Казань', 'Волгоград', 'Самара', 'Пермь', 'Уфа', 'Омск', 'Томск', 'Сочи', 'Тверь']

export const Horizontal: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Горизонтальная прокрутка: карточки в ряд.' } } },
	args: { orientation: 'horizontal', ariaLabel: 'Города', scrollbar: 'always' },
	render: args => ({
		components: { BaseScrollArea },
		setup: () => ({ props: useArgsWithoutSlots(args), cards: CARDS }),
		template: `
			<BaseScrollArea v-bind="props" style="max-width: 420px">
				<ul style="display: flex; gap: 12px; margin: 0; padding: 4px 4px 16px; list-style: none; width: max-content">
					<li v-for="card in cards" :key="card" style="width: 120px; padding: 16px; border: 1px solid var(--rise-border); border-radius: 8px">{{ card }}</li>
				</ul>
			</BaseScrollArea>
		`,
	}),
	play: async ({ canvasElement }) => {
		await waitFor(() => expect(canvasElement.querySelector('.base-scroll-area__bar--x')).toBeInTheDocument())
		await expect(canvasElement.querySelector('.base-scroll-area__bar--y')).not.toBeInTheDocument()
	},
}
