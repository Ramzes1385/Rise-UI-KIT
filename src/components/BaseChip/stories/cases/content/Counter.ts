import { ref } from 'vue'
import { expect } from 'storybook/test'
import type meta from '../../BaseChip.stories'
import BaseChip from '../../../ui/BaseChip.vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

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
			source: {
				code: [
					'<BaseChip :content="count" is-hidden-on-zero has-overflow :max-value="9">',
					'  <BaseButton variant="outline" :aria-label="`Корзина, товаров: ${count}`" @click="count++">…</BaseButton>',
					'</BaseChip>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseChip, BaseButton, BaseIcon },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'content', 'isHiddenOnZero', 'hasOverflow', 'maxValue']),
			count: ref(0),
		}),
		template: `
			<div style="padding: 12px;">
				<BaseChip v-bind="props" :content="count" is-hidden-on-zero has-overflow :max-value="9">
					<BaseButton variant="outline" :aria-label="'Корзина, товаров: ' + count" :padding="{ x: 5, y: 5 }" @click="count++">
						<BaseIcon name="plus" />
					</BaseButton>
				</BaseChip>
			</div>
		`,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(canvasElement.querySelector('.base-chip__badge')).toBeNull()
		const button = canvas.getByRole('button', { name: 'Корзина, товаров: 0' })
		await userEvent.click(button)
		await expect(canvas.getByText('1')).toBeVisible()
		await expect(button).toHaveAccessibleName('Корзина, товаров: 1')
	},
}
