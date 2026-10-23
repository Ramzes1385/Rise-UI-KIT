import { expect } from 'storybook/test'
import BaseTag from '../../../ui/BaseTag.vue'
import type meta from '../../BaseTag.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div style="width: 200px;"><BaseTag v-bind="args" /></div>
`

export const LongContent: StoryObj<typeof meta> = {
	args: { label: 'Ожидает согласования юридическим отделом', isRemovable: true },
	parameters: {
		docs: {
			description: {
				story: 'Длинный `label` обрезается многоточием: метка не шире контейнера (здесь — 200px), кнопка удаления остаётся видна, полный текст доступен скринридеру.',
			},
			source: storySource({ template, imports: ['BaseTag'] }),
		},
	},
	render: args => ({
		components: { BaseTag },
		setup: useStorySetup(args, { slots: ['default'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const text = canvas.getByText('Ожидает согласования юридическим отделом')
		await expect(text.closest('.base-tag')?.getBoundingClientRect().width).toBeLessThanOrEqual(200)
		await expect(text.scrollWidth).toBeGreaterThan(text.clientWidth)
		await expect(canvas.getByRole('button', { name: 'Удалить метку Ожидает согласования юридическим отделом' })).toBeVisible()
	},
}
