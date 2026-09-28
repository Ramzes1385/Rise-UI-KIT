import { ICON_BUTTON } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseChip.stories'
import BaseChip from '../../ui/BaseChip.vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'placement'] },
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`. Привычный красный счётчик — токены роли error:',
					"`{ bg: { base: 'var(--rise-error)' }, text: { base: 'var(--rise-on-error)' } }`, они меняются вместе с темой.",
					'Цвет применяется только к индикатору — кнопка в слоте остаётся своего цвета.',
				].join('\n'),
			},
			source: {
				code: `<BaseChip :content="5" :color="{ bg: { base: 'var(--rise-error)' }, text: { base: 'var(--rise-on-error)' } }">…</BaseChip>`,
			},
		},
	},
	render: args => ({
		components: { BaseChip, BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'color']) }),
		template: `
			<div class="story-row" style="gap: 32px; padding: 12px;">
				<BaseChip v-bind="props" :content="5">${ICON_BUTTON}</BaseChip>
				<BaseChip v-bind="props" :content="12" :color="{ bg: { base: 'var(--rise-error)' }, text: { base: 'var(--rise-on-error)' } }">
					${ICON_BUTTON}
				</BaseChip>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const primary = canvas.getByText('5')
		const error = canvas.getByText('12')
		await expect(error.style.getPropertyValue('--custom-bg')).toBe('var(--rise-error)')
		await expect(getComputedStyle(error).backgroundColor).not.toBe(getComputedStyle(primary).backgroundColor)
		const [plainButton, coloredButton] = canvas.getAllByRole('button')
		await expect(getComputedStyle(coloredButton).backgroundColor).toBe(getComputedStyle(plainButton).backgroundColor)
	},
}
