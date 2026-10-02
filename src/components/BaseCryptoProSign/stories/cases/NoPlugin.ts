import { emulate } from '../shared'
import { tabTo } from '@/stories/helpers'
import type meta from '../BaseCryptoProSign.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'

export const NoPlugin: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Расширение браузера ответило, а плагина нет: шаг «КриптоПро ЭЦП Browser plug-in» с ошибкой, подсказка и ссылка',
					'на установку (открывается в новой вкладке). «Проверить снова» повторяет диагностику — после установки плагина',
					'страницу перезагружать не нужно. Событие `error` получает код `noPlugin`.',
				].join('\n'),
			},
		},
	},
	beforeEach: emulate({ scenario: 'noPlugin' }),
	play: async ({ canvas, userEvent, args }) => {
		const steps = await canvas.findByRole('list', { name: 'Проверяем КриптоПро' })
		await waitFor(() => expect(args.onError).toHaveBeenCalledWith(expect.objectContaining({ code: 'noPlugin' })))
		await expect(within(steps).getByText('КриптоПро ЭЦП Browser plug-in').closest('li')).toHaveTextContent('ошибка')
		await expect(canvas.getByText(/Установите КриптоПро ЭЦП Browser plug-in/)).toBeVisible()
		await expect(canvas.getByRole('link', { name: /КриптоПро/ })).toHaveAttribute(
			'href',
			'https://www.cryptopro.ru/products/cades/plugin',
		)

		const retry = canvas.getByRole('button', { name: 'Проверить снова' })
		await tabTo(retry, userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(args.onError).toHaveBeenCalledTimes(2))
		await expect(canvas.queryByRole('button', { name: 'Подписать' })).not.toBeInTheDocument()
	},
}
