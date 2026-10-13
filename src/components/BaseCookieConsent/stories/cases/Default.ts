import { ALL_IDS } from '../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseCookieConsent.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCookieConsent from '../../ui/BaseCookieConsent.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-frame" style="height: 360px; background: var(--rise-bg-muted)">
		<BaseCookieConsent v-bind="args" />
	</div>
`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: окно в нижней части рамки (`isContained`), три категории — «Необходимые» обязательна. Меняйте props в Controls.',
					'«Принять все» сообщает `accept` со всеми `id` и закрывает окно; «Отклонить все» — только с обязательными.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCookieConsent'] }),
		},
	},
	render: args => ({
		components: { BaseCookieConsent },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('region', { name: 'Мы используем cookies' })).toBeInTheDocument()
		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Настроить' })).toHaveFocus()
		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Только выбранные' })).toHaveFocus()
		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Отклонить все' })).toHaveFocus()
		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Принять все' })).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(args.onAccept).toHaveBeenCalledWith(ALL_IDS)
		await waitFor(() => expect(canvas.queryByRole('region')).not.toBeInTheDocument())
	},
}
