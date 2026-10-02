import { setup } from './Sign.setup'
import setupSource from './Sign.setup.ts?raw'
import type meta from '../useCryptoPro.stories'
import { expect, waitFor } from 'storybook/test'
import { BaseAlert } from '@components/BaseAlert'
import { BaseRadio } from '@components/BaseRadio'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { BaseTextarea } from '@components/BaseTextarea'
import { BaseSegmented } from '@components/BaseSegmented'
import { COMPOSABLES, signTemplate as template } from '../shared'
import { scriptSource, staticStorySource, useStorySetup } from '@/stories/helpers'

export const Sign: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`sign(data, { thumbprint, detached })` — подпись CAdES-BES в Base64. Строка подписывается как байты UTF-8, файл и',
					'двоичные данные — как есть. Присоединённая подпись содержит данные, отсоединённая — нет: её хранят вместе с документом.',
					'Просроченный сертификат и сертификат без закрытого ключа недоступны для выбора. Пока идёт подпись, `isSigning` — `true`.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseAlert', 'BaseButton', 'BaseRadio', 'BaseSegmented', 'BaseTextarea'],
				importsFrom: { [COMPOSABLES]: ['createCryptoProEmulation', 'useCryptoPro'] },
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
		await expect(canvas.getByRole('radio', { name: 'Сидорова Анна Сергеевна' })).toBeDisabled()

		await userEvent.click(canvas.getByRole('button', { name: 'Подписать' }))
		const attached = await canvas.findByRole('textbox', { name: 'Подпись CAdES-BES, Base64' })
		await expect(atob((attached as HTMLTextAreaElement).value)).toContain('detached=false')

		await userEvent.click(canvas.getByRole('radio', { name: 'Присоединённая' }))
		await userEvent.keyboard('{ArrowRight}')
		await expect(canvas.getByRole('radio', { name: 'Отсоединённая' })).toBeChecked()
		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Подписать' })).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() =>
			expect(atob((canvas.getByRole('textbox', { name: 'Подпись CAdES-BES, Base64' }) as HTMLTextAreaElement).value)).toMatch(
				/detached=true;.*content=$/,
			),
		)
	},
}
