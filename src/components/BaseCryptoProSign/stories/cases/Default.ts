import { tabTo } from '@/stories/helpers'
import type meta from '../BaseCryptoProSign.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCryptoProSign from '../../ui/BaseCryptoProSign.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { expect, screen, waitFor, within } from 'storybook/test'

const MODELS = { thumbprint: 'thumbprint', detached: 'detached' } as const
const template = `<BaseCryptoProSign v-bind="args" v-model:thumbprint="thumbprint" v-model:detached="detached" />`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: подпись текста присоединённой подписью. После проверки плагина выбирается первый действующий сертификат;',
					'истёкший и без закрытого ключа видны в списке, но недоступны. С клавиатуры: Tab до «Сертификат», стрелки и Enter —',
					'выбор, Tab до «Подписать», Enter — подпись; итог «Подпись создана: act.sig» и кнопка «Скачать подпись».',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCryptoProSign'], models: MODELS }),
		},
	},
	render: args => ({
		components: { BaseCryptoProSign },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('region', { name: 'Электронная подпись' })).toBeVisible()
		const select = await canvas.findByRole('combobox', { name: 'Сертификат' })
		await waitFor(() => expect(select).toHaveTextContent('Иванов Иван Иванович'))

		await tabTo(select, userEvent)
		await userEvent.keyboard('{ArrowDown}')
		await expect(select).toHaveAttribute('aria-expanded', 'true')
		const listbox = await screen.findByRole('listbox', { name: 'Сертификат' })
		await expect(within(listbox).getAllByRole('option')).toHaveLength(4)
		await userEvent.keyboard('{ArrowDown}{Enter}')
		await expect(select).toHaveAttribute('aria-expanded', 'false')
		await expect(select).toHaveTextContent('Петров Пётр Петрович')

		const button = canvas.getByRole('button', { name: 'Подписать' })
		await tabTo(button, userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(args.onSigned).toHaveBeenCalledTimes(1))
		await expect(args.onSigned).toHaveBeenCalledWith(expect.objectContaining({ detached: false, isHash: false, fileName: 'act' }))
		await waitFor(() => expect(canvas.getAllByText('Подпись создана: act.sig')[0]).toBeVisible())
		await expect(canvas.getByRole('button', { name: 'Скачать подпись' })).toBeEnabled()
	},
}
