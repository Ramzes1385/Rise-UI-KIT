import { setup } from './Cancelled.setup'
import { expect, waitFor } from 'storybook/test'
import { BaseAlert } from '@components/BaseAlert'
import { BaseRadio } from '@components/BaseRadio'
import type meta from '../../useCryptoPro.stories'
import setupSource from './Cancelled.setup.ts?raw'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { STORY_DATE, emulate } from '../../emulation'
import { BaseTextarea } from '@components/BaseTextarea'
import { BaseSegmented } from '@components/BaseSegmented'
import { COMPOSABLES, signTemplate as template } from '../../shared'
import { scriptSource, staticStorySource, useStorySetup } from '@/stories/helpers'

export const Cancelled: StoryObj<typeof meta> = {
	beforeEach: emulate({ scenario: 'cancel', now: STORY_DATE, delay: 300 }),
	parameters: {
		docs: {
			description: {
				story: [
					'Сценарий `cancel`: пользователь закрыл окно ПИН-кода. `sign` отклоняется с кодом `cancelled`, текст — в `error`,',
					'текст плагина с кодом 0x8010006E — в `error.detail`. Подписи нет.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseAlert', 'BaseButton', 'BaseRadio', 'BaseSegmented', 'BaseTextarea'],
				importsFrom: { [COMPOSABLES]: ['useCryptoPro'] },
				vue: ['computed', 'onMounted', 'reactive', 'ref', 'useId'],
				script: scriptSource(setupSource),
			}),
		},
	},
	render: args => ({
		components: { BaseAlert, BaseButton, BaseRadio, BaseSegmented, BaseTextarea },
		setup: useStorySetup(args, { setup }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await waitFor(() => expect(canvas.getByRole('radio', { name: 'Иванов Иван Иванович, ООО "Ромашка"' })).toBeChecked())

		await userEvent.click(canvas.getByRole('button', { name: 'Подписать' }))
		await waitFor(() => expect(canvas.getByText('Подпись отменена')).toBeVisible())
		await expect(canvas.getByText(/0x8010006E/)).toBeVisible()
		await expect(canvas.queryByRole('textbox', { name: 'Подпись CAdES-BES, Base64' })).toBeNull()
	},
}
