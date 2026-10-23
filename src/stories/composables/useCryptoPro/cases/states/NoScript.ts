import { setup } from './NoScript.setup'
import setupSource from './NoScript.setup.ts?raw'
import { BaseAlert } from '@components/BaseAlert'
import { BaseBadge } from '@components/BaseBadge'
import type meta from '../../useCryptoPro.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { COMPOSABLES, diagnosticsTemplate as template } from '../../shared'
import { scriptSource, staticStorySource, useStorySetup } from '@/stories/helpers'

export const NoScript: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Без эмуляции и без скрипта: на странице нет `window.cadesplugin`, `scriptUrl` не передан — ошибка `noScript`.',
					'Как подключить `cadesplugin_api.js` — в описании страницы выше.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseAlert', 'BaseBadge', 'BaseButton'],
				importsFrom: { [COMPOSABLES]: ['useCryptoPro', 'type CryptoProStepId', 'type CryptoProStepState'] },

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
		await waitFor(() => expect(canvas.getByText('Не подключён скрипт cadesplugin_api.js')).toBeVisible())
		const steps = canvas.getByRole('list', { name: 'Диагностика КриптоПро' })
		await expect(within(steps).getAllByText('Ошибка')).toHaveLength(1)

		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Проверить снова' })).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.getByText('Не подключён скрипт cadesplugin_api.js')).toBeVisible())
	},
}
