import { tabTo } from '@/stories/helpers'
import type meta from '../BaseDescriptions.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, within, waitFor } from 'storybook/test'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: меняйте поля и props в панели Controls. Реквизиты компании: ИНН, КПП и ОГРН копируются кнопкой рядом',
					'(Tab, затем Enter или Space), адрес занимает всю строку (`span: full`), пустой телефон — «—».',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const list = canvasElement.querySelector('dl') as HTMLElement
		await expect(list.querySelectorAll(':scope > div > dt + dd')).toHaveLength(7)
		await expect(within(list).getByText('Юридический адрес')).toBeVisible()
		const copy = canvas.getByRole('button', { name: 'Копировать: ИНН' })
		await tabTo(copy, userEvent)
		await expect(copy).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.getByRole('status')).not.toBeEmptyDOMElement())
		if (canvas.getByRole('status').textContent === 'Скопировано: ИНН') await expect(args.onCopy).toHaveBeenCalledOnce()
	},
}
