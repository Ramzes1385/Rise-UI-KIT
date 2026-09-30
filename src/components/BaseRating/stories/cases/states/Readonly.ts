import { expect } from 'storybook/test'
import type meta from '../../BaseRating.stories'
import BaseRating from '../../../ui/BaseRating.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { fillOf, starOf, pointOn } from '../../shared'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { rating: 'modelValue' }

const template = `
	<div class="story-row">
		<BaseRating v-bind="args" v-model="rating" />
		<span class="story-label" style="min-width: 0;">{{ rating }} · 128 отзывов</span>
	</div>
`

export const Readonly: StoryObj<typeof meta> = {
	args: { modelValue: 4.3, step: 0.1, isReadonly: true },
	parameters: {
		docs: {
			description: {
				story: [
					'Только чтение (`isReadonly`) — например, средняя оценка: дробное значение заливает часть звезды.',
					'Это изображение с оценкой в имени, а не слайдер: клик и клавиатура его не меняют.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseRating'], models }),
		},
	},
	render: args => ({
		components: { BaseRating },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const rating = canvas.getByRole('img', { name: 'Оценка 4.3 из 5' })
		await expect(rating).not.toHaveAttribute('tabindex')
		await expect(fillOf(starOf(rating, 4))).toBe('30%')

		const star = starOf(rating, 0)
		await userEvent.pointer({ keys: '[MouseLeft]', target: star, coords: pointOn(star) })
		await expect(rating).toHaveAccessibleName('Оценка 4.3 из 5')
		await expect(fillOf(starOf(rating, 4))).toBe('30%')
	},
}
