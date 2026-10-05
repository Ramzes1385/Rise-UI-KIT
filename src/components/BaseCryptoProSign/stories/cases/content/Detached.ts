import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCryptoProSign.stories'

export const Detached: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Отсоединённая подпись (`detached`): в файле `.sig` только подпись, документ хранится отдельно — так подписывают',
					'файлы для госсистем и ЭДО. Тип меняется переключателем «Тип подписи» и синхронизируется через `v-model:detached`.',
				].join('\n'),
			},
		},
	},
	args: { detached: true },
	play: async ({ canvas, userEvent, args }) => {
		await expect(await canvas.findByRole('radio', { name: 'Отсоединённая' })).toBeChecked()
		const button = canvas.getByRole('button', { name: 'Подписать' })
		await waitFor(() => expect(button).toBeEnabled())
		await tabTo(button, userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(args.onSigned).toHaveBeenCalledWith(expect.objectContaining({ detached: true, isHash: false })))
		await waitFor(() => expect(canvas.getAllByText('Подпись создана: act.sig')[0]).toBeVisible())
	},
}
