import { setup } from './NoCertificates.setup'
import { expect, waitFor } from 'storybook/test'
import { BaseAlert } from '@components/BaseAlert'
import { BaseBadge } from '@components/BaseBadge'
import type meta from '../../useCryptoPro.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { STORY_DATE, emulate } from '../../emulation'
import setupSource from './NoCertificates.setup.ts?raw'
import { COMPOSABLES, certificatesTemplate as template } from '../../shared'
import { scriptSource, staticStorySource, useStorySetup } from '@/stories/helpers'

export const NoCertificates: StoryObj<typeof meta> = {
	beforeEach: emulate({ scenario: 'noCertificates', now: STORY_DATE }),
	parameters: {
		docs: {
			description: {
				story: [
					'Сценарий `noCertificates`: хранилище пустое. `getCertificates()` не бросает ошибку — возвращает `[]`,',
					'а в `error` кладёт код `noCertificates` с текстом из словаря.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseAlert', 'BaseBadge', 'BaseButton'],
				importsFrom: { [COMPOSABLES]: ['useCryptoPro'] },
				script: scriptSource(setupSource),
			}),
		},
	},
	render: args => ({
		components: { BaseAlert, BaseBadge, BaseButton },
		setup: useStorySetup(args, { setup }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Загрузить сертификаты' })).toHaveFocus()
		await userEvent.keyboard('{Enter}')

		await waitFor(() => expect(canvas.getByText('В личном хранилище нет сертификатов')).toBeVisible())
		await expect(canvas.queryByRole('list', { name: 'Сертификаты' })).toBeNull()
	},
}
