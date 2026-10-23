import { expect } from 'storybook/test'
import type meta from '../../BaseButton.stories'
import BaseButton from '../../../ui/BaseButton.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div style="width: 220px;">
		<BaseButton v-bind="args">{{ slots.default }}</BaseButton>
	</div>
`

export const LongText: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Длинный текст обрезается многоточием: кнопка не шире контейнера (здесь — 220px).' },
			source: storySource({ template, imports: ['BaseButton'] }),
		},
	},
	args: { default: 'Сохранить изменения и отправить на согласование' },
	render: args => ({
		components: { BaseButton },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const button = canvas.getByRole('button')
		await expect(button.getBoundingClientRect().width).toBeLessThanOrEqual(220)
		await expect(button).toHaveAccessibleName('Сохранить изменения и отправить на согласование')
	},
}
