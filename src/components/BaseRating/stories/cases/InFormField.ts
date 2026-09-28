import { ref } from 'vue'
import { expect } from 'storybook/test'
import { starOf, pointOn } from '../shared'
import type meta from '../BaseRating.stories'
import BaseRating from '../../ui/BaseRating.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { BaseFormField } from '@components/BaseFormField'

export const InFormField: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'step'] },
		docs: {
			description: {
				story: [
					'Рейтинг в форме: подпись и описание даёт `BaseFormField`. Без `for` содержимое поля — группа с именем из подписи,',
					'описание связано с ней через `aria-describedby`.',
				].join('\n'),
			},
			source: {
				code: [
					'<BaseFormField label="Качество озвучки" description="Оцените дубляж серии от 1 до 5">',
					'  <BaseRating v-model="rating" />',
					'</BaseFormField>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseRating, BaseFormField },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'modelValue', 'onUpdate:modelValue']), rating: ref(0) }),
		template: `
			<div class="story-narrow">
				<BaseFormField label="Качество озвучки" description="Оцените дубляж серии от 1 до 5">
					<BaseRating v-bind="props" v-model="rating" />
				</BaseFormField>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const group = canvas.getByRole('group', { name: 'Качество озвучки' })
		await expect(group).toHaveAccessibleDescription('Оцените дубляж серии от 1 до 5')
		const rating = canvas.getByRole('slider')
		await expect(group).toContainElement(rating)
		const star = starOf(rating, 4)
		await userEvent.pointer({ keys: '[MouseLeft]', target: star, coords: pointOn(star) })
		await expect(rating).toHaveAttribute('aria-valuetext', '5 из 5')
	},
}
