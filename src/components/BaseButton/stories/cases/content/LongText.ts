import { expect } from 'storybook/test'
import type meta from '../../BaseButton.stories'
import BaseButton from '../../../ui/BaseButton.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const LongText: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Длинный текст обрезается многоточием: кнопка не шире контейнера (здесь — 220px).' } } },
	args: { default: 'Сохранить изменения и отправить на согласование' },
	render: args => ({
		components: { BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args), label: args.default }),
		template: `
			<div style="width: 220px;">
				<BaseButton v-bind="props">{{ label }}</BaseButton>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const button = canvas.getByRole('button')
		await expect(button.getBoundingClientRect().width).toBeLessThanOrEqual(220)
		await expect(button).toHaveAccessibleName('Сохранить изменения и отправить на согласование')
	},
}
