import { emulate } from '../../emulation'
import { setup } from './NoExtension.setup'
import { BaseAlert } from '@components/BaseAlert'
import { BaseBadge } from '@components/BaseBadge'
import type meta from '../../useCryptoPro.stories'
import { BaseButton } from '@components/BaseButton'
import setupSource from './NoExtension.setup.ts?raw'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { COMPOSABLES, diagnosticsTemplate as template } from '../../shared'
import { scriptSource, staticStorySource, useStorySetup } from '@/stories/helpers'

export const NoExtension: StoryObj<typeof meta> = {
	beforeEach: emulate({ scenario: 'noExtension' }),
	parameters: {
		docs: {
			story: { inline: false, height: '380px' },
			description: {
				story: [
					'Сценарий эмуляции `noExtension`: расширение для браузера не ответило (история — в своём фрейме: эмуляции соседних историй',
					'вызывают общий обработчик ответа расширения). Первый шаг — ошибка, следующие не проверялись,',
					'`status.error.code` — `noExtension`. Пользователю нужно установить и включить расширение и плагин.',
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
	play: async ({ canvas }) => {
		const steps = canvas.getByRole('list', { name: 'Диагностика КриптоПро' })
		await waitFor(() => expect(within(steps).getAllByText('Ошибка')).toHaveLength(1))
		await expect(within(steps).getAllByText('Ожидает')).toHaveLength(3)
		await expect(canvas.getByText(/Расширение КриптоПро ЭЦП Browser plug-in не отвечает/)).toBeVisible()
	},
}
