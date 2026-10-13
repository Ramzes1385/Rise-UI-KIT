import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCookieConsent.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseCookieConsent from '../../../ui/BaseCookieConsent.vue'

const template = `
	<div class="story-frame" style="height: 360px; background: var(--rise-bg-muted)">
		<BaseCookieConsent v-bind="args" />
	</div>
`

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Кастомный цвет через `color`: фон и текст окна, заголовок наследует цвет текста. Для обычных окон хватает токенов `--rise-cookie-consent-*`.',
			},
			source: storySource({ template, imports: ['BaseCookieConsent'] }),
		},
	},
	args: { color: { bg: { base: '#6d28d9' }, text: { base: '#ffffff' } } },
	render: args => ({
		components: { BaseCookieConsent },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(getComputedStyle(canvas.getByRole('dialog')).backgroundColor).toBe('rgb(109, 40, 217)')
		await expect(getComputedStyle(canvas.getByRole('heading', { name: 'Мы используем cookies' })).color).toBe('rgb(255, 255, 255)')
	},
}
