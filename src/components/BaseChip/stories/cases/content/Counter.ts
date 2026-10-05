import type meta from '../../BaseChip.stories'
import BaseChip from '../../../ui/BaseChip.vue'
import { BaseIcon } from '@components/BaseIcon'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { count: 0 }

const template = `
	<div style="padding: 12px;">
		<BaseChip v-bind="args" :content="count" is-hidden-on-zero has-overflow :max-value="9">
			<BaseButton variant="outline" :aria-label="'Корзина, товаров: ' + count" :padding="{ x: 5, y: 5 }" @click="count++">
				<BaseIcon name="plus" />
			</BaseButton>
		</BaseChip>
	</div>
`

export const Counter: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'placement'] },
		docs: {
			description: {
				story: [
					'Счётчик корзины: число растёт по клику, пустая корзина без индикатора (`isHiddenOnZero`),',
					'больше 9 товаров — «9+». Количество продублировано в доступном имени кнопки.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseChip', 'BaseButton', 'BaseIcon'],
				state,
				omit: ['default', 'content', 'isHiddenOnZero', 'hasOverflow', 'maxValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseChip, BaseButton, BaseIcon },
		setup: useStorySetup(args, { state, slots: ['default', 'content', 'isHiddenOnZero', 'hasOverflow', 'maxValue'] }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(canvasElement.querySelector('.base-chip__badge')).toBeNull()
		const button = canvas.getByRole('button', { name: 'Корзина, товаров: 0' })
		await userEvent.click(button)
		await waitFor(() => expect(canvas.getByText('1')).toBeVisible())
		await expect(button).toHaveAccessibleName('Корзина, товаров: 1')
	},
}
