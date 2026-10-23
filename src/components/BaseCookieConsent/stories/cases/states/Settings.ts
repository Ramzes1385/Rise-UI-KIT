import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCookieConsent.stories'
import BaseCookieConsent from '../../../ui/BaseCookieConsent.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const state = { selected: ['necessary'] }

const template = `
	<div class="story-stack">
		<div class="story-frame" style="height: 440px; background: var(--rise-bg-muted)">
			<BaseCookieConsent v-bind="args" v-model="selected" />
		</div>
		<p data-testid="selected">Разрешено: {{ selected.join(', ') || 'ничего' }}</p>
	</div>
`

export const Settings: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Раскрытые настройки (`isSettingsOpen`): переключатель включает категорию, выбор лежит в `v-model`.',
					'Обязательная категория включена и отключена, рядом пометка «Всегда включены». «Только выбранные» сообщает `accept` с текущим выбором.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCookieConsent'], state, omit: ['modelValue'] }),
		},
	},
	args: { isSettingsOpen: true },
	render: args => ({
		components: { BaseCookieConsent },
		setup: useStorySetup(args, { state, slots: ['modelValue'] }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const necessary = canvas.getByRole('switch', { name: 'Необходимые' })
		await expect(necessary).toBeDisabled()
		await expect(necessary).toBeChecked()
		await expect(canvas.getByText('Всегда включены')).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Свернуть настройки' })).toHaveAttribute('aria-expanded', 'true')

		const analytics = canvas.getByRole('switch', { name: 'Аналитика' })
		await tabTo(analytics, userEvent)
		await userEvent.keyboard(' ')
		await expect(analytics).toBeChecked()
		await expect(canvas.getByTestId('selected')).toHaveTextContent('Разрешено: necessary, analytics')

		await userEvent.click(canvas.getByRole('button', { name: 'Только выбранные' }))
		await expect(args.onAccept).toHaveBeenCalledWith(['necessary', 'analytics'])
		await waitFor(() => expect(canvas.queryByRole('region')).not.toBeInTheDocument())
	},
}
