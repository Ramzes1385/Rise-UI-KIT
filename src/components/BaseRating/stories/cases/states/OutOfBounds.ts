import { expect } from 'storybook/test'
import { fillOf, starOf } from '../../shared'
import type meta from '../../BaseRating.stories'
import BaseRating from '../../../ui/BaseRating.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseRating v-bind="args" />
`

export const OutOfBounds: StoryObj<typeof meta> = {
	args: { modelValue: 7, max: 5 },
	parameters: {
		controls: { include: ['modelValue', 'max', 'step'] },
		docs: {
			description: {
				story: [
					'Оценка больше `max` показывается как `max`: все звёзды заполнены, `aria-valuenow` не выходит за `aria-valuemax`.',
					'Меньше 0 — как 0. Недопустимые пропсы заменяются с предупреждением в консоли: `step` ≤ 0 — шаг 1,',
					'дробный `max` округляется до целого числа звёзд.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseRating'] }),
		},
	},
	render: args => ({
		components: { BaseRating },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const rating = canvas.getByRole('slider', { name: 'Оценка от 0 до 5' })
		await expect(rating).toHaveAttribute('aria-valuenow', '5')
		await expect(rating).toHaveAttribute('aria-valuetext', '5 из 5')
		await expect(fillOf(starOf(rating, 4))).toBe('100%')
	},
}
