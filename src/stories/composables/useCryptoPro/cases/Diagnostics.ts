import { emulate } from '../emulation'
import { setup } from './Diagnostics.setup'
import type meta from '../useCryptoPro.stories'
import { BaseAlert } from '@components/BaseAlert'
import { BaseBadge } from '@components/BaseBadge'
import { BaseButton } from '@components/BaseButton'
import setupSource from './Diagnostics.setup.ts?raw'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { COMPOSABLES, diagnosticsTemplate as template } from '../shared'
import { scriptSource, staticStorySource, useStorySetup } from '@/stories/helpers'

export const Diagnostics: StoryObj<typeof meta> = {
	beforeEach: emulate({ scenario: 'ready' }),
	parameters: {
		docs: {
			description: {
				story: [
					'Диагностика после монтирования, по шагам демостраницы КриптоПро: расширение → плагин → КриптоПро CSP → объекты подписи.',
					'`status.steps` — состояние каждого шага, версии плагина и CSP — из `CAdESCOM.About`. «Проверить снова» вызывает `check()`.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseAlert', 'BaseBadge', 'BaseButton'],
				importsFrom: {
					[COMPOSABLES]: ['useCryptoPro', 'type CryptoProStepId', 'type CryptoProStepState'],
				},
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
		const steps = canvas.getByRole('list', { name: 'Диагностика КриптоПро' })
		await waitFor(() => expect(within(steps).getAllByText('Готово')).toHaveLength(4))
		await expect(await canvas.findByText('Плагин 2.0.15400, КриптоПро CSP 5.0.12000')).toBeVisible()

		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Проверить снова' })).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(within(steps).getAllByText('Готово')).toHaveLength(4))
		await expect(canvas.queryByRole('alert')).toBeNull()
	},
}
