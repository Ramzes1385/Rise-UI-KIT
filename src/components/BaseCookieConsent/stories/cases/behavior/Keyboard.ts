import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCookieConsent.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseCookieConsent from '../../../ui/BaseCookieConsent.vue'

const template = `
	<div class="story-frame" style="height: 440px; background: var(--rise-bg-muted)">
		<BaseCookieConsent v-bind="args" />
	</div>
`

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab идёт по кнопкам — «Настроить», «Только выбранные», «Принять все» (окно фокус не перехватывает и не удерживает).',
					'Enter на «Настроить» раскрывает список категорий (`aria-expanded`, `aria-controls`), повторный Enter сворачивает.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCookieConsent'] }),
		},
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseCookieConsent },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const customize = canvas.getByRole('button', { name: 'Настроить' })
		await expect(customize).toHaveAttribute('aria-expanded', 'false')
		await expect(customize).not.toHaveAttribute('aria-controls')

		await userEvent.tab()
		await expect(customize).toHaveFocus()
		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Только выбранные' })).toHaveFocus()
		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Принять все' })).toHaveFocus()

		await userEvent.tab({ shift: true })
		await userEvent.tab({ shift: true })
		await expect(customize).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		const toggle = canvas.getByRole('button', { name: 'Свернуть настройки' })
		await expect(toggle).toHaveAttribute('aria-expanded', 'true')
		await expect(canvas.getByRole('group', { name: 'Категории cookies' })).toHaveAttribute(
			'id',
			toggle.getAttribute('aria-controls') as string,
		)
		await expect(toggle).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expect(canvas.getByRole('button', { name: 'Настроить' })).toHaveAttribute('aria-expanded', 'false')
		await expect(canvas.queryByRole('group', { name: 'Категории cookies' })).not.toBeInTheDocument()
	},
}
