import { expect } from 'storybook/test'
import { SECTIONS, shell } from '../shared'
import type meta from '../BaseLayout.stories'
import { BaseLink } from '@components/BaseLink'
import BaseLayout from '../../ui/BaseLayout.vue'
import { BaseFooter } from '@components/BaseFooter'
import { BaseHeader } from '@components/BaseHeader'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots, tabTo } from '@/stories/helpers'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Клавиатура: первый Tab — ссылка «Перейти к содержимому», Enter переносит фокус в `<main>`, следующий Tab — в содержимое.',
			},
		},
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseLayout, BaseHeader, BaseFooter, BaseLink },
		setup: () => ({ props: useArgsWithoutSlots(args), sections: SECTIONS }),
		template: shell('<h1 style="margin-top: 0">Клиенты</h1><BaseLink href="#new">Новый клиент</BaseLink>'),
	}),
	play: async ({ canvas, userEvent }) => {
		const skipLink = canvas.getByRole('link', { name: 'Перейти к содержимому' })
		await tabTo(skipLink, userEvent)
		await expect(skipLink).toBeVisible()
		await userEvent.keyboard('{Enter}')
		await expect(canvas.getByRole('main')).toHaveFocus()
		await userEvent.tab()
		await expect(canvas.getByRole('link', { name: 'Новый клиент' })).toHaveFocus()
	},
}
