import { stageOf } from '../../shared'
import { tabTo } from '@/stories/helpers'
import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseImageMapEditor.stories'

export const Zoom: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				story: 'Масштаб холста с клавиатуры: «Увеличить» и «Уменьшить» в группе «Масштаб» меняют ширину холста шагом 1,25 (от 1 до 4); при 1 «Уменьшить» недоступна, но остаётся в фокусе (`aria-disabled`).',
			},
		},
	},
	play: async ({ canvas, canvasElement, userEvent }) => {
		const stage = stageOf(canvasElement)
		const group = within(canvas.getByRole('group', { name: 'Масштаб' }))
		const zoomIn = group.getByRole('button', { name: 'Увеличить' })
		const zoomOut = group.getByRole('button', { name: 'Уменьшить' })
		await expect(stage.style.width).toBe('100%')
		await expect(zoomOut).toHaveAttribute('aria-disabled', 'true')

		await tabTo(zoomIn, userEvent, 30)
		await userEvent.keyboard('{Enter}')
		await expect(stage.style.width).toBe('125%')
		await userEvent.keyboard(' ')
		await expect(stage.style.width).toBe('156.25%')
		await expect(zoomOut).not.toHaveAttribute('aria-disabled')

		await userEvent.tab()
		await expect(zoomOut).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(stage.style.width).toBe('125%')
		await userEvent.keyboard('{Enter}')
		await expect(stage.style.width).toBe('100%')
		await expect(zoomOut).toHaveAttribute('aria-disabled', 'true')
		await expect(zoomOut).toHaveFocus()
	},
}
