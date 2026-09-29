import { ref } from 'vue'
import { expect } from 'storybook/test'
import type meta from '../../BaseRating.stories'
import BaseRating from '../../../ui/BaseRating.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots, tabTo } from '@/stories/helpers'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab ставит фокус на рейтинг (видно кольцо фокуса), стрелки вправо/вверх увеличивают оценку на `step`,',
					'влево/вниз — уменьшают, End — максимум, Home — 0. Каждое изменение — событие `change`.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseRating },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'modelValue', 'onUpdate:modelValue']), rating: ref(3) }),
		template: '<BaseRating v-bind="props" v-model="rating" />',
	}),
	play: async ({ canvas, userEvent, args }) => {
		const rating = canvas.getByRole('slider', { name: 'Оценка от 0 до 5' })
		await tabTo(rating, userEvent)
		await expect(getComputedStyle(rating).outlineStyle).toBe('solid')

		await userEvent.keyboard('{ArrowRight}')
		await expect(rating).toHaveAttribute('aria-valuetext', '4 из 5')
		await expect(args.onChange).toHaveBeenLastCalledWith(4)

		await userEvent.keyboard('{ArrowDown}{ArrowDown}')
		await expect(rating).toHaveAttribute('aria-valuenow', '2')

		await userEvent.keyboard('{End}')
		await expect(rating).toHaveAttribute('aria-valuenow', '5')
		await userEvent.keyboard('{Home}')
		await expect(rating).toHaveAttribute('aria-valuenow', '0')
		await expect(args.onChange).toHaveBeenLastCalledWith(0)
	},
}
