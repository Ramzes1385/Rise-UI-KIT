import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../BaseLink.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Песочница: ссылка на маршрут. Tab ставит на неё фокус (видно кольцо), Enter переходит по ссылке.' },
		},
	},
	play: async ({ canvas, userEvent, args }) => {
		const link = canvas.getByRole('link', { name: 'Настройки проекта' })
		await expect(link).toHaveAttribute('href', '/projects/42/settings')

		await tabTo(link, userEvent)
		await expect(getComputedStyle(link).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(args.onClick).toHaveBeenCalledOnce()
	},
}
