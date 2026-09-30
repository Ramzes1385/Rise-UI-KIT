import type meta from '../BaseAnimation.stories'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAnimation from '../../ui/BaseAnimation.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { isOpen: false }

const template = `
	<div class="story-col story-narrow">
		<BaseButton variant="ghost" :aria-expanded="isOpen" aria-controls="delivery-details" @click="isOpen = !isOpen">
			Условия доставки
		</BaseButton>
		<BaseAnimation v-bind="args" :show="isOpen">
			<div id="delivery-details" class="story-frame">
				Доставим за 1–3 дня. Курьер позвонит за час; бесплатно при заказе от 3 000 ₽.
			</div>
		</BaseAnimation>
	</div>
`

export const Collapse: StoryObj<typeof meta> = {
	args: { name: 'collapse' },
	parameters: {
		controls: { include: ['mode'] },
		docs: {
			description: {
				story: [
					'Раскрывающийся блок (`name="collapse"`): высота плавно меняется от нуля до содержимого. Кнопка сообщает',
					'состояние через `aria-expanded` и связана с блоком через `aria-controls`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseAnimation', 'BaseButton'],
				state,
				omit: ['default', 'show', 'isGroup', 'tag'],
			}),
		},
	},
	render: args => ({
		components: { BaseAnimation, BaseButton },
		setup: useStorySetup(args, { state, slots: ['default', 'show', 'isGroup', 'tag'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const toggle = canvas.getByRole('button', { name: 'Условия доставки' })
		await expect(toggle).toHaveAttribute('aria-expanded', 'false')
		await userEvent.click(toggle)
		await expect(toggle).toHaveAttribute('aria-expanded', 'true')
		await waitFor(() => expect(canvas.getByText(/Доставим за 1–3 дня/)).toBeVisible())
		await userEvent.click(toggle)
		await waitFor(() => expect(canvas.queryByText(/Доставим за 1–3 дня/)).not.toBeInTheDocument())
	},
}
