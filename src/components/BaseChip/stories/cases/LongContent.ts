import { expect } from 'storybook/test'
import type meta from '../BaseChip.stories'
import BaseChip from '../../ui/BaseChip.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Текст вместо числа: индикатор растягивается по ширине текста и не переносит его на вторую строку.' },
		},
	},
	args: { content: 'Новое обновление' },
	render: args => ({
		components: { BaseChip, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<div style="padding: 12px 64px 12px 12px;">
				<BaseChip v-bind="props"><BaseButton variant="outline">Журнал изменений</BaseButton></BaseChip>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const badge = canvas.getByText('Новое обновление')
		const { width, height } = badge.getBoundingClientRect()
		await expect(height).toBe(18)
		await expect(width).toBeGreaterThan(height)
	},
}
