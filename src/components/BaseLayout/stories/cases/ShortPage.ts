import { expect } from 'storybook/test'
import { SECTIONS, shell } from '../shared'
import type meta from '../BaseLayout.stories'
import { BaseLink } from '@components/BaseLink'
import BaseLayout from '../../ui/BaseLayout.vue'
import { BaseFooter } from '@components/BaseFooter'
import { BaseHeader } from '@components/BaseHeader'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const ShortPage: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Короткая страница: подвал всё равно внизу окна.' } } },
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseLayout, BaseHeader, BaseFooter, BaseLink },
		setup: () => ({ props: useArgsWithoutSlots(args), sections: SECTIONS }),
		template: shell('<h1 style="margin-top: 0">Отчёты</h1><p>Отчётов за сентябрь пока нет.</p>'),
	}),
	play: async ({ canvas }) => {
		const footer = canvas.getByRole('contentinfo')
		await expect(Math.round(footer.getBoundingClientRect().bottom)).toBe(window.innerHeight)
	},
}
