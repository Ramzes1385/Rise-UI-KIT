import { expect, waitFor } from 'storybook/test'
import { ALL_IDS, STORAGE_NAME } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCookieConsent.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseCookieConsent from '../../../ui/BaseCookieConsent.vue'

const template = `
	<div class="story-frame" style="height: 360px; background: var(--rise-bg-muted)">
		<BaseCookieConsent v-bind="args" />
	</div>
`

export const Remembered: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`storageKey="story-remembered"`: решение записывается в `localStorage` (`rise-cookie-consent:story-remembered`, JSON-массив `id`).',
					'При следующей загрузке окно не показывается, а выбор восстанавливается в `v-model` и событие `change`. Если хранилище недоступно,',
					'окно показывается при каждой загрузке. История очищает ключ до и после проверки, поэтому окно появляется при каждом открытии.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCookieConsent'] }),
		},
	},
	args: { storageKey: 'story-remembered' },
	beforeEach: () => {
		localStorage.removeItem(STORAGE_NAME)
	},
	render: args => ({
		components: { BaseCookieConsent },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		localStorage.removeItem(STORAGE_NAME)
		await userEvent.click(canvas.getByRole('button', { name: 'Принять все' }))
		await expect(JSON.parse(localStorage.getItem(STORAGE_NAME) as string)).toEqual(ALL_IDS)
		await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument())
		localStorage.removeItem(STORAGE_NAME)
	},
}
