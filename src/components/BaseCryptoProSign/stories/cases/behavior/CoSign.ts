import { ATTACHED_SIGNATURE } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCryptoProSign.stories'
import { expect, screen, waitFor } from 'storybook/test'
import BaseCryptoProSign from '../../../ui/BaseCryptoProSign.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const MODELS = { thumbprint: 'thumbprint' } as const
const template = `<BaseCryptoProSign v-bind="args" v-model:thumbprint="thumbprint" />`

export const CoSign: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`mode="cosign"` — вторая подпись к уже подписанному документу (`CoSignCades`, для файла больше `hashThreshold` — `CoSignHash`).',
					'Подпись, к которой добавляем, — проп `signature` (Base64) или файл в поле «Файл подписи»; документ нужен только для',
					'отсоединённой подписи. Плагин сначала проверяет прежнюю подпись, затем добавляет новую выбранным сертификатом: в `signature`',
					'события `signed` — прежний и новый подписанты, `isCoSign: true`. Здесь прежнюю подпись поставил Иванов, добавляет Петров.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCryptoProSign'], models: MODELS }),
		},
	},
	args: { mode: 'cosign', signature: ATTACHED_SIGNATURE, data: undefined, fileName: '' },
	render: args => ({
		components: { BaseCryptoProSign },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('region', { name: 'Добавление электронной подписи' })).toBeVisible()
		await expect(await canvas.findByText('Подпись для проверки получена')).toBeVisible()
		const select = await canvas.findByRole('combobox', { name: 'Сертификат' })
		await waitFor(() => expect(select).toHaveTextContent('Иванов Иван Иванович'))
		await tabTo(select, userEvent)
		await userEvent.keyboard('{ArrowDown}')
		await screen.findByRole('listbox', { name: 'Сертификат' })
		await userEvent.keyboard('{ArrowDown}{Enter}')
		await expect(select).toHaveTextContent('Петров Пётр Петрович')

		const button = canvas.getByRole('button', { name: 'Добавить подпись' })
		await tabTo(button, userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(args.onSigned).toHaveBeenCalledWith(expect.objectContaining({ isCoSign: true, detached: false })))
		await waitFor(() => expect(canvas.getAllByText('Подпись добавлена: document.sig')[0]).toBeVisible())
		await expect(canvas.getByRole('button', { name: 'Скачать подпись' })).toBeEnabled()
		await expect(args.onError).not.toHaveBeenCalled()
	},
}
